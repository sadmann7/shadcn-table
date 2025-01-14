"use client"

import {
  use,
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react"
import { useRouter } from "next/navigation"
import { tasks, type Task } from "@/db/schema"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { useQueryStates } from "nuqs"
import { useDebouncedCallback } from "use-debounce"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { getUsers } from "./actions"
import { columns } from "./columns"
import { searchParamsParsers } from "./search-params"
import { TableState } from "./types"

type InputProps = React.ComponentProps<"input">
const ControlledInput: React.FC<InputProps> = (props) => {
  const { value, onChange, ...rest } = props
  const [cursor, setCursor] = useState<number | null>(null)
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    ref.current?.setSelectionRange(cursor, cursor)
  }, [ref, cursor, value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCursor(e.target.selectionStart)
    onChange?.(e)
  }

  return <Input ref={ref} value={value} onChange={handleChange} {...rest} />
}

export function useTableSearchParams() {
  return useQueryStates(searchParamsParsers)
}

// export type GetTasks = Awaited<ReturnType<typeof searchParamsCache.parse>>

interface UsersTableProps {
  // initialData: Task[]
  // pageCount: number
  initialState: TableState
  promises: Promise<[Awaited<ReturnType<typeof getUsers>>]>
}

export function UsersTable({
  // initialData,
  // pageCount,
  initialState,
  promises,
}: UsersTableProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [{ data, pageCount }] = use(promises)

  console.log(44444, tasks)

  const [
    { sorting, columnFilters, globalFilter, pageIndex, pageSize },
    setTableState,
  ] = useTableSearchParams()

  const table = useReactTable({
    data,
    columns,
    pageCount,
    state: {
      // sorting: sorting || initialState.sorting,
      // columnFilters: columnFilters || initialState.columnFilters,
      globalFilter: globalFilter || initialState.globalFilter,
      pagination: {
        pageIndex: pageIndex || initialState.pageIndex,
        pageSize: pageSize || initialState.pageSize,
      },
    },
    onSortingChange: (updater) => {
      const newValue =
        typeof updater === "function" ? updater(sorting) : updater
      startTransition(() => {
        setTableState({ sorting: newValue })
        // router.refresh()
      })
    },
    // onColumnFiltersChange: (updater) => {
    //   const newValue =
    //     typeof updater === "function" ? updater(columnFilters) : updater
    //   startTransition(() => {
    //     setTableState({ columnFilters: newValue })
    //     router.refresh()
    //   })
    // },
    onGlobalFilterChange: (value) => {
      startTransition(() => {
        setTableState({ globalFilter: value, pageIndex: 0 })
        // router.refresh()
      })
    },
    onPaginationChange: (updater) => {
      startTransition(() => {
        setTableState(
          typeof updater === "function"
            ? updater({ pageIndex, pageSize })
            : updater
        )
        // router.refresh()
      })
    },
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
  })

  return (
    <div>
      <div className="flex items-center justify-between py-4">
        <Input
          placeholder="Filter all columns..."
          defaultValue={globalFilter ?? ""}
          onChange={(event) => table.setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />
        {isPending && (
          <div className="text-sm text-muted-foreground">Refreshing...</div>
        )}
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage() || isPending}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage() || isPending}
        >
          Next
        </Button>
      </div>
      {/* <UpdateTaskSheet
        open={rowAction?.type === "update"}
        onOpenChange={() => setRowAction(null)}
        task={rowAction?.row.original ?? null}
      />
      <DeleteTasksDialog
        open={rowAction?.type === "delete"}
        onOpenChange={() => setRowAction(null)}
        tasks={rowAction?.row.original ? [rowAction?.row.original] : []}
        showTrigger={false}
        onSuccess={() => rowAction?.row.toggleSelected(false)}
      /> */}
    </div>
  )
}
