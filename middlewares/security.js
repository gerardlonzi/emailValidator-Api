// backend/middlewares/security.js
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import xss from 'xss-clean';
import express from 'express'

export function applySecurity(app, allowedOrigins = []) {
  app.use(helmet());
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow server-to-server or local
      if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error('CORS not allowed'));
    }
  }));
  app.use(express.json({ limit: '200kb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(xss());

  const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 60,
    standardHeaders: true,
    legacyHeaders: false
  });
  app.use('/api', limiter);
}
