import { pool } from '../db/client.js';
import { verifyToken } from '../lib/security.js';
import { HttpError, asyncHandler } from '../lib/errors.js';
import { mapUser, userSelect } from '../models/mappers.js';

export const requireAuth = asyncHandler(async (req, _res, next) => {
  const authorization = req.get('authorization') || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  const claims = token ? verifyToken(token) : null;
  if (!claims) throw new HttpError(401, 'UNAUTHENTICATED', 'A valid bearer token is required.');
  const result = await pool.query(`${userSelect} WHERE u.id = $1`, [claims.sub]);
  if (!result.rowCount || !result.rows[0].is_active) {
    throw new HttpError(401, 'UNAUTHENTICATED', 'The account is unavailable or the token has expired.');
  }
  req.user = mapUser(result.rows[0]);
  next();
});

export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new HttpError(403, 'FORBIDDEN', 'You do not have permission to perform this action.'));
    }
    next();
  };
}