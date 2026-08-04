import express from "express";
import cors from "cors";
import { ticketsRouter } from "./routes/tickets";
import { authRouter } from "./routes/auth";
import { errorHandler } from "./middleware/errorHandler";

export function createApp() {
  const app = express();

  const corsOrigin = process.env.CORS_ORIGIN?.split(",").map((origin) => origin.trim());
  app.use(cors({ origin: corsOrigin ?? "*" }));
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/tickets", ticketsRouter);

  app.use(errorHandler);

  return app;
}
