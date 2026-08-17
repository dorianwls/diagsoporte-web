import type { LucideIcon } from "lucide-react"
import { ArrowRight, Construction } from "lucide-react"
import { Link } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"

interface ModulePlaceholderProps {
  title: string
  description: string
  icon: LucideIcon
  nextStep: string
  primaryAction?: {
    label: string
    to: string
  }
}

export function ModulePlaceholder({
  title,
  description,
  icon: Icon,
  nextStep,
  primaryAction,
}: ModulePlaceholderProps) {
  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Módulo institucional"
        title={title}
        description={description}
        actions={
          primaryAction ? (
            <Button asChild size="lg">
              <Link to={primaryAction.to}>
                {primaryAction.label}
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          ) : undefined
        }
      />

      <Card className="border-dashed bg-card/70 py-0 shadow-none">
        <CardContent className="flex min-h-80 flex-col items-center justify-center px-6 py-14 text-center">
          <div className="relative mb-5">
            <div className="grid size-16 place-items-center rounded-2xl bg-primary/8 text-primary ring-1 ring-primary/12">
              <Icon className="size-7" />
            </div>
            <div className="absolute -right-2 -bottom-2 grid size-7 place-items-center rounded-full bg-accent text-accent-foreground ring-4 ring-card">
              <Construction className="size-3.5" />
            </div>
          </div>
          <h2 className="text-lg font-semibold">Estructura preparada</h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            {nextStep}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
