import type { ExtendedColumnFilter, ExtendedColumnSort, JoinOperator } from "@/types/data-table";
import type { SupabaseClient } from "@supabase/supabase-js";

import { BaseFilterBuilder } from "./filter-builder";
import type {
  AggregateParams,
  AggregateResult,
  CountParams,
  CreateData,
  DatabaseAdapter,
  QueryParams,
  QueryResult,
  SupabaseAdapterConfig,
  TransactionContext,
  UpdateData,
} from "./types";

export class SupabaseFilterBuilder<TSchema = any> extends BaseFilterBuilder<TSchema> {
  constructor(
    private client: SupabaseClient,
    private tableName: string,
    schema: SupabaseAdapterConfig['schema']
  ) {
    super(schema);
  }

  buildWhereClause(
    filters: ExtendedColumnFilter<TSchema>[],
    joinOperator: JoinOperator
  ): any {
    // Return filters array for Supabase query builder
    return filters.map(filter => ({
      column: filter.id as string,
      operator: this.mapOperator(filter.operator),
      value: this.normalizeValue(filter.value, filter.operator),
      variant: filter.variant
    }));
  }

  buildOrderByClause(sorts: ExtendedColumnSort<TSchema>[]): any {
    return sorts.map(sort => ({
      column: sort.id as string,
      ascending: !sort.desc
    }));
  }

  private mapOperator(operator: string): string {
    const operatorMap: Record<string, string> = {
      'eq': 'eq',
      'ne': 'neq',
      'gt': 'gt',
      'gte': 'gte',
      'lt': 'lt',
      'lte': 'lte',
      'iLike': 'ilike',
      'notILike': 'not.ilike',
      'inArray': 'in',
      'notInArray': 'not.in',
      'isEmpty': 'is.null',
      'isNotEmpty': 'not.is.null',
      'isBetween': 'gte' // Handle as range with two queries
    };
    
    return operatorMap[operator] || 'eq';
  }
}

export class SupabaseAdapter<TSchema = any> implements DatabaseAdapter<TSchema> {
  private filterBuilder: SupabaseFilterBuilder<TSchema>;
  private columnMapping: Record<string, string> = {
    // Map camelCase to snake_case for PostgreSQL
    'createdAt': 'created_at',
    'updatedAt': 'updated_at',
    'estimatedHours': 'estimated_hours',
  };
  private reverseColumnMapping: Record<string, string>;

  constructor(private config: SupabaseAdapterConfig) {
    this.filterBuilder = new SupabaseFilterBuilder(
      config.client,
      config.schema.tableName,
      config.schema
    );
    // Create reverse mapping for snake_case to camelCase
    this.reverseColumnMapping = Object.fromEntries(
      Object.entries(this.columnMapping).map(([key, value]) => [value, key])
    );
  }

  private mapColumnToDb(column: string): string {
    return this.columnMapping[column] || column;
  }

  private mapColumnFromDb(column: string): string {
    return this.reverseColumnMapping[column] || column;
  }

  private transformDataFromDb(data: any[]): TSchema[] {
    return data.map(row => {
      const transformed: any = {};
      for (const [key, value] of Object.entries(row)) {
        const mappedKey = this.mapColumnFromDb(key);
        transformed[mappedKey] = value;
      }
      return transformed as TSchema;
    });
  }

  private transformDataToDb(data: Partial<TSchema>): any {
    const transformed: any = {};
    for (const [key, value] of Object.entries(data)) {
      const mappedKey = this.mapColumnToDb(key);
      transformed[mappedKey] = value;
    }
    return transformed;
  }

