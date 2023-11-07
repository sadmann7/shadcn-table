import type { Config } from "drizzle-kit"

export default {
  schema: "./src/db/schema.ts",
  driver: "mysql2",
  out: "./drizzle",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL ?? "",
  },
  tablesFilter: ["shadcn-table_*"],
} satisfies Config
