import { clsx, type ClassValue } from "clsx";
import {
  eq,
  like,
  not,
  notLike,
  type Column,
  type ColumnBaseConfig,
  type ColumnDataType,
} from "drizzle-orm";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";
import { z } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function filterColumn({
  column,
  value,
}: {
  column: Column<ColumnBaseConfig<ColumnDataType, string>, object, object>;
  value: string;
}) {
  const [filterValue, filterVariety] = value?.split(".") ?? [];

  switch (filterVariety) {
    case "contains":
      return like(column, `%${filterValue}%`);
    case "does not contain":
      return notLike(column, `%${filterValue}%`);
    case "is":
      return eq(column, filterValue);
    case "is not":
      return not(eq(column, filterValue));
    default:
      return like(column, `%${filterValue}%`);
  }
}

export function catchError(err: unknown) {
  if (err instanceof z.ZodError) {
    const errors = err.issues.map((issue) => {
      return issue.message;
    });
    return toast(errors.join("\n"));
  } else if (err instanceof Error) {
    return toast(err.message);
  } else {
    return toast("Something went wrong, please try again later.");
  }
}