  async findMany(params: QueryParams<TSchema>): Promise<TSchema[]> {
    let query = this.config.client
      .from(this.config.schema.tableName)
      .select('*');

    // Apply filters
    query = this.applyFilters(query, params.filters, params.joinOperator);

    // Apply sorting
    if (params.sorts.length > 0) {
      for (const sort of params.sorts) {
        const dbColumn = this.mapColumnToDb(sort.id as string);
        query = query.order(dbColumn, { ascending: !sort.desc });
      }
    }

    // Apply pagination
    if (params.limit) {
      query = query.range(params.offset, params.offset + params.limit - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Supabase query failed: ${error.message}`);
    }

    return this.transformDataFromDb(data || []);
  }

  async findManyWithCount(params: QueryParams<TSchema>): Promise<QueryResult<TSchema>> {
    let query = this.config.client
      .from(this.config.schema.tableName)
      .select('*', { count: 'exact' });

    // Apply filters
    query = this.applyFilters(query, params.filters, params.joinOperator);

    // Apply sorting
    if (params.sorts.length > 0) {
      for (const sort of params.sorts) {
        const dbColumn = this.mapColumnToDb(sort.id as string);
        query = query.order(dbColumn, { ascending: !sort.desc });
      }
    }

    // Apply pagination
    if (params.limit) {
      query = query.range(params.offset, params.offset + params.limit - 1);
    }

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Supabase query failed: ${error.message}`);
    }

    return {
      data: this.transformDataFromDb(data || []),
      total: count || 0
    };
  }

  async findFirst(params: Omit<QueryParams<TSchema>, 'limit' | 'offset'>): Promise<TSchema | null> {
    let query = this.config.client
      .from(this.config.schema.tableName)
      .select('*')
      .limit(1);

    // Apply filters
    query = this.applyFilters(query, params.filters, params.joinOperator);

    // Apply sorting
    if (params.sorts.length > 0) {
      for (const sort of params.sorts) {
        const dbColumn = this.mapColumnToDb(sort.id as string);
        query = query.order(dbColumn, { ascending: !sort.desc });
      }
    }

    const { data, error } = await query.single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      throw new Error(`Supabase query failed: ${error.message}`);
    }

