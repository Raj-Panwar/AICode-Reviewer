/**
 * AI Code Reviewer - Review Service
 *
 * Handles code submission, review analysis, review history, and complexity data.
 * Architecture:
 *   - Mock Mode: Frontend -> API Client -> Mock API (local simulation, no localhost:8080 calls)
 *   - Real Mode: Frontend -> API Client -> Spring Boot REST API (/api/reviews/*) -> Gemini API
 *
 * The same service functions work identically in both modes without any caller modification.
 */

import { apiClient } from './api.js';
import { mockApi } from './mockApi.js';

export const reviewService = {
  /**
   * Run multi-stage AI review analysis
   * Sends code analysis payload to API Client (POST /api/reviews/analyze)
   * Displays informational progressive stages to the user.
   */
  async runAnalysis(submission, onStageChange = () => {}) {
    const stages = [
      { step: 1, progress: 25, label: 'Analyzing source code structure & syntax...' },
      { step: 2, progress: 50, label: 'Checking for bugs, security vulnerabilities & null safety...' },
      { step: 3, progress: 75, label: 'Evaluating algorithmic Time & Space complexity...' },
      { step: 4, progress: 95, label: 'Generating mentor recommendations & optimized solution...' }
    ];

    // Informational loading progression for user visual feedback
    for (const stage of stages) {
      onStageChange(stage);
      await new Promise((resolve) => setTimeout(resolve, 320));
    }

    // Call API Client (routes to mockApi in mock mode or Spring Boot in real mode)
    const response = await apiClient.post('/api/reviews/analyze', submission);

    let reviewResult;

    if (response.ok && response.data) {
      reviewResult = response.data;
    } else {
      // In real mode when backend is offline, synthesize a fallback review
      console.warn('[ReviewService] Backend offline or error. Utilizing fallback review generation.');
      reviewResult = await mockApi.analyzeCode(submission);
    }

    // Persist to sessionStorage for seamless cross-page review inspection
    try {
      if (typeof sessionStorage !== 'undefined') {
        const id = reviewResult.reviewId || reviewResult.id;
        sessionStorage.setItem(`review_${id}`, JSON.stringify(reviewResult));
        const customList = JSON.parse(sessionStorage.getItem('custom_reviews') || '[]');
        if (!customList.some((r) => (r.id || r.reviewId) === id)) {
          customList.unshift(reviewResult);
          sessionStorage.setItem('custom_reviews', JSON.stringify(customList.slice(0, 30)));
        }
      }
    } catch (e) {
      console.warn('Session storage write error:', e);
    }

    onStageChange({ step: 5, progress: 100, label: 'Analysis complete!' });
    return reviewResult;
  },

  /**
   * Retrieves all reviews (with optional filtering)
   * Calls: GET /api/reviews
   */
  async getReviews(filters = {}) {
    const apiRes = await apiClient.get('/api/reviews', filters);
    if (apiRes.ok && Array.isArray(apiRes.data)) {
      return apiRes.data;
    }

    // Fallback directly to mockApi
    return await mockApi.getReviews(filters);
  },

  /**
   * Retrieves single review by ID
   * Calls: GET /api/reviews/{id}
   */
  async getReviewById(id) {
    // 1. Check active session storage first
    try {
      if (typeof sessionStorage !== 'undefined') {
        const saved = sessionStorage.getItem(`review_${id}`);
        if (saved) return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('SessionStorage lookup error:', e);
    }

    // 2. Query API Client
    const apiRes = await apiClient.get(`/api/reviews/${id}`);
    if (apiRes.ok && apiRes.data) {
      return apiRes.data;
    }

    // 3. Fallback to mockApi
    return await mockApi.getReviewById(id);
  },

  /**
   * Retrieves dashboard statistical metrics
   * Calls: GET /api/dashboard/stats
   */
  async getStats() {
    const apiRes = await apiClient.get('/api/dashboard/stats');
    if (apiRes.ok && apiRes.data) {
      return apiRes.data;
    }

    return await mockApi.getDashboardStats();
  },

  /**
   * Retrieves algorithm complexity catalog for education
   * Calls: GET /api/complexity
   */
  async getComplexityLibrary() {
    const apiRes = await apiClient.get('/api/complexity');
    if (apiRes.ok && Array.isArray(apiRes.data)) {
      return apiRes.data;
    }

    return await mockApi.getComplexityLibrary();
  }
};
