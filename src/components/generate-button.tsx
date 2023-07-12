"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { seedTasksAction } from "@/app/_actions/task"

export function GenerateButton() {
  const [isPending, startTransition] = React.useTransition()

  return (
    <Button
      onClick={() => {
        startTransition(async () => {
          await seedTasksAction()
        })
      }}
    >
      Generate
    </Button>
  )
}
