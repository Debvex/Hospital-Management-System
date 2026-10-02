import { HttpError } from '../lib/errors.js';

export function errorHandler(error, req, res, _next) {
  if (error.code === '23503') error = new HttpError(400, 'INVALID_RELATION', 'A referenced record does not exist.');
  const status = Number.isInteger(error.status) ? error.status : 500;
  if (status >= 500) console.error(error);
  res.status(status).json({
    error: {
      code: error instanceof HttpError ? error.code : 'INTERNAL_SERVER_ERROR',
      message: status >= 500 ? 'An unexpected server error occurred.' : error.message,
      ...(error.details ? { details: error.details } : {}),
      requestId: req.requestId || req.get('x-request-id') || undefined,
    },
  });
}