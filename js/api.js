/**
 * AI Code Reviewer - Unified API Client & Mode Switcher
 *
 * Single configuration point for API routing:
 *   - "mock" (DEFAULT): Pure client-side simulation via mockApi.js.
 *     NO network calls to localhost:8080 are made. Zero connection errors in Live Server.
 *   - "real": Connects to the future Spring Boot REST backend (default: http://localhost:8080),
 *     which in turn orchestrates the Gemini 2.5 API securely server-side.
 *
 * Architecture:
 *   MOCK MODE (Active by default):
 *     Frontend -> API Client (apiClient) -> Mock API (mockApi.js) -> Mock JSON / Datasets
 *
 *   REAL API MODE (Future Backend):
 *     Frontend -> API Client (apiClient) -> Spring Boot (localhost:8080) -> Gemini API
 */

import { mockApi } from './mockApi.js';

// Central API Configuration Constants
const STORAGE_KEY_MODE = 'api_mode';
const STORAGE_KEY_BASE_URL = 'api_base_url';
const STORAGE_KEY_DELAY = 'mock_network_delay';
const STORAGE_KEY_SIMULATE_ERR = 'mock_simulate_error';

// Determine initial mode: Defaults strictly to 'mock'
let API_MODE =
  (typeof window !== 'undefined' &&
    (localStorage.getItem(STORAGE_KEY_MODE) || window.API_MODE)) ||
  'mock';

// Centralized Backend URL for future Spring Boot service
let API_BASE_URL =
  (typeof window !== 'undefined' &&
    (localStorage.getItem(STORAGE_KEY_BASE_URL) || window.API_BASE_URL)) ||
  'http://localhost:8080';

const DEFAULT_TIMEOUT_MS = 12000;

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
   * Get the centralized Spring Boot API base URL
   */
  getBaseUrl() {
    return API_BASE_URL;
  },

  /**
   * Configure the backend base URL (used only in 'real' mode)
   */
  setBaseUrl(url) {
    if (url && typeof url === 'string') {
      API_BASE_URL = url.trim().replace(/\/+$/, '');
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_BASE_URL, API_BASE_URL);
      }
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
      // In Mock Mode, return instant success without making ANY network requests
      return {
        ok: true,
        mode: 'mock',
        status: 200,
        message: 'Mock API is fully operational. Standalone frontend mode active.'
      };
    }

    // In Real Mode, query Spring Boot backend on configured port
    try {
      const res = await this.get('/api/health', {}, 3500);
      return {
        ok: res.ok,
        mode: 'real',
        status: res.status,
        message: res.ok
          ? `Connected to Spring Boot backend at ${API_BASE_URL}`
          : `Failed to connect to Spring Boot backend at ${API_BASE_URL}`
      };
    } catch {
      return {
        ok: false,
        mode: 'real',
        message: `Spring Boot backend unreachable at ${API_BASE_URL}`
      };
    }
  },

  /**
   * HTTP GET Request
   * Routes to mockApi in 'mock' mode; uses fetch() only in 'real' mode.
   */
  async get(endpoint, params = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
    // 1. MOCK MODE: Route directly to Mock API (DO NOT touch localhost:8080)
    if (this.isMockMode()) {
      return await mockApi.get(endpoint, params);
    }

    // 2. REAL MODE: Execute real HTTP request to Spring Boot backend
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
   * Routes to mockApi in 'mock' mode; uses fetch() only in 'real' mode.
   */
  async post(endpoint, body = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
    // 1. MOCK MODE: Route directly to Mock API (DO NOT touch localhost:8080)
    if (this.isMockMode()) {
      return await mockApi.post(endpoint, body);
    }

    // 2. REAL MODE: Execute real HTTP request to Spring Boot backend
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
      return { ok: true, status: response.status, data, isMock: false };
    } catch (err) {
      clearTimeout(timer);
      console.warn(
        `[API Client] Real backend POST ${endpoint} failed (${err.name === 'AbortError' ? 'Timeout' : err.message}).`
      );
      return { ok: false, error: err, isBackendOffline: true, isMock: false };
    }
  }
};
