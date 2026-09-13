/**
 * AI Code Reviewer - Repository Service
 *
 * Interacts with connected GitHub repositories via Spring Boot REST API.
 * Calls:
 *   GET /api/repositories
 *   GET /api/repositories/{id}
 *   GET /api/repositories/{id}/branches
 *   GET /api/repositories/{id}/files
 * Falls back to /json/mock-repositories.json when Spring Boot backend is offline.
 */

import { apiClient } from './api.js';

let cachedMockRepos = null;

async function fetchJson(path) {
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[RepositoryService] Failed to load ${path}:`, err);
    return null;
  }
}

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

    if (!cachedMockRepos) {
      cachedMockRepos = (await fetchJson('/json/mock-repositories.json')) || [];
    }
    return cachedMockRepos;
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

    if (!cachedMockRepos) {
      cachedMockRepos = (await fetchJson('/json/mock-repositories.json')) || [];
    }
    return cachedMockRepos.find((r) => r.id === id) || cachedMockRepos[0] || null;
  },

  /**
   * Get branches for a repository
   */
  async getBranches(repoId) {
    const repo = await this.getRepositoryById(repoId);
    return repo ? repo.branches || ['main'] : ['main'];
  },

  /**
   * Get files in repository branch
   */
  async getFiles(repoId, branch = 'main') {
    const repo = await this.getRepositoryById(repoId);
    return repo ? repo.files || [] : [];
  }
};
