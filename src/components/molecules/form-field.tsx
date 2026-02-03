import * as React from "react"
import { Label } from "@/components/atoms"
import { cn } from "@/lib/utils"

interface FormFieldProps {
  label: string
  error?: string
  children: React.ReactNode
  required?: boolean
  className?: string
}

export function FormField({ label, error, children, required, className }: FormFieldProps) {
  return (
    <div className="space-y-3">
      <Label className={cn("text-white font-semibold text-lg", className)}>
        {label}
        {required && <span className="text-red-300 ml-1">*</span>}
      </Label>
      {children}
      {error && <p className="text-base font-medium text-red-200">{error}</p>}
    </div>
  )
}
