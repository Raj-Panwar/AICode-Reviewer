import { IncomingMessage, ServerResponse } from 'http';
import {
  AuthenticatedRequest,
  parseJsonBody,
  extractAuthUser,
  sendJson,
  sendError
} from './middleware/authMiddleware.js';
import { AuthController } from './controllers/authController.js';
import { ReviewController } from './controllers/reviewController.js';
import { GitHubController } from './controllers/githubController.js';

/**
 * Handle incoming API requests and route to corresponding controllers
 */
export async function handleApiRoute(
  req: IncomingMessage,
  res: ServerResponse,
  next: () => void
): Promise<void> {
  const urlObj = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const pathname = urlObj.pathname.replace(/\/+$/, '');
  const method = req.method?.toUpperCase() || 'GET';

  // Only handle /api/* routes
  if (!pathname.startsWith('/api')) {
    return next();
  }

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    });
    res.end();
    return;
  }

  const authReq = req as AuthenticatedRequest;

  // Health check
  if (pathname === '/api/health' && method === 'GET') {
    return sendJson(res, 200, {
      ok: true,
      status: 200,
      mode: 'real',
      message: 'AI Code Reviewer backend is online and healthy.',
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY)
    });
  }

  // Parse JSON body for mutation requests
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    try {
      authReq.body = await parseJsonBody(req);
    } catch (e: any) {
      return sendError(res, 400, 'BAD_REQUEST', e.message || 'Failed to parse JSON body');
    }
  }

  // Extract authentication token / user context
  extractAuthUser(authReq);

  // --- Auth Routes ---
  if (pathname === '/api/auth/register' && method === 'POST') {
    return AuthController.register(authReq, res);
  }
  if (pathname === '/api/auth/login' && method === 'POST') {
    return AuthController.login(authReq, res);
  }
  if (pathname === '/api/auth/logout' && method === 'POST') {
    return AuthController.logout(authReq, res);
  }
  if (pathname === '/api/auth/me' && method === 'GET') {
    return AuthController.me(authReq, res);
  }

  // --- Review Routes ---
  if ((pathname === '/api/reviews/analyze' || pathname === '/api/reviews') && method === 'POST') {
    return ReviewController.analyze(authReq, res);
  }
  if (pathname === '/api/reviews' && method === 'GET') {
    return ReviewController.list(authReq, res, urlObj.searchParams);
  }
  const reviewMatch = pathname.match(/^\/api\/reviews\/([^/]+)$/);
  if (reviewMatch) {
    const id = reviewMatch[1];
    if (method === 'GET') {
      return ReviewController.getById(authReq, res, id);
    }
    if (method === 'DELETE') {
      return ReviewController.delete(authReq, res, id);
    }
  }

  // --- Dashboard Stats ---
  if ((pathname === '/api/dashboard/stats' || pathname === '/api/stats') && method === 'GET') {
    return ReviewController.stats(authReq, res);
  }

  // --- Complexity Routes ---
  if (pathname === '/api/complexity/analyze' && method === 'POST') {
    return ReviewController.analyzeComplexity(authReq, res);
  }
  if (pathname === '/api/complexity' && method === 'GET') {
    return ReviewController.getComplexityLibrary(authReq, res);
  }

  // --- GitHub Routes ---
  if (pathname === '/api/github/auth' && method === 'GET') {
    return GitHubController.auth(authReq, res);
  }
  if (pathname === '/api/github/callback' && method === 'GET') {
    return GitHubController.callback(authReq, res);
  }
  if (pathname === '/api/github/repos' && method === 'GET') {
    return GitHubController.listRepositories(authReq, res);
  }
  if (pathname === '/api/repositories' && method === 'GET') {
    return GitHubController.listRepositories(authReq, res);
  }
  if (pathname === '/api/repositories' && method === 'POST') {
    return GitHubController.connectRepository(authReq, res);
  }
  const repoFilesMatch = pathname.match(/^\/api\/repositories\/([^/]+)\/files$/);
  if (repoFilesMatch && method === 'GET') {
    return GitHubController.getFiles(authReq, res, repoFilesMatch[1], urlObj.searchParams);
  }
  const repoBranchesMatch = pathname.match(/^\/api\/repositories\/([^/]+)\/branches$/);
  if (repoBranchesMatch && method === 'GET') {
    return GitHubController.getBranches(authReq, res, repoBranchesMatch[1]);
  }
  const repoSingleMatch = pathname.match(/^\/api\/repositories\/([^/]+)$/);
  if (repoSingleMatch && method === 'GET') {
    return GitHubController.getRepository(authReq, res, repoSingleMatch[1]);
  }

  // Unhandled API endpoint
  return sendError(res, 404, 'NOT_FOUND', `Endpoint ${method} ${pathname} not found.`);
}
