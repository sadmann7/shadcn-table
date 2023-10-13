import type { DataTableFilterOptions } from "@/types"
import { TrashIcon } from "@radix-ui/react-icons"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Input } from "../ui/input"

const options = [
  "contains",
  "does not contain",
  "is",
  "is not",
  "starts with",
  "ends with",
  "is empty",
  "is not empty",
]

interface DataTableCombinedFilterItemProps<TData> {
  option: DataTableFilterOptions<TData>
}

export function DataTableCombinedFilterItem<TData>({
  option,
}: DataTableCombinedFilterItemProps<TData>) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          {option.label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60 space-y-1 text-xs">
        <div className="flex items-center space-x-1">
          <div className="flex flex-1 items-center space-x-1">
            <div>{option.label}</div>
            <Select>
              <SelectTrigger className="h-auto w-fit border-none px-2 py-0.5 hover:bg-muted/50">
                <SelectValue placeholder={options[0]} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {options.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <TrashIcon className="h-4 w-4" aria-hidden />
          </Button>
        </div>
        <Input placeholder="Type here..." />
      </PopoverContent>
    </Popover>
  )
}
