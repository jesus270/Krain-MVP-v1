import { Redis } from "@upstash/redis";
import { RedisSessionStore } from "./redis-store";
import {
  SessionData,
  SessionOptions,
  sessionDataSchema,
  SESSION_ACTIVITY_TIMEOUT,
  MAX_LOGIN_ATTEMPTS,
  LOGIN_BLOCK_DURATION,
} from "./types";
import { log } from "@krain/utils";

export class Session {
  private store: RedisSessionStore;
  private userId: string;
  private data: SessionData;
  private isModified: boolean = false;

  constructor(
    userId: string,
    data: SessionData,
    private redis: Redis,
    private options: SessionOptions,
  ) {
    this.userId = userId;
    this.data = data;
    this.store = new RedisSessionStore(redis, options);
  }

  static async create({
    userId,
    data,
    redis,
    options,
  }: {
    userId: string;
    data: SessionData;
    redis: Redis;
    options: SessionOptions;
  }): Promise<Session> {
    const sessionData: SessionData = {
      ...data,
      isLoggedIn: true,
    };
    const session = new Session(userId, sessionData, redis, options);
    await session.save();
    return session;
  }

  static async get(
    userId: string,
    redis: Redis,
    options: SessionOptions,
  ): Promise<Session | null> {
    const store = new RedisSessionStore(redis, options);
    const data = await store.get(userId);
    if (!data) return null;

    return new Session(userId, data, redis, options);
  }

  getId(): string {
    return this.userId;
  }

  getData(): SessionData {
    return { ...this.data };
  }

  get<T extends keyof SessionData>(key: T): SessionData[T] | undefined {
    return this.data[key];
  }

  set<T extends keyof SessionData>(key: T, value: SessionData[T]): void {
    this.data[key] = value;
    this.isModified = true;
  }

  async save(): Promise<void> {
    if (!this.isModified) return;

    const now = Date.now();
    this.set("lastUpdated", now);
    await this.store.set(this.userId, this.data);
    this.isModified = false;
  }

  async generateCsrfToken(): Promise<string> {
    const array = new Uint8Array(32);
    if (typeof window === "undefined") {
      const crypto = require("crypto");
      crypto.randomFillSync(array);
    } else {
      crypto.getRandomValues(array);
    }
    const token = Array.from(array, (byte) =>
      byte.toString(16).padStart(2, "0"),
    ).join("");
    this.set("csrfToken", token);
    return token;
  }

  async destroy(): Promise<void> {
    await this.store.delete(this.userId);
  }

  // Session security methods
  async checkActivity(): Promise<boolean> {
    const lastActivity = this.get("lastActivity");

    // If lastActivity is missing, this is likely a new session or one that hasn't been properly initialized
    // Instead of destroying it, update the timestamp and continue
    if (!lastActivity) {
      log.info("Session missing lastActivity timestamp, initializing", {
        operation: "check_activity",
        entity: "SESSION",
        userId: this.userId,
      });
      this.set("lastActivity", Date.now());
      this.isModified = true;
      return true;
    }

    const timeSinceLastActivity = Date.now() - lastActivity;
    if (timeSinceLastActivity > SESSION_ACTIVITY_TIMEOUT) {
      log.info("Session expired due to inactivity", {
        operation: "check_activity",
        entity: "SESSION",
        userId: this.userId,
        lastActivity,
        timeSinceLastActivity,
        timeout: SESSION_ACTIVITY_TIMEOUT,
      });
      await this.destroy();
      return false;
    }

    this.set("lastActivity", Date.now());
    this.isModified = true;
    return true;
  }

  async checkLoginAttempts(): Promise<boolean> {
    const attempts = this.get("loginAttempts") || 0;
    const lastActivity = this.get("lastActivity") || 0;

    if (attempts >= MAX_LOGIN_ATTEMPTS) {
      if (Date.now() - lastActivity < LOGIN_BLOCK_DURATION) {
        return false;
      }
      // Reset attempts after block duration
      this.set("loginAttempts", 0);
      this.isModified = true;
    }
    return true;
  }

  incrementLoginAttempts(): void {
    this.set("loginAttempts", (this.get("loginAttempts") || 0) + 1);
    this.isModified = true;
  }

  resetLoginAttempts(): void {
    this.set("loginAttempts", 0);
    this.isModified = true;
  }

  setFingerprint(userAgent: string, ip: string): void {
    this.set("fingerprint", { userAgent, ip });
    this.isModified = true;
  }

  verifyFingerprint(userAgent: string, ip: string): boolean {
    const fingerprint = this.get("fingerprint");
    if (!fingerprint) return false;
    return fingerprint.userAgent === userAgent && fingerprint.ip === ip;
  }

  verifyCsrfToken(token: string): boolean {
    return this.get("csrfToken") === token;
  }
}
