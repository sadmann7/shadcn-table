import { isEmpty } from "@/db/utils";
import type { ExtendedColumnFilter, ExtendedColumnSort, JoinOperator } from "@/types/data-table";
import {
  type AnyColumn,
  type SQL,
  type Table,
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  gte,
  ilike,
  inArray,
  lt,
  lte,
  ne,
  not,
  notIlike,
  notInArray,
  or,
  sql,
} from "drizzle-orm";

import { BaseFilterBuilder } from "./filter-builder";
import type {
  AggregateParams,
  AggregateResult,
  CountParams,
  CreateData,
  DatabaseAdapter,
  DrizzleAdapterConfig,
  OrderByClause,
  QueryParams,
  QueryResult,
  TransactionContext,
  UpdateData,
  WhereClause,
} from "./types";

export class DrizzleFilterBuilder<TSchema = any> extends BaseFilterBuilder<TSchema> {
  constructor(
    private table: Table,
    schema: DrizzleAdapterConfig['schema']
  ) {
    super(schema);
  }

  buildWhereClause(
    filters: ExtendedColumnFilter<TSchema>[],
    joinOperator: JoinOperator
  ): any {
    const joinFn = joinOperator === "and" ? and : or;

    const conditions = filters.map((filter) => {
      const column = this.getColumn(filter.id as string);
      const columnType = this.getColumnType(filter.id as string);

      switch (filter.operator) {
        case "iLike":
          return filter.variant === "text" && typeof filter.value === "string"
            ? ilike(column, `%${filter.value}%`)
            : undefined;

        case "notILike":
          return filter.variant === "text" && typeof filter.value === "string"
            ? notIlike(column, `%${filter.value}%`)
            : undefined;

        case "eq":
          if (columnType === "boolean" && typeof filter.value === "string") {
            return eq(column, filter.value === "true");
          }
          if (filter.variant === "date" || filter.variant === "dateRange") {
            const date = this.normalizeDateValue(filter.value as string);
            const startDate = this.setDateToStartOfDay(date);
            const endDate = this.setDateToEndOfDay(date);
            return and(gte(column, startDate), lte(column, endDate));
          }
          return eq(column, this.normalizeValue(filter.value, columnType));

        case "ne":
          if (columnType === "boolean" && typeof filter.value === "string") {
            return ne(column, filter.value === "true");
          }
          if (filter.variant === "date" || filter.variant === "dateRange") {
            const date = this.normalizeDateValue(filter.value as string);
            const startDate = this.setDateToStartOfDay(date);
            const endDate = this.setDateToEndOfDay(date);
            return or(lt(column, startDate), gt(column, endDate));
          }
          return ne(column, this.normalizeValue(filter.value, columnType));

        case "inArray":
          if (Array.isArray(filter.value)) {
            return inArray(column, filter.value.map(v => this.normalizeValue(v, columnType)));
          }
          return undefined;

        case "notInArray":
          if (Array.isArray(filter.value)) {
            return notInArray(column, filter.value.map(v => this.normalizeValue(v, columnType)));
          }
          return undefined;

        case "lt":
          if (filter.variant === "number" || filter.variant === "range") {
            return lt(column, this.normalizeValue(filter.value, columnType));
          }
          if (filter.variant === "date" && typeof filter.value === "string") {
            const date = this.normalizeDateValue(filter.value);
            return lt(column, this.setDateToEndOfDay(date));
          }
          return undefined;

        case "lte":
          if (filter.variant === "number" || filter.variant === "range") {
            return lte(column, this.normalizeValue(filter.value, columnType));
          }
          if (filter.variant === "date" && typeof filter.value === "string") {
            const date = this.normalizeDateValue(filter.value);
            return lte(column, this.setDateToEndOfDay(date));
          }
          return undefined;

        case "gt":
          if (filter.variant === "number" || filter.variant === "range") {
            return gt(column, this.normalizeValue(filter.value, columnType));
          }
          if (filter.variant === "date" && typeof filter.value === "string") {
            const date = this.normalizeDateValue(filter.value);
            return gt(column, this.setDateToStartOfDay(date));
          }
          return undefined;

        case "gte":
          if (filter.variant === "number" || filter.variant === "range") {
            return gte(column, this.normalizeValue(filter.value, columnType));
          }
          if (filter.variant === "date" && typeof filter.value === "string") {
            const date = this.normalizeDateValue(filter.value);
            return gte(column, this.setDateToStartOfDay(date));
          }
          return undefined;

        case "isBetween":
          if (
            (filter.variant === "date" || filter.variant === "dateRange") &&
            Array.isArray(filter.value) &&
            filter.value.length === 2
          ) {
            return and(
              filter.value[0]
                ? gte(column, this.setDateToStartOfDay(this.normalizeDateValue(filter.value[0])))
                : undefined,
              filter.value[1]
                ? lte(column, this.setDateToEndOfDay(this.normalizeDateValue(filter.value[1])))
                : undefined,
            );
          }

          if (
            (filter.variant === "number" || filter.variant === "range") &&
            Array.isArray(filter.value) &&
            filter.value.length === 2
          ) {
            const firstValue = filter.value[0] && filter.value[0].toString().trim() !== ""
              ? this.normalizeValue(filter.value[0], columnType)
              : null;
            const secondValue = filter.value[1] && filter.value[1].toString().trim() !== ""
              ? this.normalizeValue(filter.value[1], columnType)
              : null;

            if (firstValue === null && secondValue === null) {
              return undefined;
            }
            if (firstValue !== null && secondValue === null) {
              return eq(column, firstValue);
            }
            if (firstValue === null && secondValue !== null) {
              return eq(column, secondValue);
            }

            return and(
              firstValue !== null ? gte(column, firstValue) : undefined,
              secondValue !== null ? lte(column, secondValue) : undefined,
            );
          }
          return undefined;

        case "isRelativeToToday":
          if (
            (filter.variant === "date" || filter.variant === "dateRange") &&
            typeof filter.value === "string"
          ) {
            const dateRange = this.parseRelativeDate(filter.value);
            if (!dateRange) return undefined;

            return and(
              gte(column, dateRange.startDate),
              lte(column, dateRange.endDate)
            );
          }
          return undefined;

        case "isEmpty":
          return isEmpty(column);

        case "isNotEmpty":
          return not(isEmpty(column));

        default:
          throw new Error(`Unsupported operator: ${filter.operator}`);
      }
    });

    const validConditions = conditions.filter(
      (condition) => condition !== undefined,
    ) as SQL[];

    return validConditions.length > 0 ? joinFn(...validConditions) : undefined;
  }

