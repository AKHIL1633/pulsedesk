import path from "node:path";
import dotenv from "dotenv";

// Runs before any test file is required, so DATABASE_URL etc. point at the
// dedicated test database before db/prisma.ts is ever imported.
dotenv.config({ path: path.resolve(__dirname, "../.env.test") });