    if (!data) return null;
    const transformed = this.transformDataFromDb([data]);
    return transformed[0] || null;
  }

  async count(params: CountParams<TSchema>): Promise<number> {
    let query = this.config.client
      .from(this.config.schema.tableName)
      .select('*', { count: 'exact', head: true });

    // Apply filters
    query = this.applyFilters(query, params.filters, params.joinOperator);

    const { count, error } = await query;

    if (error) {
      throw new Error(`Supabase count failed: ${error.message}`);
    }

    return count || 0;
  }

  async create(data: CreateData<TSchema>): Promise<TSchema> {
    const transformedData = this.transformDataToDb(data);
    const { data: result, error } = await this.config.client
      .from(this.config.schema.tableName)
      .insert(transformedData)
      .select()
      .single();

    if (error) {
      throw new Error(`Supabase insert failed: ${error.message}`);
    }

    const transformed = this.transformDataFromDb([result]);
    return transformed[0]!;
  }

  async update(id: string, data: UpdateData<TSchema>): Promise<TSchema> {
    const transformedData = this.transformDataToDb(data);
    const { data: result, error } = await this.config.client
      .from(this.config.schema.tableName)
      .update(transformedData)
      .eq(this.config.schema.primaryKey, id)
      .select()
      .single();

    if (error) {
      throw new Error(`Supabase update failed: ${error.message}`);
    }

    const transformed = this.transformDataFromDb([result]);
    return transformed[0]!;
  }

  async updateMany(ids: string[], data: UpdateData<TSchema>): Promise<TSchema[]> {
    const transformedData = this.transformDataToDb(data);
    const { data: result, error } = await this.config.client
      .from(this.config.schema.tableName)
      .update(transformedData)
      .in(this.config.schema.primaryKey, ids)
      .select();

    if (error) {
      throw new Error(`Supabase updateMany failed: ${error.message}`);
    }

    return this.transformDataFromDb(result || []);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.config.client
      .from(this.config.schema.tableName)
      .delete()
      .eq(this.config.schema.primaryKey, id);

    if (error) {
      throw new Error(`Supabase delete failed: ${error.message}`);
    }
  }

  async deleteMany(ids: string[]): Promise<void> {
    const { error } = await this.config.client
      .from(this.config.schema.tableName)
      .delete()
      .in(this.config.schema.primaryKey, ids);

    if (error) {
      throw new Error(`Supabase deleteMany failed: ${error.message}`);
    }
  }

  async aggregate(params: AggregateParams<TSchema>): Promise<AggregateResult[]> {
    // Supabase doesn't have built-in aggregation like Drizzle
    // We'll need to use RPC functions or manual grouping
    if (params.groupBy.length === 0) {
      throw new Error('Supabase adapter requires groupBy for aggregation');
    }

    // For now, implement basic count aggregation
    // In a real implementation, you'd create PostgreSQL functions for complex aggregations
    const groupByColumn = String(params.groupBy[0]);
    
    let query = this.config.client
      .from(this.config.schema.tableName)
      .select(`${groupByColumn}, count(*)`);

    // Apply filters
    query = this.applyFilters(query, params.filters, params.joinOperator);

    // Group by the column
    const { data, error } = await query;

    if (error) {
      throw new Error(`Supabase aggregation failed: ${error.message}`);
    }

    // Transform to expected format
    return (data || []).map((row: any) => {
      const result: Record<string, any> = {};
      result[groupByColumn] = row[groupByColumn];
      result[`${groupByColumn}_count`] = row.count;
      return result;
    });
  }

  async transaction<T>(fn: (ctx: TransactionContext<TSchema>) => Promise<T>): Promise<T> {
    // Supabase doesn't have explicit transactions in the JS client
    // All operations are atomic by default
    // For now, we'll just execute the function with the same adapter
    // In a real implementation, you might use database functions or handle this differently
    return await fn({ adapter: this });
  }

  private applyFilters(query: any, filters: ExtendedColumnFilter<TSchema>[], joinOperator: JoinOperator): any {
    for (const filter of filters) {
      const column = this.mapColumnToDb(filter.id as string);
      const value = this.normalizeFilterValue(filter);

      switch (filter.operator) {
        case 'eq':
          query = query.eq(column, value);
          break;
        case 'ne':
          query = query.neq(column, value);
          break;
        case 'gt':
          query = query.gt(column, value);
          break;
        case 'gte':
          query = query.gte(column, value);
          break;
        case 'lt':
          query = query.lt(column, value);
          break;
        case 'lte':
          query = query.lte(column, value);
          break;
        case 'iLike':
          query = query.ilike(column, `%${value}%`);
          break;
        case 'notILike':
          query = query.not(column, 'ilike', `%${value}%`);
          break;
        case 'inArray':
          if (Array.isArray(filter.value)) {
            query = query.in(column, filter.value);
          }
          break;
        case 'notInArray':
          if (Array.isArray(filter.value)) {
            query = query.not(column, 'in', filter.value);
          }
          break;
        case 'isEmpty':
          query = query.is(column, null);
          break;
        case 'isNotEmpty':
          query = query.not(column, 'is', null);
          break;
        case 'isBetween':
          if (Array.isArray(value) && value.length === 2) {
            query = query.gte(column, value[0]).lte(column, value[1]);
          }
          break;
        default:
          // Default to equality
          query = query.eq(column, value);
      }
    }

    return query;
  }

  private normalizeFilterValue(filter: ExtendedColumnFilter<TSchema>): any {
    // Handle date values - convert Unix timestamps to ISO strings
    if (this.isDateColumn(filter.id as string)) {
      if (filter.operator === 'isBetween' && Array.isArray(filter.value)) {
        return filter.value.map(this.convertToISOString);
      } else if (typeof filter.value === 'number' || typeof filter.value === 'string') {
        return this.convertToISOString(filter.value);
      }
    }

    // Handle array values
    if (filter.operator === 'inArray' && Array.isArray(filter.value)) {
      return filter.value;
    }

    return filter.value;
  }

  private isDateColumn(columnId: string): boolean {
    const dbColumn = this.mapColumnToDb(columnId);
    return dbColumn === 'created_at' || dbColumn === 'updated_at';
  }

  private convertToISOString(value: any): string {
    if (typeof value === 'number') {
      // Unix timestamp in milliseconds
      return new Date(value).toISOString();
    } else if (typeof value === 'string') {
      // Try to parse as number first, then as date string
      const numValue = Number(value);
      if (!isNaN(numValue)) {
        return new Date(numValue).toISOString();
      }
      return new Date(value).toISOString();
    }
    return value;
  }
}