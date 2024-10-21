import * as React from "react"
import { type SearchParams } from "@/types"

import { Skeleton } from "@/components/ui/skeleton"
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton"
import { DateRangePicker } from "@/components/date-range-picker"
import { Shell } from "@/components/shell"

import { FeatureFlagsProvider } from "./_components/feature-flags-provider"
import { TasksTable } from "./_components/tasks-table"
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
      <FeatureFlagsProvider>
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
          <TasksTable tasksPromise={tasksPromise} />
        </React.Suspense>
      </FeatureFlagsProvider>
    </Shell>
  )
}
