import 'dotenv/config';

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 8000),
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:5173')
    .split(',').map((origin) => origin.trim()).filter(Boolean),
};

export function validateEnv() {
  if (!env.databaseUrl) throw new Error('DATABASE_URL is required. Copy server/.env.example to server/.env.');
  if (!env.jwtSecret || env.jwtSecret.length < 32) throw new Error('JWT_SECRET must contain at least 32 characters.');
  if (!Number.isInteger(env.port) || env.port < 1 || env.port > 65535) throw new Error('PORT must be a valid TCP port.');
}