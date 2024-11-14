"use client"

import * as React from "react"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const FacetedFilter = Popover

const FacetedFilterTrigger = React.forwardRef<
  React.ComponentRef<typeof PopoverTrigger>,
  React.ComponentPropsWithoutRef<typeof PopoverTrigger>
>(({ className, children, ...props }, ref) => (
  <PopoverTrigger ref={ref} className={cn(className)} {...props}>
    {children}
  </PopoverTrigger>
))
FacetedFilterTrigger.displayName = "FacetedFilterTrigger"

const FacetedFilterContent = React.forwardRef<
  React.ComponentRef<typeof PopoverContent>,
  React.ComponentPropsWithoutRef<typeof PopoverContent>
>(({ className, children, ...props }, ref) => (
  <PopoverContent
    ref={ref}
    className={cn("w-[12.5rem] p-0", className)}
    align="start"
    {...props}
  >
    <Command>{children}</Command>
  </PopoverContent>
))
FacetedFilterContent.displayName = "FacetedFilterContent"

const FacetedFilterInput = CommandInput

const FacetedFilterList = CommandList

const FacetedFilterEmpty = CommandEmpty

const FacetedFilterGroup = CommandGroup

interface FacetedFilterItemProps
  extends React.ComponentPropsWithoutRef<typeof CommandItem> {
  selected: boolean
}

const FacetedFilterItem = React.forwardRef<
  React.ComponentRef<typeof CommandItem>,
  FacetedFilterItemProps
>(({ className, children, selected, ...props }, ref) => {
  return (
    <CommandItem
      ref={ref}
      aria-selected={selected}
      data-selected={selected}
      className={cn(className)}
      {...props}
    >
      <span
        className={cn(
          "mr-2 flex size-4 items-center justify-center rounded-sm border border-primary",
          selected
            ? "bg-primary text-primary-foreground"
            : "opacity-50 [&_svg]:invisible"
        )}
      >
        <Check className="size-4" />
      </span>
      {children}
    </CommandItem>
  )
})
FacetedFilterItem.displayName = "FacetedFilterItem"

const FacetedFilterSeparator = CommandSeparator

const FacetedFilterShortcut = CommandShortcut

export {
  FacetedFilter,
  FacetedFilterTrigger,
  FacetedFilterContent,
  FacetedFilterInput,
  FacetedFilterList,
  FacetedFilterEmpty,
  FacetedFilterGroup,
  FacetedFilterItem,
  FacetedFilterSeparator,
  FacetedFilterShortcut,
}
