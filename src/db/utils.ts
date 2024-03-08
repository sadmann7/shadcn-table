import { pgTableCreator } from "drizzle-orm/pg-core"

import { databasePrefix } from "@/lib/constants"

/**
 * This lets us use the multi-project schema feature of Drizzle ORM. So the same
 * database instance can be used for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const pgTable = pgTableCreator((name) => `${databasePrefix}_${name}`)
