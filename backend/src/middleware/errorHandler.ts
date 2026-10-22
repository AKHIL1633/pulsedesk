import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { renderError } from "../views/errorView";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ZodError) {
    res.status(400).json(renderError("Validation failed", err.issues));
    return;
  }

  console.error(err);
  res.status(500).json(renderError("Internal server error"));
}
