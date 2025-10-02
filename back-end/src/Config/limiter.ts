import limiter from 'express-rate-limit';

export const authLimiter = limiter({
  windowMs: 5 * 1000,
  max: 1,
  message: { error: 'Too many requests, please wait 5 seconds' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const globalLimiter = limiter({
  windowMs: 60 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
