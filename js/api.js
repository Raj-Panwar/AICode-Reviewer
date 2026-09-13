/**
 * AI Code Reviewer - Spring Boot REST API Client
 *
 * Configurable API abstraction connecting to the future Spring Boot backend.
 * Architecture: Frontend -> Spring Boot REST API -> Gemini API
 * Note: Never call Gemini directly from frontend. Spring Boot manages credentials and AI calls.
 */

// Default to Spring Boot local dev server port 8080 or window override
let API_BASE_URL =
  (typeof window !== 'undefined' && (window.API_BASE_URL || localStorage.getItem('api_base_url'))) ||
  (typeof process !== 'undefined' && process.env && process.env.VITE_API_BASE_URL) ||
  'http://localhost:8080';

const DEFAULT_TIMEOUT_MS = 12000;

export const apiClient = {
  /**
   * Get the current active API base URL
   */
  getBaseUrl() {
    return API_BASE_URL;
  },

  /**
   * Configure the API base URL dynamically (e.g. from Settings)
   */
  setBaseUrl(url) {
    if (url && typeof url === 'string') {
      API_BASE_URL = url.replace(/\/+$/, '');
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('api_base_url', API_BASE_URL);
      }
    }
  },

  /**
   * Check whether backend is reachable
   */
  async checkHealth() {
    try {
      const res = await this.get('/api/health', {}, 3000);
      return res.ok;
    } catch {
      return false;
    }
  },

  /**
   * HTTP GET Request with timeout
   */
  async get(endpoint, params = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
    const url = new URL(`${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`);
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key]);
      }
    });

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });

      clearTimeout(timer);

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { ok: true, status: response.status, data };
    } catch (err) {
      clearTimeout(timer);
      console.warn(`[API Client] GET ${endpoint} failed (${err.name === 'AbortError' ? 'Timeout' : err.message}). Fallback to local mock data.`);
      return { ok: false, error: err, isBackendOffline: true };
    }
  },

  /**
   * HTTP POST Request with timeout
   */
  async post(endpoint, body = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body),
        signal: controller.signal
      });

      clearTimeout(timer);

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { ok: true, status: response.status, data };
    } catch (err) {
      clearTimeout(timer);
      console.warn(`[API Client] POST ${endpoint} failed (${err.name === 'AbortError' ? 'Timeout' : err.message}). Fallback to local mock response.`);
      return { ok: false, error: err, isBackendOffline: true };
    }
  }
};
