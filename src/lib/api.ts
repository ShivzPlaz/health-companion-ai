import { getToken } from "./auth";

/**
 * Base URL for all backend API calls.
 * Reads from the VITE_API_URL environment variable at build time,
 * falling back to localhost for local development.
 */
export const API_BASE_URL: string =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) || "http://localhost:8000";

/**
 * Thin wrapper around `fetch` that:
 * - Prepends `API_BASE_URL`
 * - Auto-attaches the Bearer token when available
 * - Sets JSON content-type for non-GET requests when body is provided
 *
 * Returns the raw `Response` so callers can check status, parse JSON, etc.
 */
export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers = new Headers(options.headers);

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (options.body && typeof options.body === "string" && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(`${API_BASE_URL}${path}`, { ...options, headers });
}
