import type { NextFunction, Request, Response } from 'express';

// TASK 1.2'de implement edilecek (JWT doğrulama). Şimdilik iskelet.
export function auth(_req: Request, _res: Response, next: NextFunction) {
  next();
}
