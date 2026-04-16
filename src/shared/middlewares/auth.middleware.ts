import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authorization = req.headers.authorization;

  if (!authorization) {
    res.status(401).json({ message: "Missing authorization header" });
    return;
  }

  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : authorization;

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as { sub?: string };
    req.userId = payload.sub;
  } catch {
    res.status(401).json({ message: "Invalid token" });
    return;
  }

  next();
}
