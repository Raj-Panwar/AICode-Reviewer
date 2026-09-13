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
    let stored = [];
    try {
      const saved = sessionStorage.getItem('custom_reviews');
      if (saved) {
        stored = JSON.parse(saved);
      }
    } catch (e) {
      console.warn('SessionStorage read error:', e);
    }

    let results = [...stored, ...mockReviews];

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
    try {
      const saved = sessionStorage.getItem(`review_${id}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('SessionStorage lookup error:', e);
    }

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

    // Select the base mock review template matching the submitted language
    const targetLang = (submissionData.language || 'TypeScript').toLowerCase();
    const template =
      mockReviews.find((r) => r.language.toLowerCase() === targetLang) ||
      mockReviews[0];

    // Deep clone template to avoid mutating base mock data
    const newReview = JSON.parse(JSON.stringify(template));
    const newId = `REV-${Math.floor(2050 + Math.random() * 50)}`;

    newReview.id = newId;
    newReview.language = submissionData.language || template.language;
    newReview.file = submissionData.fileName || template.file;
    newReview.repository =
      submissionData.repository ||
      (submissionData.source === 'repository'
        ? submissionData.repository
        : 'local-workspace');
    newReview.branch = submissionData.branch || 'main';
    newReview.project = submissionData.fileName
      ? submissionData.fileName.replace(/\.[^/.]+$/, '')
      : (submissionData.repository || template.project);
    newReview.date = new Date().toISOString().replace('T', ' ').substring(0, 16);

    // If user provided code, bind it and evaluate basic structural signals
    if (submissionData.code && submissionData.code.trim().length > 0) {
      newReview.codeContent = submissionData.code;

      const code = submissionData.code;
      const hasNestedLoops =
        /(for|while)[^{]*\{[\s\S]*?(for|while)/.test(code) ||
        /(for|while)[^:]*:[\s\S]*?(for|while)/.test(code) ||
        /\.filter\([\s\S]*?\.indexOf\(/.test(code);

      const hasBinarySearch =
        /while\s*\([^)]*<=\s*[^)]*\)/.test(code) && /mid/.test(code);

      const hasSingleLoop =
        /(for|while|forEach|filter|map)\b/.test(code);

      if (hasNestedLoops) {
        newReview.timeComplexity = 'O(n²)';
        if (newReview.complexityAnalysis) {
          newReview.complexityAnalysis.time = 'O(n²)';
          newReview.complexityAnalysis.isOptimal = false;
        }
      } else if (hasBinarySearch) {
        newReview.timeComplexity = 'O(log n)';
        if (newReview.complexityAnalysis) {
          newReview.complexityAnalysis.time = 'O(log n)';
          newReview.complexityAnalysis.isOptimal = true;
        }
      } else if (hasSingleLoop) {
        newReview.timeComplexity = 'O(n)';
        if (newReview.complexityAnalysis) {
          newReview.complexityAnalysis.time = 'O(n)';
        }
      }
    }

    // Store in mock memory and sessionStorage for cross-page persistence
    mockReviews.unshift(newReview);
    try {
      sessionStorage.setItem(`review_${newId}`, JSON.stringify(newReview));
      const existingCustom = JSON.parse(sessionStorage.getItem('custom_reviews') || '[]');
      existingCustom.unshift(newReview);
      sessionStorage.setItem('custom_reviews', JSON.stringify(existingCustom.slice(0, 20)));
    } catch (e) {
      console.warn('Failed to persist review to sessionStorage:', e);
    }
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
