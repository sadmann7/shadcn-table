import { Suspense } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import { type SearchParams } from "nuqs/server"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton"
import PageContainer from "@/components/layout/page-container"

import { getUsers } from "./actions"
import { DataTable } from "./data-table"
import { searchParamsCache, serialize } from "./search-params"
import TableActions from "./table-actions"

export default async function UsersPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = await searchParamsCache.parse(searchParams)

  // const { data, pageCount } = await getUsers(params)

  const promises = Promise.all([getUsers(params)])

  // This key is used for invoke suspense if any of the search params changed (used for filters).
  const key = serialize({ ...params })
  console.log(2222, key)

  return (
    <PageContainer scrollable={false}>
      <div className="flex flex-1 flex-col space-y-4">
        <div className="flex items-start justify-between">
          <Heading title="Працівники" description="Управління працівниками" />
          <Link
            href="/dashboard/product/new"
            className={cn(buttonVariants(), "text-xs md:text-sm")}
          >
            <Plus className="mr-2 h-4 w-4" /> Додати
          </Link>
        </div>
        <Separator />
        <TableActions />
        {/* <Suspense
            key={key}
            fallback={<DataTableSkeleton columnCount={5} rowCount={10} />}
          > */}
        {/* <ProductListingPage /> */}
        <DataTable
          key={key}
          // initialData={data}
          // pageCount={pageCount}
          initialState={params}
          promises={promises}
        />
        {/* </Suspense> */}
      </div>
    </PageContainer>
  )
}

{
  /* <Suspense
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
        <UsersTable
          // initialData={data}
          // pageCount={pageCount}
          initialState={params}
          promises={promises}
        />
      </Suspense> */
}
