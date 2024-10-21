/**
 * @see https://gist.github.com/rphlmr/0d1722a794ed5a16da0fdf6652902b15
 */

import { type QueryBuilderOpts } from "@/types"
import {
  and,
  is,
  not,
  sql,
  type AnyColumn,
  type Column,
  type GetColumnData,
  type SelectedFields,
  type SQL,
  type Table,
} from "drizzle-orm"
import { pgTableCreator, PgTimestampString } from "drizzle-orm/pg-core"
import { type SelectResultFields } from "drizzle-orm/query-builders/select.types"

import { databasePrefix } from "@/lib/constants"

/**
 * This lets us use the multi-project schema feature of Drizzle ORM. So the same
 * database instance can be used for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const pgTable = pgTableCreator((name) => `${databasePrefix}_${name}`)

/**
 * Takes the first item from an array.
 *
 * @param items - The array to take the first item from.
 * @returns The first item from the array.
 */
export function takeFirst<TData>(items: TData[]) {
  return items.at(0)
}

/**
 * Takes the first item from an array or returns null if the array is empty.
 *
 * @param items - The array to take the first item from.
 * @returns The first item from the array or null.
 */
export function takeFirstOrNull<TData>(items: TData[]) {
  return takeFirst(items) ?? null
}

/**
 * Takes the first item from an array or throws an error if the array is empty.
 *
 * @param items - The array to take the first item from.
 * @returns The first item from the array.
 * @throws An error if the array is empty.
 */
export function takeFirstOrThrow<TData>(items: TData[]) {
  const first = takeFirst(items)

  if (!first) {
    throw new Error("First item not found")
  }

  return first
}

/**
 * Coalesces a value to a default value.
 *
 * @param value - The value to coalesce.
 * @param defaultValue - The default value to return if the value is null.
 * @returns A sql coalesce statement.
 */
export function coalesce<TData>(
  value: SQL.Aliased<TData> | SQL<TData>,
  defaultValue: SQL<TData>
) {
  return sql<TData>`coalesce(${value}, ${defaultValue})`
}

/**
 * Builds a json object from a shape.
 *
 * @param shape - The shape of the object to build.
 * @returns A sql json_build_object statement.
 */
export function jsonBuildObject<TFields extends SelectedFields<Column, Table>>(
  shape: TFields
) {
  const chunks: SQL[] = []

  Object.entries(shape).forEach(([key, value]) => {
    if (chunks.length > 0) {
      chunks.push(sql.raw(`,`))
    }

    chunks.push(sql.raw(`'${key}',`))

    // json_build_object formats to ISO 8601 ...
    if (is(value, PgTimestampString)) {
      chunks.push(sql`timezone('UTC', ${value})`)
    } else {
      chunks.push(sql`${value}`)
    }
  })

  return sql<
    SelectResultFields<TFields>
  >`json_build_object(${sql.join(chunks)})`
}

/**
 * ggregates an array of values into a single json array.
 *
 * @param shape - The shape of the object to aggregate.
 * @param options - The options to pass to the aggregate function.
 * @returns A SQL json_agg statement.
 */
export function jsonAgg<Column extends AnyColumn>(
  column: Column,
  opts?: QueryBuilderOpts
) {
  const orderBy = opts?.orderBy ? sql` order by ${opts.orderBy}` : sql``

  const aggregateFunction = opts?.distinct
    ? sql`json_agg(distinct ${sql`${column}`} ${orderBy})`
    : sql`json_agg(${sql`${column}`} ${orderBy})`

  const where = opts?.nullish ? sql`true` : sql`${column} is not null`

  return coalesce<GetColumnData<Column, "raw">[]>(
    sql`${aggregateFunction} filter (where ${where})`,
    sql`'[]'::json`
  )
}

/**
 *  Aggregates an array of objects into a single json object.
 *
 * @param shape - The shape of the object to build.
 * @param options - The options to pass to the aggregate function.
 * @returns A SQL json_agg statement.
 */
export function jsonAggBuildObject<
  TFields extends SelectedFields<Column, Table>,
  Column extends AnyColumn,
