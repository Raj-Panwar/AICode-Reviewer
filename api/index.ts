import type { IncomingMessage, ServerResponse } from 'http';
import { handleApiRoute } from '../server/router.ts';

/**
 * Universal Vercel Serverless Function entry point
 * Handles all /api/* requests when deployed on Vercel
 */
export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  return handleApiRoute(req, res, () => {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ ok: false, status: 404, error: 'Not Found' }));
  });
}
