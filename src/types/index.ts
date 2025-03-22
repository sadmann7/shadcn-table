import type { SQL } from "drizzle-orm";

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export interface SearchParams {
  [key: string]: string | string[] | undefined;
}

export interface QueryBuilderOpts {
  where?: SQL;
  orderBy?: SQL;
  distinct?: boolean;
  nullish?: boolean;
}
