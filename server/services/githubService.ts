import { db, RepositoryEntity } from '../database/db.js';

export class GitHubService {
  /**
   * Fetches repositories for the connected user
   */
  public static async getRepositories(token?: string): Promise<RepositoryEntity[]> {
    if (token) {
      try {
        const res = await fetch('https://api.github.com/user/repos?sort=updated&per_page=10', {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'AICodeReviewer-Backend'
          }
        });
        if (res.ok) {
          const ghRepos: any[] = await res.json();
          return ghRepos.map((r) => ({
            id: `gh-${r.id}`,
            name: r.name,
            owner: r.owner?.login || 'github-user',
            defaultBranch: r.default_branch || 'main',
            language: r.language || 'Java',
            lastReviewed: 'Not reviewed yet',
            healthScore: 85,
            openIssues: r.open_issues_count || 0,
            timeComplexity: 'O(n)',
            spaceComplexity: 'O(1)',
            status: 'Active',
            branches: [r.default_branch || 'main'],
            files: []
          }));
        }
      } catch (err) {
        console.warn('[GitHubService] GitHub API query failed, using stored repositories:', err);
      }
    }
    return db.getRepositories();
  }

  public static async getRepositoryById(repoId: string, token?: string): Promise<RepositoryEntity | undefined> {
    const repos = await this.getRepositories(token);
    return repos.find((r) => r.id === repoId || r.name === repoId);
  }

  public static async getBranches(repoId: string, token?: string): Promise<string[]> {
    const repo = await this.getRepositoryById(repoId, token);
    return repo?.branches || ['main', 'develop'];
  }

  public static async getFiles(repoId: string, branch: string = 'main', token?: string) {
    const repo = await this.getRepositoryById(repoId, token);
    return repo?.files || [];
  }

  /**
   * Connect and add a repository to the user's workspace
   */
  public static connectRepository(owner: string, name: string): RepositoryEntity {
    const newRepo: RepositoryEntity = {
      id: `repo-${Date.now().toString().slice(-4)}`,
      name,
      owner,
      defaultBranch: 'main',
      language: 'Java',
      lastReviewed: 'Just now',
      healthScore: 88,
      openIssues: 0,
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      status: 'Active',
      branches: ['main', 'develop'],
      files: [
        {
          name: 'MainService.java',
          path: 'src/main/java/MainService.java',
          language: 'Java',
          size: '2.1 KB',
          code: `public class MainService {\n    public void execute() {\n        System.out.println("Service operational");\n    }\n}`
        }
      ]
    };
    return db.createRepository(newRepo);
  }
}
