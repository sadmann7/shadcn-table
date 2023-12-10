import { tasks, type Task } from "@/db/schema";
import { catchError } from "@/lib/catchError";
import {
    ArrowUpIcon,
    CheckCircledIcon, 
    TrashIcon,
} from "@radix-ui/react-icons";
import { SelectTrigger } from "@radix-ui/react-select";
import { Table } from "@tanstack/react-table";
import { toast } from "sonner";
import { deleteTask, updateTaskPriority, updateTaskStatus } from "../_actions/mutations";

import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
} from "@/components/ui/select";

export function deleteSelectedRows(dataTable: Table<Task>, event?: any) {
    const selectedRows = dataTable.getFilteredSelectedRowModel().rows as { original: Task }[];
    toast.promise(
        Promise.all(
            selectedRows.map(
                async (row) => deleteTask(row.original.uid)
            )
        ),
        {
            loading: "Deleting...",
            success: () => {
                return "Tasks deleted successfully."
            },
            error: (err: unknown) => {
                return catchError(err)
            },
        }
    )
}

export function updateTasksStatus(dataTable: Table<Task>, status: string) {
    const selectedRows = dataTable.getFilteredSelectedRowModel().rows as unknown as { original: Task }[]

    selectedRows.map(async (row) => {
        await updateTaskStatus({
            uid: row.original.uid,
            status: status as Task["status"],
        })
    })
}

export function updateTasksPriority(dataTable: Table<Task>, priority: string) {
    const selectedRows = dataTable.getFilteredSelectedRowModel()
        .rows as unknown as { original: Task }[]

    selectedRows.map(async (row) => {
        await updateTaskPriority({
            uid: row.original.uid,
            priority: priority as Task["priority"],
        })
    })
}

export function SelectedActionsControls(dataTable: Table<Task>) {
    return (
        <div className="align-middle justify-between gap-2">
            <Select onValueChange={(value) => updateTasksStatus(dataTable, value)}>
                <SelectTrigger asChild>
                    <Button
                        aria-label="Delete selected rows"
                        title="Status"
                        className="h-auto bg-transparent p-1 text-white hover:bg-zinc-700"
                    >
                        <CheckCircledIcon className="h-4 w-4" aria-hidden="true" />
                    </Button>
                </SelectTrigger>
                <SelectContent align="center">
                    <SelectGroup>
                        {tasks.status.enumValues.map((status) => (
                            <SelectItem key={status} value={status} className="capitalize">
                                {status}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
            <Select onValueChange={(value) => updateTasksPriority(dataTable, value)}>
                <SelectTrigger asChild>
                    <Button
                        aria-label="Delete selected rows"
                        title="Priority"
                        className="h-auto bg-transparent p-1 text-white hover:bg-zinc-700"
                    >
                        <ArrowUpIcon className="h-4 w-4" aria-hidden="true" />
                    </Button>
                </SelectTrigger>
                <SelectContent align="center">
                    <SelectGroup>
                        {tasks.priority.enumValues.map((priority) => (
                            <SelectItem
                                key={priority}
                                value={priority}
                                className="capitalize"
                            >
                                {priority}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
            <Button
                aria-label="Change status of selected rows"
                title="Delete"
                className="h-auto bg-transparent p-1 text-white hover:bg-zinc-700"
                onClick={(event) => {
                    dataTable.toggleAllPageRowsSelected(false)
                    deleteSelectedRows?.(dataTable ,event)
                }}
            >
                <TrashIcon className="h-4 w-4" aria-hidden="true" />
            </Button>
        </div>
    )
}