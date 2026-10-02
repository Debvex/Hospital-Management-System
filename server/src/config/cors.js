import { env } from './env.js';
import { HttpError } from '../lib/errors.js';

export function corsMiddleware(req, res, next) {
  const origin = req.headers.origin;
  if (origin && !env.corsOrigins.includes(origin)) {
    return next(new HttpError(403, 'CORS_ORIGIN_DENIED', 'Origin is not allowed.'));
  }
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, X-Request-Id');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
}