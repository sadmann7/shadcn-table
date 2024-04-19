"use client"


import { Button, type ButtonProps } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useControllableState } from "@/hooks/use-controllable-state"
import { cn, composeEventHandlers } from "@/lib/utils"

interface ToggleButtonProps extends ButtonProps {
  /**
   * The controlled state of the toggle.
   */
  pressed?: boolean;

  /**
   * The state of the toggle when initially rendered. Use `defaultPressed`
   * if you do not need to control the state of the toggle.
   * @defaultValue false
   */
  defaultPressed?: boolean;

  /**
   * The callback that fires when the state of the toggle changes.
   */
  onPressedChange?(pressed: boolean): void;

  /**
   * The title of the tooltip.
   * @defaultValue undefined
   * @example "Enable notifications"
   */

  tooltipTitle?: string

  /**
   * The description of the tooltip.
   * @defaultValue undefined
   * @example "Receive notifications when someone mentions you"
   */
  tooltipDescription?: string
}

export function ToggleButton({
  pressed: pressedProp,
  defaultPressed = false,
  onPressedChange,
  tooltipTitle,
  tooltipDescription,
  className,
  ...props
}: ToggleButtonProps) {
  const [pressed, setPressed] = useControllableState({
    prop: pressedProp,
    defaultProp: defaultPressed,
    onChange: onPressedChange,
  })

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
        className="flex max-w-60 flex-col space-y-1.5 border bg-background px-3 py-2 font-semibold text-foreground"
      >
        <div>{tooltipTitle}</div>
        <div className="text-xs text-muted-foreground">
          {tooltipDescription}
        </div>
      </TooltipContent>
    </Tooltip>
  )
}
