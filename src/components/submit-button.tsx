"use client"

import { forwardRef } from "react"
import { Loader2 } from "lucide-react"
import { useFormStatus } from "react-dom"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const SubmitButton: typeof Button = forwardRef(
  ({ type, children, ...props }, ref) => {
    const { pending } = useFormStatus()
    return (
      <Button type="submit" disabled={pending} ref={ref} {...props}>
        {pending && (
          <div className="absolute animate-spin">
            <Loader2 />
          </div>
        )}
        <span className={cn(pending && "opacity-0")}>{children}</span>
      </Button>
    )
  }
)
SubmitButton.displayName = "SubmitButton"

export default SubmitButton
