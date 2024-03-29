"use client"

import * as React from "react"

import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

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

export const TasksTableProvider = ({ children }: React.PropsWithChildren) => {
  const id = React.useId()
  const [enableAdvancedFilter, setEnableAdvancedFilter] = React.useState(false)
  const [showFloatingBar, setShowFloatingBar] = React.useState(false)

  return (
    <TasksTableContext.Provider
      value={{
        enableAdvancedFilter,
        setEnableAdvancedFilter,
        showFloatingBar,
        setShowFloatingBar,
      }}
    >
      <div className="flex w-fit items-center justify-center space-x-4 overflow-x-auto rounded-md border p-4">
        <div className="flex items-center space-x-2">
          <Switch
            id={`enable-advanced-filter-${id}`}
            checked={enableAdvancedFilter}
            onCheckedChange={setEnableAdvancedFilter}
          />
          <Label htmlFor={`enable-advanced-filter-${id}`}>
            Advanced filter
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id={`show-floating-bar-${id}`}
            checked={!!showFloatingBar}
            onCheckedChange={setShowFloatingBar}
          />
          <Label htmlFor={`show-floating-bar-${id}`}>Floating bar</Label>
        </div>
      </div>
      {children}
    </TasksTableContext.Provider>
  )
}
