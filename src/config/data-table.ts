import {
  ChevronsUpDown,
  CommandIcon,
  FileSpreadsheetIcon,
  PickaxeIcon,
} from "lucide-react";

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
  textOperators: [
    { label: "Contains", value: "iLike" as const },
    { label: "Does not contain", value: "notILike" as const },
    { label: "Is", value: "eq" as const },
    { label: "Is not", value: "ne" as const },
    { label: "Is empty", value: "isEmpty" as const },
    { label: "Is not empty", value: "isNotEmpty" as const },
  ],
  numericOperators: [
    { label: "Is", value: "eq" as const },
    { label: "Is not", value: "ne" as const },
    { label: "Is less than", value: "lt" as const },
    { label: "Is less than or equal to", value: "lte" as const },
    { label: "Is greater than", value: "gt" as const },
    { label: "Is greater than or equal to", value: "gte" as const },
    { label: "Is between", value: "isBetween" as const },
    { label: "Is empty", value: "isEmpty" as const },
    { label: "Is not empty", value: "isNotEmpty" as const },
  ],
  dateOperators: [
    { label: "Is", value: "eq" as const },
    { label: "Is not", value: "ne" as const },
    { label: "Is before", value: "lt" as const },
    { label: "Is after", value: "gt" as const },
    { label: "Is on or before", value: "lte" as const },
    { label: "Is on or after", value: "gte" as const },
    { label: "Is between", value: "isBetween" as const },
    { label: "Is relative to today", value: "isRelativeToToday" as const },
    { label: "Is empty", value: "isEmpty" as const },
    { label: "Is not empty", value: "isNotEmpty" as const },
  ],
  selectOperators: [
    { label: "Is", value: "eq" as const },
    { label: "Is not", value: "ne" as const },
    { label: "Is empty", value: "isEmpty" as const },
    { label: "Is not empty", value: "isNotEmpty" as const },
  ],
  booleanOperators: [
    { label: "Is", value: "eq" as const },
    { label: "Is not", value: "ne" as const },
  ],
  sortOrders: [
    { label: "Asc", value: "asc" as const },
    { label: "Desc", value: "desc" as const },
  ],
  filterVariants: [
    "text",
    "number",
    "range",
    "date",
    "date-range",
    "boolean",
    "select",
    "multi-select",
  ] as const,
  operators: [
    "iLike",
    "notILike",
    "eq",
    "ne",
    "isEmpty",
    "isNotEmpty",
    "lt",
    "lte",
    "gt",
    "gte",
    "isBetween",
    "isRelativeToToday",
    "and",
    "or",
  ] as const,
  joinOperators: ["and", "or"] as const,
};
