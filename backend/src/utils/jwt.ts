import jwt from "jsonwebtoken";
import type { AuthUser } from "@pulsedesk/shared";

const EXPIRES_IN = "7d";

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return secret;
}

export function signToken(user: AuthUser): string {
  return jwt.sign({ sub: user.id, email: user.email, name: user.name }, getSecret(), {
    expiresIn: EXPIRES_IN,
  });
}

interface TokenPayload extends jwt.JwtPayload {
  sub: string;
  email: string;
  name: string;
}

export function verifyToken(token: string): AuthUser {
  const payload = jwt.verify(token, getSecret()) as TokenPayload;
  return { id: payload.sub, email: payload.email, name: payload.name };
}
