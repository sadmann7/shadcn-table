import { DataTableLoading } from "@/components/data-table/data-table-loading"
import { Shell } from "@/components/shells/shell"

export default function IndexLoading() {
  return (
    <Shell>
      <DataTableLoading columnCount={4} />
    </Shell>
  )
}
