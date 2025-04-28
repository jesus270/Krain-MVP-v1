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
import * as z from "zod";

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
    this.data = { ...data };
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
    log.info("Session.create: Start", {
      operation: "session_create_start",
      entity: "SESSION",
      userId,
    });

    // Input data should already be validated before being passed here
    const store = new RedisSessionStore(redis, options);
    // Construct the data to be saved, ensuring defaults are set
    const sessionData: SessionData = {
      ...data,
      lastActivity: Date.now(), // Always update/set lastActivity on creation
      loginAttempts: data.loginAttempts || 0, // Ensure defaults
      loginBlockedUntil: data.loginBlockedUntil || null,
      // Ensure other necessary fields have defaults if applicable
      isLoggedIn: data.isLoggedIn !== undefined ? data.isLoggedIn : true,
      csrfToken: data.csrfToken || undefined,
      fingerprint: data.fingerprint || undefined,
    };

    // Log the data being sent to store.set
    log.info("Session.create: Data prepared for store.set", {
      operation: "session_create_data_for_store",
      entity: "SESSION",
      userId,
      dataForStore: JSON.stringify(sessionData, null, 2),
      userForStore: sessionData.user
        ? JSON.stringify(sessionData.user)
        : "undefined",
      emailForStore: sessionData.user?.email
        ? JSON.stringify(sessionData.user.email)
        : "undefined",
    });

    await store.set(userId, sessionData);
    log.info("Session.create: Store set complete", {
      operation: "session_create_store_set",
      entity: "SESSION",
      userId,
    });
    const session = new Session(userId, sessionData, redis, options);
    log.info("Session.create: Finished", {
      operation: "session_create_finish",
      entity: "SESSION",
      userId,
    });
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

    log.info("Session.get: Data received from store (Zod-parsed)", {
      operation: "session_get_store_data",
      entity: "SESSION",
      userId,
      receivedData: JSON.stringify(data, null, 2),
    });

    return new Session(userId, data, redis, options);
  }

  getId(): string {
    return this.userId;
  }

  getData(): SessionData {
    // Ensure a shallow copy is returned to prevent direct modification of internal state
    return { ...this.data };
  }

  get<T extends keyof SessionData>(key: T): SessionData[T] | undefined {
    // Log the state of this.data right before returning
    log.info("Session instance get: Data state before returning value", {
      operation: "session_instance_get_before_return",
      entity: "SESSION",
      userId: this.userId,
      requestedKey: key,
      currentThisData: JSON.stringify(this.data), // Log the whole data object
    });

    return this.data[key];
  }

  set<T extends keyof SessionData>(key: T, value: SessionData[T]): void {
    this.data[key] = value;
    this.isModified = true;
  }

  async save(): Promise<void> {
    if (!this.isModified) {
      log.info("Session.save: No modifications, skipping save", {
        operation: "session_save_skip",
        entity: "SESSION",
        userId: this.userId,
      });
      return;
    }
    log.info("Session.save: Start (isModified=true)", {
      operation: "session_save_start",
      entity: "SESSION",
      userId: this.userId,
    });
    try {
      this.set("lastActivity", Date.now());
      log.info("Session.save: lastActivity updated", {
        operation: "session_save_activity_set",
        entity: "SESSION",
        userId: this.userId,
      });
      await this.store.set(this.userId, this.data); // Calls RedisSessionStore.set
      log.info("Session.save: store.set completed", {
        operation: "session_save_store_set_called",
        entity: "SESSION",
        userId: this.userId,
      });
      this.isModified = false;
      log.info("Session.save: Finished successfully", {
        operation: "session_save_finish_success",
        entity: "SESSION",
        userId: this.userId,
      });
    } catch (error) {
      log.error("Session.save: Error during save process", {
        operation: "session_save_error",
        entity: "SESSION",
        userId: this.userId,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error; // Rethrow the error
    }
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

    // Restore activity update
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

  setFingerprint(userAgent: string, ipAddress: string): void {
    this.data.fingerprint = {
      userAgent,
      ipAddress,
    };
    this.isModified = true;
  }

  verifyFingerprint(userAgent: string, ipAddress: string): boolean {
    const fingerprint = this.data.fingerprint;
    if (!fingerprint) return false;

    // If we have a userAgent but it doesn't match, this might be a session hijacking attempt
    if (fingerprint.userAgent && fingerprint.userAgent !== userAgent) {
      return false;
    }

    // If we have an IP but it doesn't match, this might be a session hijacking attempt
    // We could make this more forgiving by only comparing the first few octets
    if (fingerprint.ipAddress && fingerprint.ipAddress !== ipAddress) {
      return false;
    }

    return true;
  }

  verifyCsrfToken(token: string): boolean {
    return this.get("csrfToken") === token;
  }
}
