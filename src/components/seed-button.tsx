"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { seedTasksAction } from "@/app/_actions/task"

export function SeedButton() {
  const [isPending, startTransition] = React.useTransition()

  return (
    <Button
      onClick={() => {
        startTransition(async () => {
          await seedTasksAction()
        })
      }}
    >
      {isPending ? "Loading..." : "Generate"}
    </Button>
  )
}
