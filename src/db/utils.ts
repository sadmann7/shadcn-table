import { pgTableCreator } from "drizzle-orm/pg-core"

import { databasePrefix } from "@/lib/constants"

/**
 * This lets us use the multi-project schema feature of Drizzle ORM. So the same
 * database instance can be used for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const pgTable = pgTableCreator((name) => `${databasePrefix}_${name}`)

// @see https://gist.github.com/rphlmr/0d1722a794ed5a16da0fdf6652902b15

export function takeFirst<T>(items: T[]) {
  return items.at(0)
}

export function takeFirstOrThrow<T>(items: T[]) {
  const first = takeFirst(items)

  if (!first) {
    throw new Error("First item not found")
  }

  return first
}
