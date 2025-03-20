import type { ExtendedColumnSort, Filter } from "@/types";
import type { Row, SortingState } from "@tanstack/react-table";
import { createParser } from "nuqs/server";
import { z } from "zod";

import { dataTableConfig } from "@/config/data-table";

export const sortingItemSchema = z.object({
  id: z.string(),
  desc: z.boolean(),
});

export const getSortingStateParser = <TData>(
  columnIds?: string[] | Set<string>,
) => {
  const validKeys = columnIds
    ? columnIds instanceof Set
      ? columnIds
      : new Set(columnIds)
    : null;

  return createParser<ExtendedColumnSort<TData>[]>({
    parse: (value) => {
      try {
        const parsed = JSON.parse(value);
        const result = z.array(sortingItemSchema).safeParse(parsed);

        if (!result.success) return null;

        if (validKeys && result.data.some((item) => !validKeys.has(item.id))) {
          return null;
        }

        return result.data as ExtendedColumnSort<TData>[];
      } catch {
        return null;
      }
    },
    serialize: (value) => JSON.stringify(value),
    eq: (a, b) =>
      a.length === b.length &&
      a.every(
        (item, index) =>
          item.id === b[index]?.id && item.desc === b[index]?.desc,
      ),
  });
};

export const filterSchema = z.object({
  id: z.string(),
  value: z.union([z.string(), z.array(z.string())]),
  variant: z.enum(dataTableConfig.columnVariants),
  operator: z.enum(dataTableConfig.operators),
  filterId: z.string(),
});

export const getFiltersStateParser = <T>(
  columnIds?: string[] | Set<string>,
) => {
  const validKeys = columnIds
    ? columnIds instanceof Set
      ? columnIds
      : new Set(columnIds)
    : null;

  return createParser<Filter<T>[]>({
    parse: (value) => {
      try {
        const parsed = JSON.parse(value);
        const result = z.array(filterSchema).safeParse(parsed);

        if (!result.success) return null;

        if (validKeys && result.data.some((item) => !validKeys.has(item.id))) {
          return null;
        }

        return result.data as Filter<T>[];
      } catch {
        return null;
      }
    },
    serialize: (value) => JSON.stringify(value),
    eq: (a, b) =>
      a.length === b.length &&
      a.every(
        (filter, index) =>
          filter.id === b[index]?.id &&
          filter.value === b[index]?.value &&
          filter.variant === b[index]?.variant &&
          filter.operator === b[index]?.operator,
      ),
  });
};
