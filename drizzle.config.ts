import { env } from "@/env.js"
import { type Config } from "drizzle-kit"

import { databasePrefix } from "@/lib/constants"

export default {
  schema: "./src/db/schema.ts",
  driver: "pg",
  out: "./drizzle",
  dbCredentials: {
    connectionString: env.DATABASE_URL,
  },
  tablesFilter: [`${databasePrefix}_*`],
} satisfies Config
