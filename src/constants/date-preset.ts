import { addDays, addHours, endOfDay, startOfDay } from "date-fns"

import { DatePreset } from "@/components/data-table/types"

export const presets = [
  {
    label: "Сьогодні",
    from: startOfDay(new Date()),
    to: endOfDay(new Date()),
    shortcut: "d", // day
  },
  {
    label: "Вчора",
    from: startOfDay(addDays(new Date(), -1)),
    to: endOfDay(addDays(new Date(), -1)),
    shortcut: "y",
  },
  {
    label: "Остання година",
    from: addHours(new Date(), -1),
    to: new Date(),
    shortcut: "h",
  },
  {
    label: "Останні 7 днів",
    from: startOfDay(addDays(new Date(), -7)),
    to: endOfDay(new Date()),
    shortcut: "w",
  },
  {
    label: "Останні 14 днів",
    from: startOfDay(addDays(new Date(), -14)),
    to: endOfDay(new Date()),
    shortcut: "b", // bi-weekly
  },
  {
    label: "Останні 30 днів",
    from: startOfDay(addDays(new Date(), -30)),
    to: endOfDay(new Date()),
    shortcut: "m",
  },
] satisfies DatePreset[]
