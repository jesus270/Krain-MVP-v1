import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

export class IronSessionCookieStore {
  private cookieHeaders: string[] = [];

  constructor(private cookieStore: ReadonlyRequestCookies) {}

  get(name: string) {
    const cookie = this.cookieStore.get(name);
    return cookie ? { name: cookie.name, value: cookie.value } : undefined;
  }

  set(name: string, value: string, cookie?: Partial<ResponseCookie>): void;
  set(options: ResponseCookie): void;
  set(
    nameOrOptions: string | ResponseCookie,
    value?: string,
    cookieOptions?: Partial<ResponseCookie>,
  ) {
    if (typeof nameOrOptions === "string") {
      const cookieValue = `${nameOrOptions}=${value || ""}`;
      const cookieString = cookieOptions
        ? `${cookieValue}; ${Object.entries(cookieOptions)
            .map(([key, val]) => `${key}=${val}`)
            .join("; ")}`
        : cookieValue;
      this.cookieHeaders.push(cookieString);
    } else {
      const { name, value, ...options } = nameOrOptions;
      const cookieString = `${name}=${value}; ${Object.entries(options)
        .map(([key, val]) => `${key}=${val}`)
        .join("; ")}`;
      this.cookieHeaders.push(cookieString);
    }
  }

  destroy(name: string) {
    const cookieString = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    this.cookieHeaders.push(cookieString);
  }

  // Get all cookie headers that need to be set
  getCookieHeaders(): string[] {
    return this.cookieHeaders;
  }
}
