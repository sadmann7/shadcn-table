"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Loader } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetTrigger,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

import type { CreateTaskSchema } from "../_lib/validations"
import { createTaskSchema } from "../_lib/validations"
import { createTask } from "../_lib/actions"
import { TaskForm } from "./task-form"

export function CreateTaskSheet() {
  const [open, setOpen] = React.useState(false)
  const [isPending, startTransition] = React.useTransition()

  const form = useForm<CreateTaskSchema>({
    resolver: zodResolver(createTaskSchema),
  })

  function onSubmit(input: CreateTaskSchema) {
    startTransition(async () => {
      const { error } = await createTask(input)

      if (error) {
        toast.error(error)
        return
      }

      form.reset()
      setOpen(false)
      toast.success("Task created")
    })
  }
  
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="size-4" aria-hidden="true" />
          New task
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col gap-6 sm:max-w-md">
        <SheetHeader className="text-left">
          <SheetTitle>Create task</SheetTitle>
          <SheetDescription>
            Fill in the details below to create a new task
          </SheetDescription>
        </SheetHeader>
        <TaskForm<CreateTaskSchema> form={form} onSubmit={onSubmit}>
          <SheetFooter className="gap-2 pt-2 sm:space-x-0">
            <SheetClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </SheetClose>
            <Button disabled={isPending}>
              {isPending && (
                <Loader
                  className="mr-2 size-4 animate-spin"
                  aria-hidden="true"
                />
              )}
              Create
            </Button>
          </SheetFooter>
        </TaskForm>
      </SheetContent>
    </Sheet>
  )
}
