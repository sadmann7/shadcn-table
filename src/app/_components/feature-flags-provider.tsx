"use client";

import { useQueryState } from "nuqs";
import * as React from "react";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { type DataTableConfig, dataTableConfig } from "@/config/data-table";

type FilterVariant = DataTableConfig["featureFlags"][number]["value"];

interface FeatureFlagsContextValue {
  filterVariant: FilterVariant;
  enableAdvancedFilter: boolean;
}

const FeatureFlagsContext =
  React.createContext<FeatureFlagsContextValue | null>(null);

export function useFeatureFlags() {
  const context = React.useContext(FeatureFlagsContext);
  if (!context) {
    throw new Error(
      "useFeatureFlags must be used within a FeatureFlagsProvider",
    );
  }
  return context;
}

interface FeatureFlagsProviderProps {
  children: React.ReactNode;
}

export function FeatureFlagsProvider({ children }: FeatureFlagsProviderProps) {
  const [filterVariant, setFilterVariant] = useQueryState<FilterVariant | null>(
    "filterVariant",
    {
      parse: (value) => {
        if (!value) return null;
        const validValues = dataTableConfig.featureFlags.map(
          (flag) => flag.value,
        );
        return validValues.includes(value as FilterVariant)
          ? (value as FilterVariant)
          : null;
      },
      serialize: (value) => value ?? "",
      defaultValue: null,
      clearOnDefault: true,
      shallow: false,
      eq: (a, b) => (!a && !b) || a === b,
    },
  );

  const contextValue = React.useMemo<FeatureFlagsContextValue>(
    () => ({
      filterVariant,
      enableAdvancedFilter:
        filterVariant === "advancedFilters" ||
        filterVariant === "commandFilters",
    }),
    [filterVariant],
  );

  return (
    <FeatureFlagsContext.Provider value={contextValue}>
      <div className="w-full overflow-x-auto p-1">
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          value={filterVariant}
          onValueChange={(value: FilterVariant) => {
            setFilterVariant(value);
          }}
          className="w-fit gap-0"
        >
          {dataTableConfig.featureFlags.map((flag) => (
            <Tooltip key={flag.value} delayDuration={700}>
              <ToggleGroupItem
                value={flag.value}
                className="whitespace-nowrap px-3 text-xs data-[state=on]:bg-accent/70 data-[state=on]:hover:bg-accent/90"
                asChild
              >
                <TooltipTrigger>
                  <flag.icon className="size-3.5 shrink-0" />
                  {flag.label}
                </TooltipTrigger>
              </ToggleGroupItem>
              <TooltipContent
                align="start"
                side="bottom"
                sideOffset={6}
                className="flex flex-col gap-1.5 border bg-background py-2 font-semibold text-foreground [&>span]:hidden"
              >
                <div>{flag.tooltipTitle}</div>
                <p className="text-balance text-muted-foreground text-xs">
                  {flag.tooltipDescription}
                </p>
              </TooltipContent>
            </Tooltip>
          ))}
        </ToggleGroup>
      </div>
      {children}
    </FeatureFlagsContext.Provider>
  );
}
