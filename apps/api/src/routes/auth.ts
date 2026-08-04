import { Router } from "express";
import { LoginSchema } from "@pulsedesk/shared";
import { asyncHandler } from "../utils/asyncHandler";
import { prisma } from "../db/prisma";
import { verifyPassword } from "../auth/password";
import { signToken } from "../auth/jwt";
import { requireAuth } from "../auth/middleware";

export const authRouter = Router();

authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = LoginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    const valid = user ? await verifyPassword(password, user.passwordHash) : false;

    if (!user || !valid) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const authUser = { id: user.id, email: user.email, name: user.name };
    res.json({ token: signToken(authUser), user: authUser });
  }),
);

authRouter.get("/me", requireAuth, (req, res) => {
  res.json(req.user);
});
