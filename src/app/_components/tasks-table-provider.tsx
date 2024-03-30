"use client"

import * as React from "react"
import { MixIcon, SquareIcon } from "@radix-ui/react-icons"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

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
  const [showFloatingBar, setShowFloatingBar] = React.useState(true)

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
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn({
                "bg-accent": enableAdvancedFilter,
              })}
              onClick={() => setEnableAdvancedFilter(!enableAdvancedFilter)}
            >
              <MixIcon className="mr-2 size-4 shrink-0" aria-hidden="true" />
              Advanced filter
            </Button>
          </TooltipTrigger>
          <TooltipContent
            side="bottom"
            align="center"
            sideOffset={6}
            className="flex max-w-60 flex-col space-y-1.5 border bg-background px-4 py-2 font-semibold text-foreground"
          >
            <div>Toggle advanced filter</div>
            <div className="text-xs text-muted-foreground">
              A notion like query builder to filter rows.
            </div>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn({
                "bg-accent": showFloatingBar,
              })}
              onClick={() => setShowFloatingBar(!showFloatingBar)}
            >
              <SquareIcon className="mr-2 size-4 shrink-0" aria-hidden="true" />
              Toggle floating bar
            </Button>
          </TooltipTrigger>
          <TooltipContent
            side="bottom"
            align="center"
            sideOffset={6}
            className="flex max-w-60 flex-col space-y-1.5 border bg-background px-4 py-2 font-semibold text-foreground"
          >
            <div>Toggle floating bar</div>
            <div className="text-xs text-muted-foreground">
              A floating bar to perform actions on selected rows.
            </div>
          </TooltipContent>
        </Tooltip>
      </div>
      {children}
    </TasksTableContext.Provider>
  )
}
