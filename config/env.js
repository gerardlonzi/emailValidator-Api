import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const CONFIG = {
  PORT: process.env.PORT || 3000,
  API_KEY: process.env.API_KEY || '',
  FILE_LIFETIME_MIN: Number(process.env.FILE_LIFETIME_MIN || 60),
  VERIFIER_DOMAIN: process.env.VERIFIER_DOMAIN || 'example.com',
  MAIL_FROM_LOCALPART: process.env.MAIL_FROM_LOCALPART || 'validator',
  MAIL_FROM: `${process.env.VERIFIER_DOMAIN || 'example.com'}`,
  SMTP_TIMEOUT_MS: Number(process.env.SMTP_TIMEOUT_MS || 10000),
  CONCURRENCY_LIMIT: Number(process.env.CONCURRENCY_LIMIT || 10),
  UPLOADS_DIR: path.join(__dirname, '../uploads'),
  RESULTS_DIR: path.join(__dirname, '../results'),
  VIEWS_DIR: path.join(__dirname, '../views'),
  PUBLIC_DIR: path.join(__dirname, '../public'),
};
