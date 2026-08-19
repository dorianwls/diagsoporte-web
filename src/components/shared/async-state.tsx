import { AlertTriangle, LoaderCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getErrorMessage } from "@/lib/api-client"

export function PageLoadingState({ label = "Cargando información..." }: { label?: string }) {
  return (
    <Card className="mx-auto max-w-2xl shadow-sm" aria-live="polite">
      <CardContent className="flex items-center gap-4 py-10">
        <div className="grid size-11 place-items-center rounded-xl bg-primary/8 text-primary">
          <LoaderCircle className="size-5 animate-spin" />
        </div>
        <div className="flex-1 space-y-2">
          <p className="text-sm font-medium">{label}</p>
          <div className="h-2 w-full animate-pulse rounded-full bg-muted" />
        </div>
      </CardContent>
    </Card>
  )
}

export function PageErrorState({
  error,
  onRetry,
  fallback = "No fue posible cargar la información.",
}: {
  error: unknown
  onRetry: () => void
  fallback?: string
}) {
  return (
    <Card className="mx-auto max-w-2xl border-destructive/20 shadow-sm" role="alert">
      <CardContent className="py-10 text-center">
        <div className="mx-auto grid size-12 place-items-center rounded-xl bg-destructive/8 text-destructive">
          <AlertTriangle className="size-5" />
        </div>
        <h2 className="mt-4 font-semibold">No pudimos cargar esta pantalla</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          {getErrorMessage(error, fallback)}
        </p>
        <Button variant="outline" className="mt-5" onClick={onRetry}>
          Intentar nuevamente
        </Button>
      </CardContent>
    </Card>
  )
}
