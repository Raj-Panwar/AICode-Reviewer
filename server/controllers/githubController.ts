import { ServerResponse } from 'http';
import { AuthenticatedRequest, sendJson, sendError } from '../middleware/authMiddleware.js';
import { GitHubService } from '../services/githubService.js';

export class GitHubController {
  public static async listRepositories(req: AuthenticatedRequest, res: ServerResponse) {
    try {
      const repos = await GitHubService.getRepositories(req.user?.githubAccessToken);
      return sendJson(res, 200, repos);
    } catch (err: any) {
      return sendError(res, 500, 'GITHUB_ERROR', err.message);
    }
  }

  public static async getRepository(req: AuthenticatedRequest, res: ServerResponse, id: string) {
    try {
      const repo = await GitHubService.getRepositoryById(id, req.user?.githubAccessToken);
      if (!repo) {
        return sendError(res, 404, 'NOT_FOUND', `Repository "${id}" not found.`);
      }
      return sendJson(res, 200, repo);
    } catch (err: any) {
      return sendError(res, 500, 'GITHUB_ERROR', err.message);
    }
  }

  public static async getBranches(req: AuthenticatedRequest, res: ServerResponse, id: string) {
    try {
      const branches = await GitHubService.getBranches(id, req.user?.githubAccessToken);
      return sendJson(res, 200, branches);
    } catch (err: any) {
      return sendError(res, 500, 'GITHUB_ERROR', err.message);
    }
  }

  public static async getFiles(req: AuthenticatedRequest, res: ServerResponse, id: string, query: URLSearchParams) {
    try {
      const branch = query.get('branch') || 'main';
      const files = await GitHubService.getFiles(id, branch, req.user?.githubAccessToken);
      return sendJson(res, 200, files);
    } catch (err: any) {
      return sendError(res, 500, 'GITHUB_ERROR', err.message);
    }
  }

  public static async connectRepository(req: AuthenticatedRequest, res: ServerResponse) {
    const { name, owner } = req.body || {};
    if (!name) {
      return sendError(res, 400, 'INVALID_REQUEST', 'Repository name is required.');
    }
    const repo = GitHubService.connectRepository(owner || 'github-user', name);
    return sendJson(res, 201, { success: true, repository: repo });
  }

  public static async auth(req: AuthenticatedRequest, res: ServerResponse) {
    const clientId = process.env.GITHUB_CLIENT_ID || 'dummy_client_id';
    const redirectUri = `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}/api/github/callback`;
    const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=repo,read:user&redirect_uri=${encodeURIComponent(redirectUri)}`;
    return sendJson(res, 200, { success: true, authUrl: url });
  }

  public static async callback(_req: AuthenticatedRequest, res: ServerResponse) {
    // Redirect back to settings page
    res.writeHead(302, { Location: '/html/settings.html?github=connected' });
    res.end();
  }
}
