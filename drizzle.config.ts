import * as dotenv from "dotenv"
import type { Config } from "drizzle-kit"

dotenv.config()

export default {
  schema: "./src/db/schema.ts",
  driver: "mysql2",
  out: "./drizzle",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL ?? "",
  },
} satisfies Config
