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
import { cn } from "@/lib/utils";

type FeatureFlagValue = DataTableConfig["featureFlags"][number]["value"];

interface FeatureFlagsContextProps {
  featureFlags: FeatureFlagValue[];
  setFeatureFlags: (value: FeatureFlagValue[]) => void;
}

const FeatureFlagsContext = React.createContext<FeatureFlagsContextProps>({
  featureFlags: [],
  setFeatureFlags: () => {},
});

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
  const [featureFlags, setFeatureFlags] = useQueryState<FeatureFlagValue[]>(
    "flags",
    {
      defaultValue: [],
      parse: (value) => value.split(",") as FeatureFlagValue[],
      serialize: (value) => value.join(","),
      eq: (a, b) =>
        a.length === b.length && a.every((value, index) => value === b[index]),
      clearOnDefault: true,
      shallow: false,
    },
  );

  return (
    <FeatureFlagsContext.Provider
      value={{
        featureFlags,
        setFeatureFlags: (value) => void setFeatureFlags(value),
      }}
    >
      <div className="w-full overflow-x-auto">
        <ToggleGroup
          type="multiple"
          variant="outline"
          size="sm"
          value={featureFlags}
          onValueChange={(value: FeatureFlagValue[]) => setFeatureFlags(value)}
          className="w-fit gap-0"
        >
          {dataTableConfig.featureFlags.map((flag, index) => (
            <Tooltip key={flag.value}>
              <ToggleGroupItem
                value={flag.value}
                className={cn(
                  "gap-2 whitespace-nowrap rounded-none px-3 text-xs data-[state=on]:bg-accent/70 data-[state=on]:hover:bg-accent/90",
                  {
                    "rounded-l-sm border-r-0": index === 0,
                    "rounded-r-sm":
                      index === dataTableConfig.featureFlags.length - 1,
                  },
                )}
                asChild
              >
                <TooltipTrigger>
                  <flag.icon className="size-3.5 shrink-0" aria-hidden="true" />
                  {flag.label}
                </TooltipTrigger>
              </ToggleGroupItem>
              <TooltipContent
                align="start"
                side="bottom"
                sideOffset={6}
                className="flex max-w-60 flex-col space-y-1.5 border bg-background py-2 font-semibold text-foreground"
              >
                <div>{flag.tooltipTitle}</div>
                <div className="text-muted-foreground text-xs">
                  {flag.tooltipDescription}
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
        </ToggleGroup>
      </div>
      {children}
    </FeatureFlagsContext.Provider>
  );
}
