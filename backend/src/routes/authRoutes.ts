import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middleware/requireAuth";
import * as authController from "../controllers/authController";

export const authRoutes = Router();

authRoutes.post("/login", asyncHandler(authController.login));
authRoutes.get("/me", requireAuth, authController.me);
