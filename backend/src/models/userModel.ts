import type { User } from "@prisma/client";
import { prisma } from "../config/prisma";

/** Data-access layer for reviewer accounts. */
export const UserModel = {
  findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  },
};
