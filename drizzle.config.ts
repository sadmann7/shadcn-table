import { type Config } from "drizzle-kit"

import { env } from "@/env.mjs"

export default {
  schema: "./src/db/schema.ts",
  driver: "mysql2",
  out: "./drizzle",
  dbCredentials: {
    uri: env.DATABASE_URL,
  },
  tablesFilter: ["shadcn-table_*"],
} satisfies Config
