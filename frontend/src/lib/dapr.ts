/**
 * Dapr Service Invocation Client
 *
 * When running with Dapr sidecar, requests to the backend go through:
 * Frontend -> Dapr Sidecar (localhost:3501) -> Backend Dapr Sidecar -> Backend
 *
 * This provides:
 * - Automatic retry on failure
 * - Circuit breaking
 * - Distributed tracing
 * - mTLS between services
 *
 * When Dapr is not available (local dev without sidecars), falls back to direct HTTP.
 */

// Dapr sidecar HTTP port (injected by Dapr when running as sidecar)
const DAPR_HTTP_PORT = process.env.DAPR_HTTP_PORT || "3501";
const DAPR_SIDECAR_URL = `http://localhost:${DAPR_HTTP_PORT}`;

// Backend app ID in Dapr
const BACKEND_APP_ID = "taskora-backend";

// Feature flag to enable/disable Dapr invocation
const USE_DAPR_INVOCATION =
  process.env.NEXT_PUBLIC_USE_DAPR_INVOCATION === "true";

// Direct backend URL fallback
const DIRECT_BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Check if Dapr sidecar is available
 */
export function isDaprAvailable(): boolean {
  return USE_DAPR_INVOCATION && typeof process.env.DAPR_HTTP_PORT !== "undefined";
}

/**
 * Get the base URL for API requests
 * Uses Dapr service invocation when available, otherwise direct HTTP
 */
export function getApiBaseUrl(): string {
  if (isDaprAvailable()) {
    // Dapr service invocation URL format
    return `${DAPR_SIDECAR_URL}/v1.0/invoke/${BACKEND_APP_ID}/method`;
  }
  return DIRECT_BACKEND_URL;
}

/**
 * Build request headers for Dapr invocation
 */
export function getDaprHeaders(): Record<string, string> {
  if (!isDaprAvailable()) {
    return {};
  }

  return {
    // Dapr specific headers
    "dapr-app-id": BACKEND_APP_ID,
  };
}

/**
 * Invoke a backend method via Dapr service invocation
 *
 * @param method - HTTP method (GET, POST, PUT, DELETE, PATCH)
 * @param endpoint - API endpoint (e.g., "/api/tasks")
 * @param body - Request body for POST/PUT/PATCH
 * @param token - Authorization token
 */
export async function invokeBackend<T>(
  method: string,
  endpoint: string,
  body?: unknown,
  token?: string
): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...getDaprHeaders(),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers,
    credentials: "include",
  };

  if (body && ["POST", "PUT", "PATCH"].includes(method)) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData?.detail || errorData?.message || `Request failed: ${response.status}`
    );
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

/**
 * Convenience methods for common HTTP verbs
 */
export const DaprClient = {
  get: <T>(endpoint: string, token?: string) =>
    invokeBackend<T>("GET", endpoint, undefined, token),

  post: <T>(endpoint: string, body?: unknown, token?: string) =>
    invokeBackend<T>("POST", endpoint, body, token),

  put: <T>(endpoint: string, body: unknown, token?: string) =>
    invokeBackend<T>("PUT", endpoint, body, token),

  patch: <T>(endpoint: string, body?: unknown, token?: string) =>
    invokeBackend<T>("PATCH", endpoint, body, token),

  delete: <T>(endpoint: string, token?: string) =>
    invokeBackend<T>("DELETE", endpoint, undefined, token),
};

export default DaprClient;
