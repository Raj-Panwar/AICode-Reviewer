/**
 * Review Service
 * Boundaries for code reviews and analysis operations.
 * Mirrors future Spring Boot endpoints:
 *   GET  /api/reviews
 *   GET  /api/reviews/{id}
 *   POST /api/reviews
 *   POST /api/reviews/analyze
 *   GET  /api/complexity/{reviewId}
 */

import { apiClient } from './api.js';
import { mockReviews, mockStats, mockComplexityLibrary } from '../data/mockData.js';

export const reviewService = {
  /**
   * Fetches all reviews with optional filtering
   */
  async getReviews(filters = {}) {
    await apiClient.get('/api/reviews', filters);
    let results = [...mockReviews];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      results = results.filter(
        (r) =>
          r.project.toLowerCase().includes(q) ||
          r.repository.toLowerCase().includes(q) ||
          r.file.toLowerCase().includes(q) ||
          r.language.toLowerCase().includes(q)
      );
    }

    if (filters.language && filters.language !== 'All') {
      results = results.filter((r) => r.language.toLowerCase() === filters.language.toLowerCase());
    }

    if (filters.status && filters.status !== 'All') {
      results = results.filter((r) => r.status.toLowerCase() === filters.status.toLowerCase());
    }

    return results;
  },

  /**
   * Fetches single review by ID
   */
  async getReviewById(id) {
    await apiClient.get(`/api/reviews/${id}`);
    const found = mockReviews.find((r) => r.id === id);
    if (!found) {
      // Return primary featured review as fallback
      return mockReviews[0];
    }
    return found;
  },

  /**
   * Simulates running the multi-stage AI Code Reviewer pipeline
   * Stages:
   * 1. Reading source code
   * 2. Analyzing structure
   * 3. Checking for bugs
   * 4. Analyzing security
   * 5. Calculating complexity
   * 6. Evaluating code quality
   * 7. Generating recommendations
   */
  async runAnalysis(submissionData, onProgress = () => {}) {
    const stages = [
      { step: 1, label: "Reading source code & parsing AST syntax tokens...", progress: 15 },
      { step: 2, label: "Analyzing control flow structure & call graphs...", progress: 30 },
      { step: 3, label: "Checking for edge-case logical bugs & null safety...", progress: 48 },
      { step: 4, label: "Analyzing security vulnerabilities & data sanitation...", progress: 62 },
      { step: 5, label: "Calculating time & space complexity metrics...", progress: 78 },
      { step: 6, label: "Evaluating code quality, maintainability & conventions...", progress: 90 },
      { step: 7, label: "Generating mentor recommendations & before/after fixes...", progress: 100 }
    ];

    for (const stage of stages) {
      onProgress(stage);
      // Realistic cadence for each stage (400ms - 600ms)
      await new Promise((res) => setTimeout(res, 450));
    }

    // Call simulated POST endpoint
    await apiClient.post('/api/reviews/analyze', submissionData);

    // Generate new review ID
    const newId = `REV-${Math.floor(2050 + Math.random() * 50)}`;
    const newReview = {
      ...mockReviews[0],
      id: newId,
      project: submissionData.fileName || "Submitted Analysis",
      file: submissionData.fileName || "src/review.ts",
      language: submissionData.language || "TypeScript",
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      overallScore: Math.floor(82 + Math.random() * 12)
    };

    // Store in mock memory
    mockReviews.unshift(newReview);
    return newReview;
  },

  /**
   * Fetches complexity breakdown for a review
   */
  async getComplexityDetails(reviewId) {
    await apiClient.get(`/api/complexity/${reviewId}`);
    const review = await this.getReviewById(reviewId);
    return review.complexityAnalysis;
  },

  /**
   * Fetches dashboard metric stats
   */
  async getStats() {
    await apiClient.get('/api/dashboard/stats');
    return mockStats;
  },

  /**
   * Fetches algorithm complexity comparison library
   */
  async getComplexityLibrary() {
    await apiClient.get('/api/complexity/library');
    return mockComplexityLibrary;
  }
};
