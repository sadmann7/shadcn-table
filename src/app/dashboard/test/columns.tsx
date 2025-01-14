import { useTransition } from "react"
import { Task } from "@/db/schema"
import { ColumnDef } from "@tanstack/react-table"
import { Ellipsis } from "lucide-react"

import { formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { DataTableColumnHeader } from "./data-table-column-header"

// const DataTableColumnHeader = ({
//   column,
//   title,
// }: {
//   column: any
//   title: string
// }) => {
//   return <div>{title}</div>
// }

export const columns: ColumnDef<Task>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Вибрати всі"
        className="translate-y-0.5"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Вибрати рядок"
        className="translate-y-0.5"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
  },
  {
    accessorKey: "label",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Label" />
    ),
    // enableSorting: true,
    // enableHiding: true,
    // filterFn: (row, id, value) => {
    //   // console.log(row, id, value)
    //   const rowValue = row.getValue(id)
    //   if (typeof value === "string") return value === String(rowValue)
    //   if (typeof value === "boolean") return value === rowValue
    //   if (Array.isArray(value)) return value.includes(rowValue)
    //   return false
    // },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created At" />
    ),
    cell: ({ row }) => formatDate(row.getValue("createdAt")),
  },
  {
    id: "actions",
    cell: function Cell({ row }) {
      const [isUpdatePending, startUpdateTransition] = useTransition()

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              aria-label="Open menu"
              variant="ghost"
              className="flex size-8 p-0 data-[state=open]:bg-muted"
            >
              <Ellipsis className="size-4" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem
            // onSelect={() => setRowAction({ row, type: "update" })}
            >
              Edit
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Labels</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuRadioGroup
                  value={row.original.label}
                  onValueChange={(value) => {
                    startUpdateTransition(() => {
                      // toast.promise(
                      //   updateTask({
                      //     id: row.original.id,
                      //     label: value as Task["label"],
                      //   }),
                      //   {
                      //     loading: "Updating...",
                      //     success: "Label updated",
                      //     error: (err) => getErrorMessage(err),
                      //   }
                      // )
                    })
                  }}
                >
                  {/* {tasks.label.enumValues.map((label) => (
                    <DropdownMenuRadioItem
                      key={label}
                      value={label}
                      className="capitalize"
                      disabled={isUpdatePending}
                    >
                      {label}
                    </DropdownMenuRadioItem>
                  ))} */}
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem
            // onSelect={() => setRowAction({ row, type: "delete" })}
            >
              Delete
              <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
    size: 40,
  },
]