  buildOrderByClause(sorts: ExtendedColumnSort<TSchema>[]): any {
    if (sorts.length === 0) {
      const createdAtColumn = this.getColumn('createdAt');
      return [asc(createdAtColumn)];
    }

    return sorts.map((sort) => {
      const column = this.getColumn(sort.id as string);
      return sort.desc ? desc(column) : asc(column);
    });
  }

  private getColumn(columnKey: string): AnyColumn {
    return (this.table as any)[columnKey] as AnyColumn;
  }
}

export class DrizzleAdapter<TSchema = any> implements DatabaseAdapter<TSchema> {
  private filterBuilder: DrizzleFilterBuilder<TSchema>;

  constructor(private config: DrizzleAdapterConfig) {
    this.filterBuilder = new DrizzleFilterBuilder<TSchema>(config.table, config.schema);
  }

  async findMany(params: QueryParams<TSchema>): Promise<TSchema[]> {
    const where = this.filterBuilder.buildWhereClause(params.filters, params.joinOperator);
    const orderBy = this.filterBuilder.buildOrderByClause(params.sorts);

    return await this.config.db
      .select()
      .from(this.config.table)
      .where(where)
      .orderBy(...orderBy)
      .limit(params.limit)
      .offset(params.offset);
  }

  async findManyWithCount(params: QueryParams<TSchema>): Promise<QueryResult<TSchema>> {
    const where = this.filterBuilder.buildWhereClause(params.filters, params.joinOperator);
    const orderBy = this.filterBuilder.buildOrderByClause(params.sorts);

    const { data, total } = await this.config.db.transaction(async (tx: any) => {
      const data = await tx
        .select()
        .from(this.config.table)
        .where(where)
        .orderBy(...orderBy)
        .limit(params.limit)
        .offset(params.offset);

      const total = await tx
        .select({ count: count() })
        .from(this.config.table)
        .where(where)
        .execute()
        .then((res: any) => res[0]?.count ?? 0);

      return { data, total };
    });

    return { data, total };
  }

