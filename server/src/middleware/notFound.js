import { HttpError } from '../lib/errors.js';

export function notFound(_req, _res, next) {
  next(new HttpError(404, 'NOT_FOUND', 'Route not found.'));
}