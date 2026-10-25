/**
 * Thin HTTP client for partner apps talking to Keel `/api/v1`.
 * Works in browser and Node 18+ (global fetch).
 */

export type KeelHttpOptions = {
  baseUrl: string;
  /** Optional partner token for future auth; demo ignores it. */
  apiKey?: string;
  fetch?: typeof fetch;
};

export type ActionBody = {
  action: string;
  [key: string]: unknown;
};

export class KeelHttpError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body: unknown,
  ) {
    super(message);
    this.name = "KeelHttpError";
  }
}

export class KeelApi {
  private readonly base: string;
  private readonly fetchImpl: typeof fetch;
  private readonly apiKey?: string;

  constructor(opts: KeelHttpOptions) {
    this.base = opts.baseUrl.replace(/\/$/, "");
    this.fetchImpl = opts.fetch ?? fetch;
    this.apiKey = opts.apiKey;
  }

  private headers(json = true): HeadersInit {
    const h: Record<string, string> = {};
    if (json) h["Content-Type"] = "application/json";
    if (this.apiKey) h["Authorization"] = `Bearer ${this.apiKey}`;
    return h;
  }

  private async req<T>(
    path: string,
    init?: RequestInit,
  ): Promise<T> {
    const res = await this.fetchImpl(`${this.base}${path}`, {
      ...init,
      headers: { ...this.headers(Boolean(init?.body)), ...init?.headers },
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg =
        typeof body === "object" &&
        body &&
        "error" in body &&
        typeof (body as { error: unknown }).error === "string"
          ? (body as { error: string }).error
          : `HTTP ${res.status}`;
      throw new KeelHttpError(msg, res.status, body);
    }
    return body as T;
  }

  health() {
    return this.req<{
      ok: boolean;
      persistence: {
        backend: string;
        supabaseConfigured: boolean;
        sessionsLoaded: number;
      };
    }>("/api/v1/health");
  }

  network() {
    return this.req<Record<string, unknown>>("/api/v1/network");
  }

  createSession(windowMs?: number) {
    return this.req<{
      sessionId: string;
      createdAt: number;
      config: unknown;
      por: unknown;
      actors: string[];
    }>("/api/v1/sessions", {
      method: "POST",
      body: JSON.stringify(windowMs !== undefined ? { windowMs } : {}),
    });
  }

  getSession(sessionId: string) {
    return this.req<Record<string, unknown>>(
      `/api/v1/sessions/${encodeURIComponent(sessionId)}`,
    );
  }

  action(sessionId: string, body: ActionBody) {
    return this.req<Record<string, unknown>>(
      `/api/v1/sessions/${encodeURIComponent(sessionId)}/actions`,
      { method: "POST", body: JSON.stringify(body) },
    );
  }

  por(sessionId: string) {
    return this.req<Record<string, unknown>>(
      `/api/v1/sessions/${encodeURIComponent(sessionId)}/por`,
    );
  }

  claims(sessionId: string) {
    return this.req<{ sessionId: string; count: number; events: unknown[] }>(
      `/api/v1/sessions/${encodeURIComponent(sessionId)}/claims`,
    );
  }

  keeperSettle(sessionId: string) {
    return this.req<Record<string, unknown>>(
      `/api/v1/sessions/${encodeURIComponent(sessionId)}/keeper/settle`,
      { method: "POST" },
    );
  }
}
