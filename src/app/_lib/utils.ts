import { type Task } from "@/db/schema"
import {
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  CheckCircledIcon,
  CircleIcon,
  CrossCircledIcon,
  QuestionMarkCircledIcon,
  StopwatchIcon,
} from "@radix-ui/react-icons"

/**
 * Returns the appropriate status icon based on the provided status.
 * @param status - The status of the task.
 * @returns A React component representing the status icon.
 */
export function getStatusIcon(status: Task["status"]) {
  const statusIcons = {
    canceled: CrossCircledIcon,
    done: CheckCircledIcon,
    "in-progress": StopwatchIcon,
    todo: QuestionMarkCircledIcon,
  }

  return statusIcons[status] || CircleIcon
}

/**
 * Returns the appropriate priority icon based on the provided priority.
 * @param priority - The priority of the task.
 * @returns A React component representing the priority icon.
 */
export function getPriorityIcon(priority: Task["priority"]) {
  const priorityIcons = {
    high: ArrowUpIcon,
    low: ArrowDownIcon,
    medium: ArrowRightIcon,
  }

  return priorityIcons[priority] || CircleIcon
}
