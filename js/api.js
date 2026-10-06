/**
 * AI Code Reviewer - Unified API Client & Mode Switcher
 *
 * Single configuration point for API routing:
 *   - "real" (DEFAULT): Connects directly to backend REST endpoints (/api/*),
 *     which securely orchestrates Gemini AI and database operations.
 *   - "mock": Optional developer simulation via mockApi.js for offline testing.
 *
 * Architecture:
 *   REAL API MODE (Default & Active):
 *     Frontend -> API Client (apiClient) -> Backend REST API (/api/*) -> Gemini AI + JSON DB
 *
 *   MOCK MODE (Developer Simulation):
 *     Frontend -> API Client (apiClient) -> Mock API (mockApi.js) -> Mock JSON / Datasets
 */
import { mockApi } from './mockApi.js';

// Central API Configuration Constants
const STORAGE_KEY_MODE = 'api_mode';
const STORAGE_KEY_BASE_URL = 'api_base_url';
const STORAGE_KEY_DELAY = 'mock_network_delay';
const STORAGE_KEY_SIMULATE_ERR = 'mock_simulate_error';
const STORAGE_KEY_TOKEN = 'auth_token';

// Determine initial mode: Defaults to 'real' backend mode
let API_MODE =
  (typeof window !== 'undefined' &&
    (localStorage.getItem(STORAGE_KEY_MODE) || window.API_MODE)) ||
  'real';

// In browser, relative URL "" routes to current host/port seamlessly
let API_BASE_URL =
  (typeof window !== 'undefined' &&
    (localStorage.getItem(STORAGE_KEY_BASE_URL) || window.API_BASE_URL)) ||
  '';

const DEFAULT_TIMEOUT_MS = 30000;

// Initialize mock API delay & error simulation from storage if available
if (typeof window !== 'undefined') {
  const savedDelay = localStorage.getItem(STORAGE_KEY_DELAY);
  if (savedDelay) mockApi.setDelay(parseInt(savedDelay, 10));
  const savedErr = localStorage.getItem(STORAGE_KEY_SIMULATE_ERR);
  if (savedErr) mockApi.setSimulateError(savedErr === 'true');
}

export const apiClient = {
  /**
   * Get current API operational mode ('mock' | 'real')
   */
  getMode() {
    return API_MODE;
  },

  /**
   * Set API operational mode ('mock' | 'real')
   */
  setMode(mode) {
    if (mode === 'mock' || mode === 'real') {
      API_MODE = mode;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_MODE, mode);
      }
      console.info(`[API Client] Active API mode switched to: "${API_MODE.toUpperCase()}"`);
    } else {
      console.warn(`[API Client] Unknown mode "${mode}". Supported: "mock", "real"`);
    }
  },

  /**
   * Helper to check if currently in mock mode
   */
  isMockMode() {
    return API_MODE === 'mock';
  },

  /**
   * Get the backend API base URL
   */
  getBaseUrl() {
    return API_BASE_URL;
  },

  /**
   * Configure the backend base URL (used only in 'real' mode)
   */
  setBaseUrl(url) {
    if (typeof url === 'string') {
      API_BASE_URL = url.trim().replace(/\/+$/, '');
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_BASE_URL, API_BASE_URL);
      }
    }
  },

  /**
   * Retrieve stored auth token
   */
  getToken() {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(STORAGE_KEY_TOKEN) || '';
    }
    return '';
  },

  /**
   * Set stored auth token
   */
  setToken(token) {
    if (typeof localStorage !== 'undefined') {
      if (token) localStorage.setItem(STORAGE_KEY_TOKEN, token);
      else localStorage.removeItem(STORAGE_KEY_TOKEN);
    }
  },

  /**
   * Developer helper: toggle simulated mock errors for testing error UI
   */
  setSimulateError(enable) {
    mockApi.setSimulateError(enable);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_SIMULATE_ERR, String(enable));
    }
  },

  isSimulateError() {
    return mockApi.isSimulateError();
  },

  /**
   * Developer helper: set mock network latency in milliseconds
   */
  setNetworkDelay(ms) {
    mockApi.setDelay(ms);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_DELAY, String(ms));
    }
  },

  getNetworkDelay() {
    return mockApi.getDelay();
  },

  /**
   * Check whether the active API endpoint is operational
   */
  async checkHealth() {
    if (this.isMockMode()) {
      return {
        ok: true,
        mode: 'mock',
        status: 200,
        message: 'Mock API is fully operational. Standalone frontend mode active.'
      };
    }

    try {
      const res = await this.get('/api/health', {}, 6000);
      return {
        ok: res.ok,
        mode: 'real',
        status: res.status,
        message: res.ok
          ? `Connected to AI Code Reviewer backend`
          : `Failed to connect to AI Code Reviewer backend`
      };
    } catch {
      return {
        ok: false,
        mode: 'real',
        message: `Backend unreachable at ${API_BASE_URL || window.location.origin}`
      };
    }
  },

  /**
   * HTTP GET Request
   */
  async get(endpoint, params = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
    if (this.isMockMode()) {
      return await mockApi.get(endpoint, params);
    }

    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const fullUrl = `${API_BASE_URL}${cleanEndpoint}`;
    const url = new URL(fullUrl, typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key]);
      }
    });

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    };
    const token = this.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers,
        signal: controller.signal
      });
      clearTimeout(timer);

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson?.error?.message || `HTTP Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { ok: true, status: response.status, data, isMock: false };
    } catch (err) {
      clearTimeout(timer);
      console.warn(
        `[API Client] Real backend GET ${endpoint} failed (${err.name === 'AbortError' ? 'Timeout' : err.message}).`
      );
      return { ok: false, error: err, isBackendOffline: true, isMock: false };
    }
  },

  /**
   * HTTP POST Request
   */
  async post(endpoint, body = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
    if (this.isMockMode()) {
      return await mockApi.post(endpoint, body);
    }

    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const fullUrl = `${API_BASE_URL}${cleanEndpoint}`;
    const url = new URL(fullUrl, typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    };
    const token = this.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: controller.signal
      });
      clearTimeout(timer);

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson?.error?.message || `HTTP Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { ok: true, status: response.status, data, isMock: false };
    } catch (err) {
      clearTimeout(timer);
      console.warn(
        `[API Client] Real backend POST ${endpoint} failed (${err.name === 'AbortError' ? 'Timeout' : err.message}).`
      );
      return { ok: false, error: err, isBackendOffline: true, isMock: false };
    }
  },

  /**
   * HTTP DELETE Request
   */
  async delete(endpoint, timeoutMs = DEFAULT_TIMEOUT_MS) {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const fullUrl = `${API_BASE_URL}${cleanEndpoint}`;
    const url = new URL(fullUrl, typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    };
    const token = this.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const response = await fetch(url.toString(), {
        method: 'DELETE',
        headers,
        signal: controller.signal
      });
      clearTimeout(timer);

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson?.error?.message || `HTTP Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { ok: true, status: response.status, data, isMock: false };
    } catch (err) {
      clearTimeout(timer);
      return { ok: false, error: err, isBackendOffline: true, isMock: false };
    }
  }
};
