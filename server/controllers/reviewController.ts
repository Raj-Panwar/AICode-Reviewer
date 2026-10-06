import { ServerResponse } from 'http';
import { AuthenticatedRequest, sendJson, sendError } from '../middleware/authMiddleware.js';
import { ReviewProcessingService } from '../services/reviewProcessingService.js';
import { GeminiService } from '../services/geminiService.js';
import { db } from '../database/db.js';

export class ReviewController {
  /**
   * Run real AI review analysis: POST /api/reviews/analyze OR POST /api/reviews
   */
  public static async analyze(req: AuthenticatedRequest, res: ServerResponse) {
    try {
      const body = req.body || {};
      const code = body.code || '';
      if (!code || !code.trim()) {
        return sendError(res, 400, 'INVALID_REQUEST', 'Code cannot be empty.');
      }

      const userId = req.user?.id || 'usr_default';
      const reviewResult = await ReviewProcessingService.analyzeAndSaveReview(body, userId);
      return sendJson(res, 201, reviewResult);
    } catch (err: any) {
      console.error('[ReviewController] Analyze error:', err);
      return sendError(res, 500, 'AI_ANALYSIS_FAILED', err.message || 'AI review analysis failed.');
    }
  }

  /**
   * List reviews: GET /api/reviews
   */
  public static async list(req: AuthenticatedRequest, res: ServerResponse, query: URLSearchParams) {
    try {
      const userId = req.user?.id || 'usr_default';
      let reviews = db.getAllReviews(userId);

      const lang = query.get('language');
      const status = query.get('status');
      const search = query.get('search');

      if (lang && lang !== 'ALL') {
        reviews = reviews.filter((r) => r.language?.toLowerCase() === lang.toLowerCase());
      }
      if (status && status !== 'ALL') {
        reviews = reviews.filter((r) => r.status?.toLowerCase() === status.toLowerCase());
      }
      if (search) {
        const q = search.toLowerCase();
        reviews = reviews.filter((r) =>
          (r.project || '').toLowerCase().includes(q) ||
          (r.file || '').toLowerCase().includes(q) ||
          (r.repository || '').toLowerCase().includes(q)
        );
      }

      return sendJson(res, 200, reviews);
    } catch (err: any) {
      return sendError(res, 500, 'FETCH_FAILED', err.message);
    }
  }

  /**
   * Get review by ID: GET /api/reviews/{id}
   */
  public static async getById(req: AuthenticatedRequest, res: ServerResponse, id: string) {
    const userId = req.user?.id || 'usr_default';
    const review = db.getReviewById(id, userId);
    if (!review) {
      return sendError(res, 404, 'NOT_FOUND', `Review with ID "${id}" was not found.`);
    }
    return sendJson(res, 200, review);
  }

  /**
   * Delete review: DELETE /api/reviews/{id}
   */
  public static async delete(req: AuthenticatedRequest, res: ServerResponse, id: string) {
    const userId = req.user?.id || 'usr_default';
    const deleted = db.deleteReview(id, userId);
    if (!deleted) {
      return sendError(res, 404, 'NOT_FOUND', `Review with ID "${id}" could not be deleted.`);
    }
    return sendJson(res, 200, { success: true, message: 'Review deleted successfully.' });
  }

  /**
   * Dashboard statistics: GET /api/dashboard/stats
   */
  public static async stats(req: AuthenticatedRequest, res: ServerResponse) {
    const userId = req.user?.id || 'usr_default';
    const metrics = ReviewProcessingService.getDashboardMetrics(userId);
    return sendJson(res, 200, metrics);
  }

  /**
   * Dedicated complexity analysis: POST /api/complexity/analyze
   */
  public static async analyzeComplexity(req: AuthenticatedRequest, res: ServerResponse) {
    try {
      const { code, language } = req.body || {};
      if (!code || !code.trim()) {
        return sendError(res, 400, 'INVALID_REQUEST', 'Code cannot be empty.');
      }
      const result = await GeminiService.analyzeComplexityWithGemini(code, language || 'Java');
      return sendJson(res, 200, result);
    } catch (err: any) {
      console.error('[ReviewController] Complexity analysis error:', err);
      return sendError(res, 500, 'COMPLEXITY_FAILED', err.message);
    }
  }

  /**
   * Complexity case study library: GET /api/complexity
   */
  public static async getComplexityLibrary(_req: AuthenticatedRequest, res: ServerResponse) {
    const library = db.getComplexityLibrary();
    return sendJson(res, 200, library);
  }
}
