import { Button, type ButtonProps } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface ToggleButtonProps extends ButtonProps {
  pressed?: boolean
  tooltipTitle?: string
  tooltipDescription?: string
}

export function ToggleButton({
  pressed,
  tooltipTitle,
  tooltipDescription,
  ...props
}: ToggleButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          aria-pressed={pressed}
          data-state={pressed ? "on" : "off"}
          variant="outline"
          size="sm"
          className="data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
          {...props}
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
