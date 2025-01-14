import { Pickaxe, SquareSquare } from "lucide-react"

export type DataTableConfig = typeof dataTableConfig

export const dataTableConfig = {
  featureFlags: [
    {
      label: "Розширена таблиця",
      value: "advancedTable" as const,
      icon: Pickaxe,
      tooltipTitle: "Переключити розширену таблицю",
      tooltipDescription:
        "Створюйте фільтри та сортування для рядків у таблиці.",
    },
    // {
    //   label: "Плаваюча панель",
    //   value: "floatingBar" as const,
    //   icon: SquareSquare,
    //   tooltipTitle: "Переключити плаваючу панель",
    //   tooltipDescription: "Плаваюча панель, яка прилипає до верху таблиці.",
    // },
  ],
  textOperators: [
    { label: "Містить", value: "iLike" as const },
    { label: "Не містить", value: "notILike" as const },
    { label: "Рівно", value: "eq" as const },
    { label: "Не рівно", value: "ne" as const },
    { label: "Порожній", value: "isEmpty" as const },
    { label: "Не порожній", value: "isNotEmpty" as const },
  ],
  numericOperators: [
    { label: "Рівно", value: "eq" as const },
    { label: "Не рівно", value: "ne" as const },
    { label: "Менше", value: "lt" as const },
    { label: "Менше або рівно", value: "lte" as const },
    { label: "Більше", value: "gt" as const },
    { label: "Більше або рівно", value: "gte" as const },
    { label: "Порожній", value: "isEmpty" as const },
    { label: "Не порожній", value: "isNotEmpty" as const },
  ],
  dateOperators: [
    { label: "Рівно", value: "eq" as const },
    { label: "Не рівно", value: "ne" as const },
    { label: "Раніше", value: "lt" as const },
    { label: "Пізніше", value: "gt" as const },
    { label: "На або раніше", value: "lte" as const },
    { label: "На або пізніше", value: "gte" as const },
    { label: "Між", value: "isBetween" as const },
    { label: "Відносно сьогодні", value: "isRelativeToToday" as const },
    { label: "Порожній", value: "isEmpty" as const },
    { label: "Не порожній", value: "isNotEmpty" as const },
  ],
  selectOperators: [
    { label: "Рівно", value: "eq" as const },
    { label: "Не рівно", value: "ne" as const },
    { label: "Порожній", value: "isEmpty" as const },
    { label: "Не порожній", value: "isNotEmpty" as const },
  ],
  booleanOperators: [
    { label: "Рівно", value: "eq" as const },
    { label: "Не рівно", value: "ne" as const },
  ],
  joinOperators: [
    { label: "І", value: "and" as const },
    { label: "Або", value: "or" as const },
  ],
  sortOrders: [
    { label: "Зростання", value: "asc" as const },
    { label: "Спадання", value: "desc" as const },
  ],
  columnTypes: [
    "text",
    "number",
    "date",
    "boolean",
    "select",
    "multi-select",
  ] as const,
  globalOperators: [
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
}
