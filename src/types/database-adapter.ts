// Re-export all adapter types for use in other parts of the application
export type {
  QueryParams,
  CountParams,
  QueryResult,
  AggregateParams,
  AggregateResult,
  GroupByResult,
  CreateData,
  UpdateData,
  WhereClause,
  OrderByClause,
  TransactionContext,
  DatabaseAdapter,
  FilterBuilder,
  AdapterType,
  SchemaDefinition,
  DrizzleAdapterConfig,
  SupabaseAdapterConfig,
  AdapterConfig,
} from "@/lib/database-adapter/types";

// Convenience type for Task-specific operations
export type TaskDatabaseAdapter = import("@/lib/database-adapter/types").DatabaseAdapter<import("@/db/schema").Task>;