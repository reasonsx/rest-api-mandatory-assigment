import { NextFunction, Request, Response } from "express";

import { sendError } from "../shared/api-response";
import { VALIDATION_MESSAGES } from "../shared/validation-messages";

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateLimitEntry>();

export function authRateLimit(req: Request, res: Response, next: NextFunction) {
  const windowMs = Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS ?? 15 * 60 * 1000);
  const maxAttempts = Number(process.env.AUTH_RATE_LIMIT_MAX ?? 20);
  const now = Date.now();
  const key = req.ip || req.socket.remoteAddress || "unknown";
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return next();
  }

  current.count += 1;

  if (current.count > maxAttempts) {
    res.setHeader("Retry-After", Math.ceil((current.resetAt - now) / 1000));
    return sendError(res, 429, VALIDATION_MESSAGES.tooManyAuthAttempts);
  }

  return next();
}
