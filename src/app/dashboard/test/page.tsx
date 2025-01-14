import { Suspense } from "react"
import { type SearchParams } from "nuqs/server"

import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton"
import PageContainer from "@/components/layout/page-container"

import { getUsers } from "./actions"
import { searchParamsCache, serialize } from "./search-params"
import { UsersTable } from "./users-table"

export default async function UsersPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = await searchParamsCache.parse(searchParams)

  // const { data, pageCount } = await getUsers(params)

  const promises = Promise.all([getUsers(params)])

  // This key is used for invoke suspense if any of the search params changed (used for filters).
  const key = serialize({ ...searchParams })

  return (
    <PageContainer scrollable={false}>
      {/* <Suspense fallback={<div>Loading...</div>}> */}
      <Suspense
        // key={key}
        fallback={
          <DataTableSkeleton
            columnCount={5}
            searchableColumnCount={1}
            filterableColumnCount={2}
            cellWidths={["10rem", "40rem", "12rem", "12rem", "8rem", "8rem"]}
            shrinkZero
          />
        }
      >
        {/* <Users searchParams={params} /> */}
        <UsersTable
          // initialData={data}
          // pageCount={pageCount}
          initialState={params}
          promises={promises}
        />
      </Suspense>
    </PageContainer>
  )
}
