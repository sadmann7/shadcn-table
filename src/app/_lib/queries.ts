import "server-only";

import type { Task } from "@/db/schema";
import { createTaskAdapter } from "@/lib/database-adapter";
import { unstable_cache } from "@/lib/unstable-cache";
import type { ExtendedColumnFilter } from "@/types/data-table";

import type { GetTasksSchema } from "./validations";

export async function getTasks(input: GetTasksSchema) {
  return await unstable_cache(
    async () => {
      try {
        const adapter = await createTaskAdapter();
        const offset = (input.page - 1) * input.perPage;
        
        // Build filters based on the filter mode
        const filters: ExtendedColumnFilter<Task>[] = [];
        
        const advancedTable =
          input.filterFlag === "advancedFilters" ||
          input.filterFlag === "commandFilters";

        if (advancedTable) {
          // Use advanced filters directly
          filters.push(...input.filters);
        } else {
          // Convert legacy filters to new format
          if (input.title) {
            filters.push({
              id: 'title',
              operator: 'iLike',
              value: input.title,
              variant: 'text',
              filterId: 'title-filter',
            });
          }
          
          if (input.status.length > 0) {
            filters.push({
              id: 'status',
              operator: 'inArray',
              value: input.status,
              variant: 'multiSelect',
              filterId: 'status-filter',
            });
          }
          
          if (input.priority.length > 0) {
            filters.push({
              id: 'priority',
              operator: 'inArray',
              value: input.priority,
              variant: 'multiSelect',
              filterId: 'priority-filter',
            });
          }
          
          if (input.estimatedHours.length > 0) {
            filters.push({
              id: 'estimatedHours',
              operator: 'isBetween',
              value: input.estimatedHours.map(String),
              variant: 'range',
              filterId: 'estimatedHours-filter',
            });
          }
          
          if (input.createdAt.length > 0) {
            filters.push({
              id: 'createdAt',
              operator: 'isBetween',
              value: input.createdAt.map(String),
              variant: 'dateRange',
              filterId: 'createdAt-filter',
            });
          }
        }

        const { data, total } = await adapter.findManyWithCount({
          filters,
          sorts: input.sort,
          limit: input.perPage,
          offset,
          joinOperator: input.joinOperator,
        });

        const pageCount = Math.ceil(total / input.perPage);
        return { data, pageCount };
      } catch (_err) {
        return { data: [], pageCount: 0 };
      }
    },
    [JSON.stringify(input)],
    {
      revalidate: 1,
      tags: ["tasks"],
    },
  )();
}

export async function getTaskStatusCounts(): Promise<Record<"todo" | "in-progress" | "done" | "canceled", number>> {
  return unstable_cache(
    async () => {
      try {
        const adapter = await createTaskAdapter();
        const results = await adapter.aggregate({
          filters: [],
          joinOperator: 'and',
          groupBy: ['status'],
          aggregates: {
            status: { count: true },
          },
        });

        return results.reduce(
          (acc, result: any) => {
            acc[result.status as keyof typeof acc] = result.status_count || 0;
            return acc;
          },
          {
            todo: 0,
            "in-progress": 0,
            done: 0,
            canceled: 0,
          },
        ) as Record<"todo" | "in-progress" | "done" | "canceled", number>;
      } catch (_err) {
        return {
          todo: 0,
          "in-progress": 0,
          done: 0,
          canceled: 0,
        };
      }
    },
    ["task-status-counts"],
    {
      revalidate: 3600,
    },
  )();
}

export async function getTaskPriorityCounts(): Promise<Record<"low" | "medium" | "high", number>> {
  return unstable_cache(
    async () => {
      try {
        const adapter = await createTaskAdapter();
        const results = await adapter.aggregate({
          filters: [],
          joinOperator: 'and',
          groupBy: ['priority'],
          aggregates: {
            priority: { count: true },
          },
        });

        return results.reduce(
          (acc, result: any) => {
            acc[result.priority as keyof typeof acc] = result.priority_count || 0;
            return acc;
          },
          {
            low: 0,
            medium: 0,
            high: 0,
          },
        ) as Record<"low" | "medium" | "high", number>;
      } catch (_err) {
        return {
          low: 0,
          medium: 0,
          high: 0,
        };
      }
    },
    ["task-priority-counts"],
    {
      revalidate: 3600,
    },
  )();
}

export async function getEstimatedHoursRange() {
  return unstable_cache(
    async () => {
      try {
        const adapter = await createTaskAdapter();
        const results = await adapter.aggregate({
          filters: [],
          joinOperator: 'and',
          groupBy: [],
          aggregates: {
            estimatedHours: { min: true, max: true },
          },
        });

        const result = results[0];
        return {
          min: result?.estimatedHours_min ?? 0,
          max: result?.estimatedHours_max ?? 0,
        };
      } catch (_err) {
        return { min: 0, max: 0 };
      }
    },
    ["estimated-hours-range"],
    {
      revalidate: 3600,
    },
  )();
}
