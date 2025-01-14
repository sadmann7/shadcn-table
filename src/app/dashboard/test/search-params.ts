import { ColumnFiltersState, SortingState } from "@tanstack/react-table"
import {
  createLoader,
  createParser,
  createSearchParamsCache,
  createSerializer,
  parseAsFloat,
  parseAsInteger,
  parseAsString,
} from "nuqs/server"

const pageSizeParser = createParser({
  parse: (query) => {
    const pageSize = parseAsInteger.parse(query)
    return pageSize === null ? null : pageSize
  },
  serialize: (value) => {
    return parseAsInteger.serialize(value)
  },
})

const pageIndexParser = createParser({
  parse: (query) => {
    const page = parseAsInteger.parse(query)
    return page === null ? null : page - 1
  },
  serialize: (value) => {
    return parseAsInteger.serialize(value + 1)
  },
})

const sortParser = createParser({
  parse: (query) => {
    return parseSorting(query)
  },
  serialize: (value) => {
    return JSON.stringify(value)
  },
})

// Describe your search params, and reuse this in useQueryStates / createSerializer:
export const searchParamsParsers = {
  pageIndex: pageIndexParser.withDefault(0).withOptions({
    // false: refresh on change , true: not refresh on change
    shallow: false,
    clearOnDefault: true,
  }),
  pageSize: pageSizeParser.withDefault(10).withOptions({
    shallow: false,
    clearOnDefault: true,
  }),
  sorting: sortParser.withDefault([]).withOptions({
    shallow: false,
    clearOnDefault: true,
  }),
  //   filters: parseColumnFilters.withDefault([]),
  globalFilter: parseAsString.withDefault("").withOptions({
    shallow: false,
    clearOnDefault: true,
    throttleMs: 1000,
  }),
}

const urlKeys = {
  pageIndex: "page",
  pageSize: "perPage",
  globalFilter: "search",
}

export const searchParamsCache = createSearchParamsCache(searchParamsParsers)
export const serialize = createSerializer(searchParamsParsers)

// export type ParsedSearchParams = typeof searchParamsCache.parse

// export const loadSearchParams = createLoader(searchParamsCache)

function parseSorting(sortParam?: string): SortingState {
  if (!sortParam) return []
  try {
    const parsed = JSON.parse(sortParam)
    if (!Array.isArray(parsed)) return []
    return parsed.map((item: any) => ({
      id: String(item.id),
      desc: Boolean(item.desc),
    }))
  } catch {
    return []
  }
}

// function parseColumnFilters(filtersParam?: string): ColumnFiltersState {
//   if (!filtersParam) return []
//   try {
//     const parsed = JSON.parse(filtersParam)
//     if (!Array.isArray(parsed)) return []
//     return parsed.map((item: any) => ({
//       id: String(item.id),
//       value: item.value,
//     }))
//   } catch {
//     return []
//   }
// }

// function parsePageIndex(pageParam?: string): number {
//   if (!pageParam) return 0
//   const parsed = parseInt(pageParam, 10)
//   // Convert from 1-based to 0-based index
//   return isNaN(parsed) ? 0 : Math.max(0, parsed - 1)
// }

// function parsePageSize(perPageParam?: string): number {
//   if (!perPageParam) return 10
//   const parsed = parseInt(perPageParam, 10)
//   return isNaN(parsed) ? 10 : parsed
// }