>(shape: TFields, opts?: Omit<QueryBuilderOpts, "distinct">) {
  const nullishWhere = opts?.nullish
    ? sql`true`
    : sql`${sql.join(
        Object.values(shape).map((value) => sql`${value} is not null`),
        sql` and `
      )}`

  const orderBy = opts?.orderBy ? sql` order by ${opts.orderBy}` : sql``
  const where = opts?.where ? and(opts.where, nullishWhere) : nullishWhere

  return coalesce<SelectResultFields<TFields>[]>(
    sql`json_agg(${jsonBuildObject(shape)}${orderBy}) filter (where ${where})`,
    sql`'[]'::json`
  )
}

/**
 * Aggregates an array of values into a single array.
 *
 * @param column - The column to aggregate.
 * @param opts - The options to pass to the aggregate function.
 * @returns A SQL array_agg statement.
 */

export function arrayAgg<Column extends AnyColumn>(
  column: Column,
  opts?: QueryBuilderOpts
) {
  const orderBy = opts?.orderBy ? sql` order by ${opts.orderBy}` : sql``

  const aggregateFunction = opts?.distinct
    ? sql`array_agg(distinct ${sql`${column}`} ${orderBy})`
    : sql`array_agg(${sql`${column}`} ${orderBy})`

  return sql`coalesce(nullif(${aggregateFunction}, '{}'), array[]::${column.dataType}[])`
}

/**
 *  Combines array_agg with jsonb_build_object for more flexible aggregation.
 *
 * @param shape - An object representing the shape of the jsonb to build
 * @param opts - Options for aggregation (distinct, where, orderBy)
 * @returns A SQL statement for array_agg with jsonb_build_object
 */
export function arrayAggBuildObject<
  TFields extends Record<string, AnyColumn | SQL>,
>(fields: TFields, options?: QueryBuilderOpts) {
  const jsonbBuildObject = sql`jsonb_build_object(${sql.join(
    Object.entries(fields).flatMap(([key, value]) => [
      sql.raw(`'${key}'`),
      value,
    ]),
    sql`, `
  )})`

  const distinctClause = options?.distinct ? sql`distinct ` : sql``
  const orderByClause = options?.orderBy
    ? sql` order by ${options.orderBy}`
    : sql``
  const whereClause = options?.where
    ? sql` filter (where ${options.where})`
    : sql``

  return sql<SelectResultFields<TFields>[]>`
    coalesce(
      array_agg(${distinctClause}${jsonbBuildObject}${orderByClause})${whereClause},
      array[]::jsonb[]
    )
  `
}

/**
 * Creates a SQL case statement for provided cases and an else value.
 *
 * @param cases - An array of objects with a `when` property and a `then` property.
 * @param elseValue - The value to return if no case matches.
 * @returns A SQL case statement.
 */
export function caseWhen<TColumn extends Column>(
  cases: { when: SQL | undefined; then: Column }[],
  elseValue: TColumn
) {
  const chunks: SQL[] = []

  cases.forEach(({ when, then }) => {
    chunks.push(sql`when ${when} then ${then}`)
  })

  chunks.push(sql`else ${elseValue}`)

  return sql<TColumn["_"]["dataType"]>`case ${sql.join(chunks)} end`
}

/**
 * Composes an array of columns into a single st.
 *
 * @param values - The values to compose.
 * @param separator - The separator to use between the ids (default: "").
 * @returns A sql statement representing the composite column.
 */
export function compose<TColumn extends Column>(
  columns: TColumn[],
  separator = ""
) {
  const chunks = columns.map((column) => sql`${column}::text`)

  return sql<
    TColumn["_"]["dataType"]
  >`(${sql.join(chunks, sql` || ${separator} || `)})`
}

/**
 * Checks if a value is empty (null, undefined, empty string, empty array, or empty object).
 *
 * @param value - The value to check.
 * @returns A SQL expression that evaluates to true if the value is empty, false otherwise.
 */
export function isEmpty<TColumn extends AnyColumn>(column: TColumn) {
  return sql<boolean>`
    case
      when ${column} is null then true
      when ${column} = '' then true
      when ${column}::text = '[]' then true
      when ${column}::text = '{}' then true
      else false
    end
  `
}

/**
 * Checks if a value is not empty (not null, not undefined, not empty string, not empty array, and not empty object).
 *
 * @param value - The value to check.
 * @returns A SQL expression that evaluates to true if the value is not empty, false otherwise.
 */
export function isNotEmpty<TColumn extends AnyColumn>(column: TColumn) {
  return not(isEmpty(column))
}
