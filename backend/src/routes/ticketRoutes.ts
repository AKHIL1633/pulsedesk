import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middleware/requireAuth";
import * as ticketController from "../controllers/ticketController";

export const ticketRoutes = Router();

ticketRoutes.post("/", asyncHandler(ticketController.create));
ticketRoutes.get("/", asyncHandler(ticketController.list));
ticketRoutes.get("/:id", asyncHandler(ticketController.show));
ticketRoutes.patch("/:id", requireAuth, asyncHandler(ticketController.update));
