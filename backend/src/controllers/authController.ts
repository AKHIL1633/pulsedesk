import type { Request, Response } from "express";
import { LoginSchema } from "@pulsedesk/shared";
import * as authService from "../services/authService";
import { renderError } from "../views/errorView";

export async function login(req: Request, res: Response): Promise<void> {
  const credentials = LoginSchema.parse(req.body);
  const result = await authService.login(credentials);

  if (!result) {
    res.status(401).json(renderError("Invalid email or password"));
    return;
  }

  res.json(result);
}

export function me(req: Request, res: Response): void {
  res.json(req.user);
}
