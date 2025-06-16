import type { ExtendedColumnFilter, ExtendedColumnSort, JoinOperator } from "@/types/data-table";

export interface QueryParams<TSchema = any> {
  filters: ExtendedColumnFilter<TSchema>[];
  sorts: ExtendedColumnSort<TSchema>[];
  limit: number;
  offset: number;
  joinOperator: JoinOperator;
}

export interface CountParams<TSchema = any> {
  filters: ExtendedColumnFilter<TSchema>[];
  joinOperator: JoinOperator;
}

export interface QueryResult<TSchema = any> {
  data: TSchema[];
  total: number;
}

export interface AggregateParams<TSchema = any> {
  filters: ExtendedColumnFilter<TSchema>[];
  joinOperator: JoinOperator;
  groupBy: Array<keyof TSchema>;
  aggregates: {
    [K in keyof TSchema]?: {
      count?: boolean;
      sum?: boolean;
      avg?: boolean;
      min?: boolean;
      max?: boolean;
    };
  };
}

export interface AggregateResult {
  [key: string]: any;
}

export interface GroupByResult {
  [key: string]: any;
}

export type CreateData<TSchema = any> = {
  [K in keyof TSchema]?: TSchema[K];
}

export type UpdateData<TSchema = any> = {
  [K in keyof TSchema]?: TSchema[K];
}

export interface WhereClause {
  [key: string]: any;
}

export interface OrderByClause {
  [key: string]: any;
}

export interface TransactionContext<TSchema = any> {
  adapter: DatabaseAdapter<TSchema>;
}

export interface DatabaseAdapter<TSchema = any> {
  findMany(params: QueryParams<TSchema>): Promise<TSchema[]>;
  findManyWithCount(params: QueryParams<TSchema>): Promise<QueryResult<TSchema>>;
  findFirst(params: Omit<QueryParams<TSchema>, 'limit' | 'offset'>): Promise<TSchema | null>;
  count(params: CountParams<TSchema>): Promise<number>;
  aggregate(params: AggregateParams<TSchema>): Promise<AggregateResult[]>;
  
  create(data: CreateData<TSchema>): Promise<TSchema>;
  update(id: string, data: UpdateData<TSchema>): Promise<TSchema>;
  updateMany(ids: string[], data: UpdateData<TSchema>): Promise<TSchema[]>;
  delete(id: string): Promise<void>;
  deleteMany(ids: string[]): Promise<void>;
  
  transaction<T>(fn: (ctx: TransactionContext<TSchema>) => Promise<T>): Promise<T>;
}

export interface FilterBuilder<TSchema = any> {
  buildWhereClause(
    filters: ExtendedColumnFilter<TSchema>[],
    joinOperator: JoinOperator
  ): WhereClause;
  buildOrderByClause(sorts: ExtendedColumnSort<TSchema>[]): OrderByClause;
}

export type AdapterType = 'drizzle' | 'supabase';

export interface SchemaDefinition {
  tableName: string;
  primaryKey: string;
  columns: {
    [key: string]: {
      type: 'string' | 'number' | 'boolean' | 'date';
      nullable?: boolean;
      enum?: readonly string[];
    };
  };
}

export interface DrizzleAdapterConfig {
  type: 'drizzle';
  db: any;
  table: any;
  schema: SchemaDefinition;
}

export interface SupabaseAdapterConfig {
  type: 'supabase';
  client: any;
  schema: SchemaDefinition;
}

export type AdapterConfig = DrizzleAdapterConfig | SupabaseAdapterConfig;