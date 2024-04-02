"use client"

import * as React from "react"
import { LapTimerIcon, MixIcon, SquareIcon } from "@radix-ui/react-icons"

import { DateRangePicker } from "@/components/date-range-picker"
import { ToggleButton } from "@/components/toggle-button"

interface TasksTableContextProps {
  enableAdvancedFilter: boolean
  setEnableAdvancedFilter: React.Dispatch<React.SetStateAction<boolean>>
  showFloatingBar: boolean
  setShowFloatingBar: React.Dispatch<React.SetStateAction<boolean>>
}

const TasksTableContext = React.createContext<TasksTableContextProps>({
  enableAdvancedFilter: false,
  setEnableAdvancedFilter: () => {},
  showFloatingBar: false,
  setShowFloatingBar: () => {},
})

export function useTasksTable() {
  const context = React.useContext(TasksTableContext)
  if (!context) {
    throw new Error("useTasksTable must be used within a TasksTableProvider")
  }
  return context
}

export function TasksTableProvider({ children }: React.PropsWithChildren) {
  const [enableAdvancedFilter, setEnableAdvancedFilter] = React.useState(false)
  const [showFloatingBar, setShowFloatingBar] = React.useState(false)
  const [showDateRangeFilter, setShowDateRangeFilter] = React.useState(false)

  return (
    <TasksTableContext.Provider
      value={{
        enableAdvancedFilter,
        setEnableAdvancedFilter,
        showFloatingBar,
        setShowFloatingBar,
      }}
    >
      <div className="flex w-full items-center space-x-2 overflow-x-auto">
        <ToggleButton
          onClick={() => setEnableAdvancedFilter(!enableAdvancedFilter)}
          tooltipTitle="Toggle advanced filter"
          tooltipDescription="A notion like query builder to filter rows."
        >
          <MixIcon className="mr-2 size-4 shrink-0" aria-hidden="true" />
          Advanced filter
        </ToggleButton>
        <ToggleButton
          onClick={() => setShowFloatingBar(!showFloatingBar)}
          tooltipTitle="Toggle floating bar"
          tooltipDescription="A floating bar to perform actions on selected rows."
        >
          <SquareIcon className="mr-2 size-4 shrink-0" aria-hidden="true" />
          Floating bar
        </ToggleButton>
        <ToggleButton
          onClick={() => setShowDateRangeFilter(!showDateRangeFilter)}
          tooltipTitle="Toggle date range filter"
          tooltipDescription="A filter to filter rows by date range."
        >
          <LapTimerIcon className="mr-2 size-4 shrink-0" aria-hidden="true" />
          Date range filter
        </ToggleButton>
      </div>
      {showDateRangeFilter ? (
        <DateRangePicker
          triggerSize="sm"
          triggerClassName="ml-auto w-60"
          align="end"
        />
      ) : null}
      {children}
    </TasksTableContext.Provider>
  )
}
