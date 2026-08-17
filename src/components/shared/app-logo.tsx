import { FileCheck2 } from "lucide-react"

import { cn } from "@/lib/utils"

interface AppLogoProps {
  compact?: boolean
  inverse?: boolean
  className?: string
}

export function AppLogo({ compact = false, inverse = false, className }: AppLogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "grid size-10 shrink-0 place-items-center rounded-xl shadow-sm",
          inverse
            ? "bg-sidebar-primary text-sidebar-primary-foreground"
            : "bg-primary text-primary-foreground",
        )}
      >
        <FileCheck2 className="size-5" strokeWidth={2.2} />
      </div>
      {!compact && (
        <div className="min-w-0">
          <p
            className={cn(
              "truncate text-sm font-semibold tracking-wide",
              inverse ? "text-white" : "text-foreground",
            )}
          >
            DIAGNÓSTICOS UNI
          </p>
          <p
            className={cn(
              "truncate text-xs",
              inverse ? "text-sidebar-foreground/65" : "text-muted-foreground",
            )}
          >
            Registro técnico institucional
          </p>
        </div>
      )}
    </div>
  )
}
