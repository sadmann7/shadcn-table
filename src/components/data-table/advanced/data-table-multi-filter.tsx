import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import type { DataTableFilterOption } from "@/types"
import {
  CopyIcon,
  DotsHorizontalIcon,
  TextAlignCenterIcon,
  TrashIcon,
} from "@radix-ui/react-icons"
import type { Table } from "@tanstack/react-table"

import { useDebounce } from "@/hooks/use-debounce"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Separator } from "@/components/ui/separator"

import { DataTableFacetedFilter } from "../data-table-faceted-filter"

const operators = [
  {
    label: "And",
    value: "and",
  },
  {
    label: "Or",
    value: "or",
  },
]

interface DataTableMultiFilterProps<TData> {
  table: Table<TData>
  allOptions: DataTableFilterOption<TData>[]
  options: DataTableFilterOption<TData>[]
  setSelectedOptions: React.Dispatch<
    React.SetStateAction<DataTableFilterOption<TData>[]>
  >
}

export function DataTableMultiFilter<TData>({
  table,
  allOptions,
  options,
  setSelectedOptions,
}: DataTableMultiFilterProps<TData>) {
  const [open, setOpen] = React.useState(true)
  const [operator, setOperator] = React.useState(operators[0])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-7 truncate rounded-full"
        >
          <TextAlignCenterIcon className="mr-2 size-3" aria-hidden="true" />
          {options.length} rule
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-fit p-0 text-xs" align="start">
        <div className="space-y-2 p-4">
          {options.map((option, i) => (
            <MultiFilterRow
              key={option.id ?? i}
              i={i}
              option={option}
              table={table}
              allOptions={allOptions}
              options={options}
              setSelectedOptions={setSelectedOptions}
              operator={operator}
              setOperator={setOperator}
            />
          ))}
        </div>
        <Separator />
        <div className="p-1">
          <Button
            aria-label="Delete filter"
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={() => {
              setSelectedOptions((prev) => prev.filter((item) => !item.isMulti))
            }}
          >
            Delete filter
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

interface MultiFilterRowProps<TData> extends DataTableMultiFilterProps<TData> {
  i: number
  option: DataTableFilterOption<TData>
  operator?: (typeof operators)[number]
  setOperator: React.Dispatch<
    React.SetStateAction<(typeof operators)[number] | undefined>
  >
}

export function MultiFilterRow<TData>({
  i,
  table,
  option,
  allOptions,
  options,
  setSelectedOptions,
  operator,
  setOperator,
}: MultiFilterRowProps<TData>) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [value, setValue] = React.useState("")
  const debounceValue = useDebounce(value, 500)

  const [selectedOption, setSelectedOption] = React.useState<
    DataTableFilterOption<TData> | undefined
  >(options[0])

  const filterVarieties = selectedOption?.items.length
    ? ["is", "is not"]
    : ["contains", "does not contain", "is", "is not"]

  const [filterVariety, setFilterVariety] = React.useState(filterVarieties[0])

  // Update filter variety
  React.useEffect(() => {
    if (selectedOption?.items.length) {
      setFilterVariety("is")
    }
  }, [selectedOption?.items.length])

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

  // Update query string
  React.useEffect(() => {
    if (debounceValue.length > 0) {
      router.push(
        `${pathname}?${createQueryString({
          [selectedOption?.value ?? ""]: `${debounceValue}${
            debounceValue.length > 0 ? `.${filterVariety}` : ""
          }`,
        })}`,
        {
          scroll: false,
        }
      )
    }

    if (debounceValue.length === 0) {
      router.push(
        `${pathname}?${createQueryString({
          [selectedOption?.value ?? ""]: null,
        })}`,
        {
          scroll: false,
        }
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounceValue, filterVariety, selectedOption?.value])

  // Update operator query string
  React.useEffect(() => {
    if (operator?.value) {
      router.push(
        `${pathname}?${createQueryString({
          operator: operator.value,
        })}`,
        {
          scroll: false,
        }
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [operator?.value])

  return (
    <div className="flex items-center space-x-2">
      {i === 0 ? (
        <div>Where</div>
      ) : i === 1 ? (
        <Select
          value={operator?.value}
          onValueChange={(value) =>
            setOperator(operators.find((o) => o.value === value))
          }
        >
          <SelectTrigger className="h-8 w-fit text-xs">
            <SelectValue placeholder={operator?.label} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {operators.map((operator) => (
                <SelectItem
                  key={operator.value}
                  value={operator.value}
                  className="text-xs"
                >
                  {operator.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      ) : (
        <div key={operator?.value}>{operator?.label}</div>
      )}
      <Select
        value={String(selectedOption?.value)}
        onValueChange={(value) => {
          setSelectedOption(allOptions.find((option) => option.value === value))
          setSelectedOptions((prev) =>
            prev.map((item) => {
              if (item.id === option.id) {
                return {
                  ...item,
                  value,
                }
              } else {
                return item
              }
            })
          )
        }}
      >
        <SelectTrigger className="h-8 w-full text-xs capitalize">
          <SelectValue placeholder={selectedOption?.label} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {allOptions.map((option) => (
              <SelectItem
                key={String(option.value)}
                value={String(option.value)}
                className="text-xs capitalize"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <Select
        value={filterVariety}
        onValueChange={(value) => setFilterVariety(value)}
      >
        <SelectTrigger className="h-8 w-full truncate px-2 py-0.5 hover:bg-muted/50">
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
      {selectedOption?.items.length ? (
        table.getColumn(selectedOption.value ? String(option.value) : "") && (
          <DataTableFacetedFilter
            key={selectedOption.id}
            column={table.getColumn(
              selectedOption.value ? String(selectedOption.value) : ""
            )}
            title={selectedOption.label}
            options={selectedOption.items}
          />
        )
      ) : (
        <Input
          placeholder="Type here..."
          className="h-8"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          autoFocus
        />
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8 shrink-0">
            <DotsHorizontalIcon className="size-4" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={() => {
              setSelectedOptions((prev) =>
                prev.filter((item) => item.id !== option.id)
              )
            }}
          >
            <TrashIcon className="mr-2 size-4" aria-hidden="true" />
            Remove
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setSelectedOptions((prev) => [
                ...prev,
                {
                  id: crypto.randomUUID(),
                  label: String(selectedOption?.label),
                  value: String(selectedOption?.value),
                  isMulti: true,
                  items: selectedOption?.items ?? [],
                },
              ])
            }}
          >
            <CopyIcon className="mr-2 size-4" aria-hidden="true" />
            Duplicate
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
