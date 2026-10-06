/**
 * AI Code Reviewer - Repository Service
 *
 * Interacts with connected GitHub repositories.
 * Architecture:
 *   - Mock Mode: Uses mockApi.js (no network requests to localhost:8080 or external GitHub)
 *   - Real Mode: Calls Spring Boot REST API (/api/repositories/*) which connects to GitHub API
 */

import { apiClient } from './api.js';
import { mockApi } from './mockApi.js';

export const repositoryService = {
  /**
   * List connected repositories
   * Calls: GET /api/repositories
   */
  async getRepositories() {
    const apiRes = await apiClient.get('/api/repositories');
    if (apiRes.ok && Array.isArray(apiRes.data)) {
      return apiRes.data;
    }
    return await mockApi.getRepositories();
  },

  /**
   * Get single repository by ID
   * Calls: GET /api/repositories/{id}
   */
  async getRepositoryById(id) {
    const apiRes = await apiClient.get(`/api/repositories/${id}`);
    if (apiRes.ok && apiRes.data) {
      return apiRes.data;
    }
    return await mockApi.getRepositoryById(id);
  },

  /**
   * Get branches for a repository
   * Calls: GET /api/repositories/{id}/branches
   */
  async getBranches(repoId) {
    const apiRes = await apiClient.get(`/api/repositories/${repoId}/branches`);
    if (apiRes.ok && Array.isArray(apiRes.data)) {
      return apiRes.data;
    }
    return await mockApi.getRepositoryBranches(repoId);
  },

  /**
   * Get files in repository branch
   * Calls: GET /api/repositories/{id}/files
   */
  async getFiles(repoId, branch = 'main') {
    const apiRes = await apiClient.get(`/api/repositories/${repoId}/files`, { branch });
    if (apiRes.ok && Array.isArray(apiRes.data)) {
      return apiRes.data;
    }
    return await mockApi.getRepositoryFiles(repoId, branch);
  }
};
