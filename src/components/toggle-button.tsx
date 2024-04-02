"use client"

import * as React from "react"

import { cn, composeEventHandlers } from "@/lib/utils"
import { Button, type ButtonProps } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface ToggleButtonProps extends ButtonProps {
  tooltipTitle?: string
  tooltipDescription?: string
}

export function ToggleButton({
  tooltipTitle,
  tooltipDescription,
  className,
  ...props
}: ToggleButtonProps) {
  const [pressed, setPressed] = React.useState(false)

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          aria-pressed={pressed}
          data-state={pressed ? "on" : "off"}
          variant="outline"
          size="sm"
          className={cn(
            "data-[state=on]:bg-accent data-[state=on]:text-accent-foreground",
            className
          )}
          {...props}
          onClick={composeEventHandlers(props.onClick, () => {
            if (!props.disabled) {
              setPressed(!pressed)
            }
          })}
        />
      </TooltipTrigger>
      <TooltipContent
        side="bottom"
        align="center"
        sideOffset={6}
        className="flex max-w-60 flex-col space-y-1.5 border bg-background px-4 py-2 font-semibold text-foreground"
      >
        <div>{tooltipTitle}</div>
        <div className="text-xs text-muted-foreground">
          {tooltipDescription}
        </div>
      </TooltipContent>
    </Tooltip>
  )
}
