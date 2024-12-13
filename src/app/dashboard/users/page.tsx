import * as React from "react"
import { headers } from "next/headers"
import { type SearchParams } from "@/types"

import { auth } from "@/lib/auth"
import { admin } from "@/lib/auth-client"
import { getValidFilters } from "@/lib/data-table"
import { Skeleton } from "@/components/ui/skeleton"
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton"
import { DateRangePicker } from "@/components/date-range-picker"
import { Shell } from "@/components/shell"

import { FeatureFlagsProvider } from "../../_components/feature-flags-provider"
import { TasksTable } from "../../_components/tasks-table"
import {
  getTaskPriorityCounts,
  getTasks,
  getTaskStatusCounts,
} from "../../_lib/queries"
import { searchParamsCache } from "../../_lib/validations"

interface IndexPageProps {
  searchParams: Promise<SearchParams>
}

export default async function IndexPage(props: IndexPageProps) {
  const searchParams = await props.searchParams
  const search = searchParamsCache.parse(searchParams)

  const validFilters = getValidFilters(search.filters)

  const session = await auth.api.getSession({
    headers: await headers(),
  })
  console.log(777, session)
  // if (!session) {
  //   return <div>Not authenticated</div>
  // }
  // const users = await admin.listUsers({
  //   query: {
  //     limit: 10,
  //   },
  // })

  // console.log(44444, users)

  // const updatedUser = await admin.setRole({
  //   userId: "RXff-iYPkJ3R40HiUmm4k",
  //   role: "user",
  // })
  // console.log(55555, updatedUser)

  // const session = await auth.api.getSession({
  //   headers: await headers(),
  // })
  // console.log(777, session)
  // if (!session) {
  //   return <div>Not authenticated</div>
  // }

  // const newUser = await admin.createUser({
  //   name: "Test User",
  //   email: "test@example.com",
  //   password: "password123",
  //   role: "user",
  //   data: {
  //     // any additional on the user table including plugin fields and custom fields
  //     customField: "customValue",
  //   },
  // })

  // console.log(55555, newUser)

  // const promises = Promise.all([
  //   getTasks({
  //     ...search,
  //     filters: validFilters,
  //   }),
  //   getTaskStatusCounts(),
  //   getTaskPriorityCounts(),
  // ])

  // const tasks = await getTasks({
  //   ...search,
  //   filters: validFilters,
  // })

  // console.log(1111, tasks)

  return (
    <Shell className="gap-2">
      {/* <FeatureFlagsProvider>
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
              columnCount={6}
              searchableColumnCount={1}
              filterableColumnCount={2}
              cellWidths={["10rem", "40rem", "12rem", "12rem", "8rem", "8rem"]}
              shrinkZero
            />
          }
        >
          <TasksTable promises={promises} />
        </React.Suspense>
      </FeatureFlagsProvider> */}
    </Shell>
  )
}
