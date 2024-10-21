"use memo"

import * as React from "react"
import { type SearchParams } from "@/types"

import { Skeleton } from "@/components/ui/skeleton"
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton"
import { DateRangePicker } from "@/components/date-range-picker"
import { Shell } from "@/components/shell"

import { TasksTable } from "./_components/tasks-table"
import { TasksTableProvider } from "./_components/tasks-table-provider"
import { getTasks } from "./_lib/queries"
import { searchParamsSchema } from "./_lib/validations"

export interface IndexPageProps {
  searchParams: SearchParams
}

export default async function IndexPage({ searchParams }: IndexPageProps) {
  const search = searchParamsSchema.parse(searchParams)

  const tasksPromise = getTasks(search)

  return (
    <Shell className="gap-2">
      <TasksTableProvider>
        <React.Suspense fallback={<Skeleton className="h-7 w-52" />}>
          <DateRangePicker
            triggerSize="sm"
            triggerClassName="ml-auto w-56 sm:w-60"
            align="end"
            shallow={false}
          />
        </React.Suspense>
        <React.Suspense
          fallback={
            <DataTableSkeleton
              columnCount={5}
              searchableColumnCount={1}
              filterableColumnCount={2}
              cellWidths={["10rem", "40rem", "12rem", "12rem", "8rem"]}
              shrinkZero
            />
          }
        >
          {/**
           * Passing promises and consuming them using React.use for triggering the suspense fallback.
           * @see https://react.dev/reference/react/use
           */}
          <TasksTable tasksPromise={tasksPromise} />
        </React.Suspense>
      </TasksTableProvider>
    </Shell>
  )
}
