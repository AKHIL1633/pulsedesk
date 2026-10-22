import type { NextFunction, Request, Response } from "express";
import type { AuthUser } from "@pulsedesk/shared";
import { verifyToken } from "../utils/jwt";
import { renderError } from "../views/errorView";

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

/** Requires a valid reviewer JWT in the Authorization header; attaches req.user. */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;

  if (!token) {
    res.status(401).json(renderError("Authentication required"));
    return;
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    res.status(401).json(renderError("Invalid or expired token"));
  }
}
