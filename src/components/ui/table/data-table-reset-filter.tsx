"use client"

import { useTableSearchParams } from "@/app/dashboard/test/data-table"

import { Button } from "../button"

type DataTableResetFilterProps = {
  isFilterActive: boolean
  onReset: () => void
}

export function DataTableResetFilter({
  isFilterActive,
  onReset,
}: DataTableResetFilterProps) {
  const [
    { sorting, columnFilters, globalFilter, pageIndex, pageSize },
    setTableState,
  ] = useTableSearchParams()
  console.log(useTableSearchParams())

  return (
    <>
      {isFilterActive || sorting || columnFilters || globalFilter ? (
        <Button variant="outline" onClick={() => setTableState(null)}>
          Скинути
        </Button>
      ) : null}
    </>
  )
}
