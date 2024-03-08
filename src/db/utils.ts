import { pgTableCreator } from "drizzle-orm/pg-core"

import { databasePrefix } from "@/lib/constants"

export const pgTable = pgTableCreator((name) => `${databasePrefix}_${name}`)
