import { CommandIcon, FileSpreadsheetIcon } from "lucide-react";

export type DataTableConfig = typeof dataTableConfig;

export const dataTableConfig = {
  featureFlags: [
    {
      label: "Query builder",
      value: "queryBuilder" as const,
      icon: FileSpreadsheetIcon,
      tooltipTitle: "Visual Query Builder",
      tooltipDescription:
        "Build complex data filters using a visual interface.",
    },
    {
      label: "Command filters",
      value: "commandFilters" as const,
      icon: CommandIcon,
      tooltipTitle: "Command filter chips",
      tooltipDescription:
        "Create filters using pre-defined chips from a command menu.",
    },
  ],
};
