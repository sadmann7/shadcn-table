import { getUsers } from "./actions"
import { ParsedSearchParams } from "./search-params"
// import { SearchParams } from "../search-params";
// import { PostsSearch } from "./posts-search";
import { UsersTable } from "./users-table"

type UsersProps = {
  searchParams: ParsedSearchParams
}

const Users = async ({ searchParams }: UsersProps) => {
  const { data, pageCount } = await getUsers(searchParams)

  return (
    <UsersTable
      initialData={data}
      pageCount={pageCount}
      initialState={searchParams}
    />
  )
}

export default Users
