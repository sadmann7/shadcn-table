"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { CalendarIcon } from "@radix-ui/react-icons"
import { type PopoverContentProps } from "@radix-ui/react-popover"
import { addDays, format } from "date-fns"
import type { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button, type ButtonProps } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DateRangePickerProps
  extends React.ComponentPropsWithoutRef<typeof PopoverTrigger>,
    ButtonProps {
  dateRange?: DateRange
  dayCount?: number
  align?: PopoverContentProps["align"]
}

export function DateRangePicker({
  dateRange,
  dayCount,
  align,
  className,
  ...props
}: DateRangePickerProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [from, to] = React.useMemo(() => {
    let fromDay: Date | undefined
    let toDay: Date | undefined

    if (dateRange) {
      fromDay = dateRange.from
      toDay = dateRange.to
    } else if (dayCount) {
      toDay = new Date()
      fromDay = addDays(toDay, -dayCount)
    }

    return [fromDay, toDay]
  }, [dateRange, dayCount])

  const [date, setDate] = React.useState<DateRange | undefined>({ from, to })

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
    router.push(
      `${pathname}?${createQueryString({
        from: date?.from ? format(date.from, "yyyy-MM-dd") : null,
        to: date?.to ? format(date.to, "yyyy-MM-dd") : null,
      })}`,
      {
        scroll: false,
      }
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date?.from, date?.to])

  return (
    <div className="grid gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start truncate text-left font-normal",
              !date && "text-muted-foreground",
              className
            )}
            {...props}
          >
            <CalendarIcon className="mr-2 size-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align={align}>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