  async findFirst(params: Omit<QueryParams<TSchema>, 'limit' | 'offset'>): Promise<TSchema | null> {
    const where = this.filterBuilder.buildWhereClause(params.filters, params.joinOperator);
    const orderBy = this.filterBuilder.buildOrderByClause(params.sorts);

    const result = await this.config.db
      .select()
      .from(this.config.table)
      .where(where)
      .orderBy(...orderBy)
      .limit(1);

    return result[0] || null;
  }

  async count(params: CountParams<TSchema>): Promise<number> {
    const where = this.filterBuilder.buildWhereClause(params.filters, params.joinOperator);

    const result = await this.config.db
      .select({ count: count() })
      .from(this.config.table)
      .where(where);

    return result[0]?.count ?? 0;
  }

  async aggregate(params: AggregateParams<TSchema>): Promise<AggregateResult[]> {
    const where = this.filterBuilder.buildWhereClause(params.filters, params.joinOperator);
    
    const selectFields: any = {};
    
    // Add group by columns
    for (const groupCol of params.groupBy) {
      selectFields[groupCol as string] = (this.config.table as any)[groupCol as string];
    }
    
    // Add aggregate functions
    for (const [column, aggregates] of Object.entries(params.aggregates)) {
      const col = (this.config.table as any)[column];
      const agg = aggregates as any;
      if (agg.count) selectFields[`${column}_count`] = count(col);
      if (agg.sum) selectFields[`${column}_sum`] = sql`sum(${col})`;
      if (agg.avg) selectFields[`${column}_avg`] = sql`avg(${col})`;
      if (agg.min) selectFields[`${column}_min`] = sql`min(${col})`;
      if (agg.max) selectFields[`${column}_max`] = sql`max(${col})`;
    }

    return await this.config.db
      .select(selectFields)
      .from(this.config.table)
      .where(where)
      .groupBy(...params.groupBy.map(col => (this.config.table as any)[col as string]));
  }

  async create(data: CreateData<TSchema>): Promise<TSchema> {
    const result = await this.config.db
      .insert(this.config.table)
      .values(data)
      .returning();
    
    return result[0];
  }

  async update(id: string, data: UpdateData<TSchema>): Promise<TSchema> {
    const primaryKey = this.config.schema.primaryKey;
    const result = await this.config.db
      .update(this.config.table)
      .set(data)
      .where(eq((this.config.table as any)[primaryKey], id))
      .returning();
    
    return result[0];
  }

  async updateMany(ids: string[], data: UpdateData<TSchema>): Promise<TSchema[]> {
    const primaryKey = this.config.schema.primaryKey;
    return await this.config.db
      .update(this.config.table)
      .set(data)
      .where(inArray((this.config.table as any)[primaryKey], ids))
      .returning();
  }

  async delete(id: string): Promise<void> {
    const primaryKey = this.config.schema.primaryKey;
    await this.config.db
      .delete(this.config.table)
      .where(eq((this.config.table as any)[primaryKey], id));
  }

  async deleteMany(ids: string[]): Promise<void> {
    const primaryKey = this.config.schema.primaryKey;
    await this.config.db
      .delete(this.config.table)
      .where(inArray((this.config.table as any)[primaryKey], ids));
  }

  async transaction<T>(fn: (ctx: TransactionContext<TSchema>) => Promise<T>): Promise<T> {
    return await this.config.db.transaction(async (tx: any) => {
      const transactionAdapter = new DrizzleAdapter<TSchema>({
        ...this.config,
        db: tx,
      });
      
      return await fn({ adapter: transactionAdapter });
    });
  }
}