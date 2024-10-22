"use client"

import * as React from "react"
import { CheckIcon } from "@radix-ui/react-icons"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
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
  <PopoverTrigger ref={ref} asChild>
    <Button
      variant="outline"
      size="sm"
      className={cn("h-8 border-dashed", className)}
      {...props}
    >
      {children}
    </Button>
  </PopoverTrigger>
))
FacetedFilterTrigger.displayName = "FacetedFilterTrigger"

// Value component
const FacetedFilterValue = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, children, ...props }, ref) => (
  <span
    ref={ref}
    className={cn("ml-2 text-sm text-muted-foreground", className)}
    {...props}
  >
    {children}
  </span>
))
FacetedFilterValue.displayName = "FacetedFilterValue"

const FacetedFilterContent = React.forwardRef<
  React.ComponentRef<typeof PopoverContent>,
  React.ComponentPropsWithoutRef<typeof PopoverContent>
>(({ className, children, ...props }, ref) => (
  <PopoverContent
    ref={ref}
    className={cn("w-[200px] p-0", className)}
    align="start"
    {...props}
  >
    <Command>{children}</Command>
  </PopoverContent>
))
FacetedFilterContent.displayName = "FacetedFilterContent"

const FacetedFilterList = React.forwardRef<
  React.ComponentRef<typeof CommandList>,
  React.ComponentPropsWithoutRef<typeof CommandList>
>(({ className, ...props }, ref) => (
  <CommandList ref={ref} className={cn("", className)} {...props} />
))
FacetedFilterList.displayName = "FacetedFilterList"

const FacetedFilterInput = React.forwardRef<
  React.ComponentRef<typeof CommandInput>,
  React.ComponentPropsWithoutRef<typeof CommandInput>
>(({ className, ...props }, ref) => (
  <CommandInput ref={ref} className={cn("", className)} {...props} />
))
FacetedFilterInput.displayName = "FacetedFilterInput"

const FacetedFilterEmpty = React.forwardRef<
  React.ComponentRef<typeof CommandEmpty>,
  React.ComponentPropsWithoutRef<typeof CommandEmpty>
>(({ className, ...props }, ref) => (
  <CommandEmpty ref={ref} className={cn("", className)} {...props} />
))
FacetedFilterEmpty.displayName = "FacetedFilterEmpty"

const FacetedFilterGroup = React.forwardRef<
  React.ComponentRef<typeof CommandGroup>,
  React.ComponentPropsWithoutRef<typeof CommandGroup>
>(({ className, ...props }, ref) => (
  <CommandGroup ref={ref} className={cn("", className)} {...props} />
))
FacetedFilterGroup.displayName = "FacetedFilterGroup"

interface FacetedFilterItemProps
  extends React.ComponentPropsWithoutRef<typeof CommandItem> {
  selected?: boolean
  onSelect?: () => void
}

const FacetedFilterItem = React.forwardRef<
  React.ComponentRef<typeof CommandItem>,
  FacetedFilterItemProps
>(({ className, selected, onSelect, children, ...props }, ref) => (
  <CommandItem
    ref={ref}
    className={cn("", className)}
    onSelect={onSelect}
    {...props}
  >
    <div
      className={cn(
        "mr-2 flex size-4 items-center justify-center rounded-sm border border-primary",
        selected
          ? "bg-primary text-primary-foreground"
          : "opacity-50 [&_svg]:invisible"
      )}
    >
      <CheckIcon className="size-4" />
    </div>
    {children}
  </CommandItem>
))
FacetedFilterItem.displayName = "FacetedFilterItem"

const FacetedFilterSeparator = React.forwardRef<
  React.ComponentRef<typeof CommandSeparator>,
  React.ComponentPropsWithoutRef<typeof CommandSeparator>
>(({ className, ...props }, ref) => (
  <CommandSeparator ref={ref} className={cn("", className)} {...props} />
))
FacetedFilterSeparator.displayName = "FacetedFilterSeparator"

export {
  FacetedFilter,
  FacetedFilterContent,
  FacetedFilterEmpty,
  FacetedFilterGroup,
  FacetedFilterInput,
  FacetedFilterItem,
  FacetedFilterList,
  FacetedFilterSeparator,
  FacetedFilterTrigger,
  FacetedFilterValue,
}
