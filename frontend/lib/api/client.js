/**
 * Feedback Intelligence Platform - Core HTTP API Client
 * Centralized fetch wrapper communicating with FastAPI Backend (http://localhost:8000/api/v1)
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

class ApiError extends Error {
  constructor(message, status, details = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

/**
 * Universal fetch wrapper for backend communication.
 * @param {string} endpoint - API path (e.g. "/dashboard/summary" or "/connectors/youtube/live-sync")
 * @param {RequestInit} [options] - Fetch options
 * @returns {Promise<any>} Parsed JSON response
 */
export async function apiFetch(endpoint, options = {}) {
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL.replace(/\/+$/, "")}/${endpoint.replace(/^\/+/, "")}`;

  const defaultHeaders = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
  };

  // Add timeout signal (default: 60s for deep NLP batching)
  const timeoutMs = options.timeout || 60000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  if (!config.signal) {
    config.signal = controller.signal;
  }

  try {
    const response = await fetch(url, config);
    clearTimeout(timeoutId);

    // Parse response
    const isJson = response.headers.get("content-type")?.includes("application/json");
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const errorMessage =
        (typeof data === "object" && (data.detail || data.message || data.error)) ||
        `HTTP ${response.status}: ${response.statusText}`;

      throw new ApiError(errorMessage, response.status, data);
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      throw new ApiError(`Request timed out after ${timeoutMs / 1000}s`, 408);
    }
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(error.message || "Network error communicating with backend", 0);
  }
}

export const apiGet = (endpoint, options = {}) =>
  apiFetch(endpoint, { ...options, method: "GET" });

export const apiPost = (endpoint, body, options = {}) =>
  apiFetch(endpoint, {
    ...options,
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });

export const apiPut = (endpoint, body, options = {}) =>
  apiFetch(endpoint, {
    ...options,
    method: "PUT",
    body: body ? JSON.stringify(body) : undefined,
  });

export const apiDelete = (endpoint, options = {}) =>
  apiFetch(endpoint, { ...options, method: "DELETE" });

/**
 * Health check utility
 */
export async function checkBackendHealth() {
  try {
    const res = await apiFetch("/dashboard/summary", { timeout: 3000 });
    return { ok: true, data: res };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}
