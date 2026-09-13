/**
 * Repository Service
 * Mirrors future Spring Boot endpoints:
 *   GET  /api/repositories
 *   POST /api/repositories
 */

import { apiClient } from './api.js';
import { mockRepositories } from '../data/mockData.js';

export const repositoryService = {
  /**
   * Fetches all registered repositories
   */
  async getRepositories(filters = {}) {
    await apiClient.get('/api/repositories', filters);
    let results = [...mockRepositories];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      results = results.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.owner.toLowerCase().includes(q) ||
          r.language.toLowerCase().includes(q)
      );
    }

    return results;
  },

  /**
   * Fetches single repo by ID
   */
  async getRepositoryById(id) {
    await apiClient.get(`/api/repositories/${id}`);
    return mockRepositories.find((r) => r.id === id) || mockRepositories[0];
  },

  /**
   * Registers a new connected repository
   */
  async addRepository(repoData) {
    await apiClient.post('/api/repositories', repoData);
    const newRepo = {
      id: `repo-${Date.now()}`,
      name: repoData.name,
      owner: repoData.owner || "org-connected",
      defaultBranch: repoData.branch || "main",
      language: repoData.language || "TypeScript",
      lastReviewed: "Just now",
      healthScore: 92,
      openIssues: 0,
      timeComplexity: "O(n)",
      spaceComplexity: "O(1)",
      status: "Healthy"
    };
    mockRepositories.unshift(newRepo);
    return newRepo;
  }
};
