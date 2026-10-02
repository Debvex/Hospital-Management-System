import express from 'express';
import helmet from 'helmet';
import { corsMiddleware } from './config/cors.js';
import { asyncHandler, HttpError } from './lib/errors.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import { requestId } from './middleware/requestId.js';
import apiRoutes from './routes/index.js';
import { pool } from './db/client.js';

export const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(corsMiddleware);
app.use(requestId);
app.use(express.json({ limit: '1mb' }));

app.get('/health', asyncHandler(async (_req, res) => {
  await pool.query('SELECT 1');
  res.json({ status: 'ok' });
}));

app.use('/api/v1', apiRoutes);
app.use(notFound);
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return next(new HttpError(400, 'INVALID_JSON', 'Request body must contain valid JSON.'));
  }
  next(error);
});
app.use(errorHandler);