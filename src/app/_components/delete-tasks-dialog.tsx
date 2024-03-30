"use client"

import * as React from "react"
import { type Task } from "@/db/schema"
import { TrashIcon } from "@radix-ui/react-icons"
import { type Row } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { deleteTasks } from "../_lib/mutations"

interface DeleteTasksDialogProps {
  tasks: Row<Task>[]
  onSuccess: () => void
}

export function DeleteTasksDialog({
  tasks,
  onSuccess,
}: DeleteTasksDialogProps) {
  const [isDeletePending, startDeleteTransition] = React.useTransition()

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <TrashIcon className="mr-2 size-4" aria-hidden="true" />
          Delete ({tasks.length})
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your{" "}
            <span className="font-medium">{tasks.length}</span>
            {tasks.length === 1 ? " task" : " tasks"} from our servers.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:space-x-0">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            aria-label="Delete selected rows"
            variant="destructive"
            onClick={() => {
              startDeleteTransition(() => {
                deleteTasks({
                  rows: tasks,
                  onSucess: onSuccess,
                })
              })
            }}
            disabled={isDeletePending}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
