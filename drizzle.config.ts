import { env } from "@/env.js"
import { type Config } from "drizzle-kit"

export default {
  schema: "./src/db/schema.ts",
  driver: "pg",
  out: "./drizzle",
  dbCredentials: {
    connectionString: env.DATABASE_URL,
  },
  tablesFilter: ["shadcn-table_*"],
} satisfies Config
