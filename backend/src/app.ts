import express from "express";
import cors from "cors";
import { ticketRoutes } from "./routes/ticketRoutes";
import { authRoutes } from "./routes/authRoutes";
import { errorHandler } from "./middleware/errorHandler";

export function createApp() {
  const app = express();

  const corsOrigin = process.env.CORS_ORIGIN?.split(",").map((origin) => origin.trim());
  app.use(cors({ origin: corsOrigin ?? "*" }));
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/tickets", ticketRoutes);

  app.use(errorHandler);

  return app;
}
