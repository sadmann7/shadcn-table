import { useTransition } from "react"
import { users, type User } from "@/db/schema"
import { ColumnDef } from "@tanstack/react-table"
import { Check, ChevronsUpDown, Ellipsis } from "lucide-react"

import { cn, formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { DataTableColumnHeader } from "./data-table-column-header"
import { SelectFilter, TextFilter } from "./filters"

// const DataTableColumnHeader = ({
//   column,
//   title,
// }: {
//   column: any
//   title: string
// }) => {
//   return <div>{title}</div>
// }

// console.log(tasks.label.enumValues)

export const columns: ColumnDef<User>[] = [
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
    accessorKey: "name",
    header: ({ column }) => (
      <div>
        <DataTableColumnHeader column={column} title="Імʼя" />
        <TextFilter column={column} />
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <div>
        <DataTableColumnHeader column={column} title="Пошта" />
        <TextFilter column={column} />
      </div>
    ),
  },
  // {
  //   accessorKey: "label",
  //   header: ({ column }) => (
  //     <div>
  //       <DataTableColumnHeader column={column} title="Ярлик" />
  //       <SelectFilter
  //         column={column}
  //         options={users.label.enumValues.map((item: any) => ({
  //           value: item,
  //           label: item,
  //         }))}
  //       />
  //     </div>
  //   ),
  //   // enableSorting: true,
  //   // enableHiding: true,
  //   // filterFn: (row, id, value) => {
  //   //   // console.log(row, id, value)
  //   //   const rowValue = row.getValue(id)
  //   //   if (typeof value === "string") return value === String(rowValue)
  //   //   if (typeof value === "boolean") return value === rowValue
  //   //   if (Array.isArray(value)) return value.includes(rowValue)
  //   //   return false
  //   // },
  // },
  // {
  //   accessorKey: "status",
  //   header: ({ column }) => (
  //     <div>
  //       <DataTableColumnHeader column={column} title="Статус" />
  //       <SelectFilter
  //         column={column}
  //         options={tasks.status.enumValues.map((item: any) => ({
  //           value: item,
  //           label: item,
  //         }))}
  //       />
  //     </div>
  //   ),
  //   filterFn: (row, id, value) => {
  //     return value.includes(row.getValue(id))
  //   },
  // },
  // {
  //   accessorKey: "createdAt",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Дата створення" />
  //   ),
  //   cell: ({ row }) => formatDate(row.getValue("createdAt")),
  // },
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
              Редагувати
            </DropdownMenuItem>
            {/* <DropdownMenuSub>
              <DropdownMenuSubTrigger>Labels</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuRadioGroup
                  // value={row.original.label}
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
                  {tasks.label.enumValues.map((label) => (
                    <DropdownMenuRadioItem
                      key={label}
                      value={label}
                      className="capitalize"
                      disabled={isUpdatePending}
                    >
                      {label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub> */}
            <DropdownMenuSeparator />
            <DropdownMenuItem
            // onSelect={() => setRowAction({ row, type: "delete" })}
            >
              Видалити
              <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
    size: 40,
  },
]
