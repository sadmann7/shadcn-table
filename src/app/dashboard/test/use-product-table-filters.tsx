"use client"

import { useCallback, useMemo } from "react"
import { useQueryState } from "nuqs"

import { searchParamsParsers } from "./search-params"

export const CATEGORY_OPTIONS = [
  { value: "Electronics", label: "Electronics" },
  { value: "Furniture", label: "Furniture" },
  { value: "Clothing", label: "Clothing" },
  { value: "Toys", label: "Toys" },
  { value: "Groceries", label: "Groceries" },
  { value: "Books", label: "Books" },
  { value: "Jewelry", label: "Jewelry" },
  { value: "Beauty Products", label: "Beauty Products" },
]
export function useProductTableFilters() {
  const [searchQuery, setSearchQuery] = useQueryState(
    "globalFilter",
    searchParamsParsers.globalFilter
      .withOptions({ shallow: false, throttleMs: 1000 })
      .withDefault("")
  )

  // const [categoriesFilter, setCategoriesFilter] = useQueryState(
  //   'categories',
  //   searchParamsParsers.categories.withOptions({ shallow: false }).withDefault('')
  // );

  const [page, setPage] = useQueryState(
    "page",
    searchParamsParsers.pageIndex.withDefault(1)
  )

  const resetFilters = useCallback(() => {
    setSearchQuery(null)
    // setCategoriesFilter(null);

    setPage(1)
  }, [setSearchQuery, setPage])

  const isAnyFilterActive = useMemo(() => {
    return !!searchQuery
  }, [searchQuery])

  return {
    searchQuery,
    setSearchQuery,
    page,
    setPage,
    resetFilters,
    isAnyFilterActive,
    // categoriesFilter,
    // setCategoriesFilter
  }
}
