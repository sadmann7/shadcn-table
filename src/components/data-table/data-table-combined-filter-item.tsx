import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import type { DataTableFilterOptions } from "@/types"
import { TrashIcon } from "@radix-ui/react-icons"

import { useDebounce } from "@/hooks/use-debounce"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

const filterVarieties = ["contains", "does not contain", "is", "is not"]

interface DataTableCombinedFilterItemProps<TData> {
  option: DataTableFilterOptions<TData>
  setSelectedOptions: React.Dispatch<
    React.SetStateAction<DataTableFilterOptions<TData>[]>
  >
}

export function DataTableCombinedFilterItem<TData>({
  option,
  setSelectedOptions,
}: DataTableCombinedFilterItemProps<TData>) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [value, setValue] = React.useState("")
  const [filterVariety, setFilterVariety] = React.useState(filterVarieties[0])
  const debounceValue = useDebounce(value, 500)

  // Create query string
  const createQueryString = React.useCallback(
    (params: Record<string, string | number | null>) => {
      const newSearchParams = new URLSearchParams(searchParams?.toString())

      for (const [key, value] of Object.entries(params)) {
        if (value === null) {
          newSearchParams.delete(key)
        } else {
          newSearchParams.set(key, String(value))
        }
      }

      return newSearchParams.toString()
    },
    [searchParams]
  )

  React.useEffect(() => {
    router.push(
      `${pathname}?${createQueryString({
        [option.value]: `${debounceValue}${
          debounceValue.length > 0 ? `.${filterVariety}` : ""
        }`,
      })}`,
      {
        scroll: false,
      }
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounceValue])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 rounded-full">
          {value.length > 0 ? (
            <>
              <span className="font-medium">{String(option.label)}:</span>
              <span className="ml-1">{value}</span>
            </>
          ) : (
            option.label
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60 space-y-1 text-xs">
        <div className="flex items-center space-x-1">
          <div className="flex flex-1 items-center space-x-1">
            <div>{option.label}</div>
            <Select onValueChange={(value) => setFilterVariety(value)}>
              <SelectTrigger className="h-auto w-fit truncate border-none px-2 py-0.5 hover:bg-muted/50">
                <SelectValue placeholder={filterVarieties[0]} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {filterVarieties.map((variety) => (
                    <SelectItem key={variety} value={variety}>
                      {variety}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <Button
            aria-label="Remove filter"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              router.push(
                `${pathname}?${createQueryString({
                  [option.value]: null,
                })}`,
                {
                  scroll: false,
                }
              )
              setSelectedOptions((prev) =>
                prev.filter((item) => item.value !== option.value)
              )
            }}
          >
            <TrashIcon className="h-4 w-4" aria-hidden />
          </Button>
        </div>
        <Input
          placeholder="Type here..."
          autoFocus
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
      </PopoverContent>
    </Popover>
  )
}
