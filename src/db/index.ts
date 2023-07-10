import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js"
import { migrate } from "drizzle-orm/postgres-js/migrator"
import postgres from "postgres"

import { env } from "@/env.mjs"

// for migrations
const migrationClient = postgres(env.DATABASE_URL, { max: 1 })
await migrate(drizzle(migrationClient), {
  migrationsFolder: "./drizzle",
})

// for query purposes
const queryClient = postgres(env.DATABASE_URL)
export const db: PostgresJsDatabase = drizzle(queryClient)
