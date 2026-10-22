import type { AuthUser, LoginInput } from "@pulsedesk/shared";
import { UserModel } from "../models/userModel";
import { verifyPassword } from "../utils/password";
import { signToken } from "../utils/jwt";

/** Returns a signed token + user on valid credentials, or null otherwise. */
export async function login({
  email,
  password,
}: LoginInput): Promise<{ token: string; user: AuthUser } | null> {
  const user = await UserModel.findByEmail(email);
  const valid = user ? await verifyPassword(password, user.passwordHash) : false;
  if (!user || !valid) return null;

  const authUser = { id: user.id, email: user.email, name: user.name };
  return { token: signToken(authUser), user: authUser };
}
