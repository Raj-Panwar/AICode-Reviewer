/**
 * API Service Abstraction Layer
 * Structured to mirror future Spring Boot REST API calls.
 * UI components must ONLY interact through this service layer.
 */

const SIMULATED_LATENCY_MS = 180;

export const apiClient = {
  /**
   * Generic GET request simulator
   */
  async get(endpoint, params = {}) {
    await new Promise((resolve) => setTimeout(resolve, SIMULATED_LATENCY_MS));
    console.debug(`[API] GET ${endpoint}`, params);
    return {
      status: 200,
      ok: true,
      data: null // Handled in domain services
    };
  },

  /**
   * Generic POST request simulator
   */
  async post(endpoint, body = {}) {
    await new Promise((resolve) => setTimeout(resolve, SIMULATED_LATENCY_MS));
    console.debug(`[API] POST ${endpoint}`, body);
    return {
      status: 201,
      ok: true,
      data: null
    };
  }
};
