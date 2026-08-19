import { Link } from "@tanstack/react-router"
import {
  ArrowRight,
  Building2,
  ClipboardCheck,
  FileClock,
  Laptop,
  Plus,
  Users,
} from "lucide-react"

import { PageHeader } from "@/components/shared/page-header"
import { PageErrorState, PageLoadingState } from "@/components/shared/async-state"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { equipmentTypes } from "@/config/catalogs"
import { getAuthSession } from "@/features/auth/auth-service"
import { getDashboardSummary, getRecentDiagnoses } from "@/features/dashboard/dashboard-service"
import { useApiQuery } from "@/hooks/use-api-query"
import { formatDateTime } from "@/lib/formatters"

export function DashboardPage() {
  const firstName = getAuthSession()?.fullName.split(" ")[0] ?? "Usuario"
  const query = useApiQuery("dashboard", async (signal) => {
    const [summary, recentDiagnoses] = await Promise.all([
      getDashboardSummary(signal),
      getRecentDiagnoses(5, signal),
    ])
    return { summary, recentDiagnoses }
  })

  if (query.isLoading) return <PageLoadingState label="Cargando resumen institucional..." />
  if (query.error) return <PageErrorState error={query.error} onRetry={query.reload} />
  if (!query.data) return null

  const { summary, recentDiagnoses } = query.data
  const metrics = [
    { label: "Diagnósticos registrados", value: summary.diagnosesRegistered, note: "Repositorio histórico", icon: ClipboardCheck, color: "bg-primary/8 text-primary" },
    { label: "Equipos registrados", value: summary.equipmentRegistered, note: "Inventario institucional", icon: Laptop, color: "bg-cyan-50 text-cyan-700" },
    { label: "Empleados", value: summary.employeesRegistered, note: `En ${summary.areasRegistered} áreas`, icon: Users, color: "bg-amber-50 text-amber-700" },
    { label: "Realizados este mes", value: summary.diagnosesThisMonth, note: "Actividad documentada", icon: FileClock, color: "bg-violet-50 text-violet-700" },
  ]
  const equipmentDistribution = summary.equipmentTypeDistribution
    .map((item) => ({ label: equipmentTypes.find((type) => type.value === item.type)?.label ?? item.type, value: item.percentage }))
    .slice(0, 4)

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Resumen institucional"
        title={`Buenos días, ${firstName}`}
        description="Consulta la actividad reciente del repositorio técnico de la universidad."
        actions={
          <Button asChild size="lg">
            <Link to="/diagnosticos/nuevo">
              <Plus data-icon="inline-start" />
              Nuevo diagnóstico
            </Link>
          </Button>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Indicadores generales">
        {metrics.map((metric) => (
          <Card key={metric.label} className="relative gap-5 overflow-hidden border-0 py-5 shadow-[0_1px_3px_0_rgb(15_23_42/0.08)] ring-1 ring-border/70">
            <CardContent className="flex items-start justify-between px-5">
              <div>
                <p className="text-3xl font-semibold tracking-tight">{metric.value}</p>
                <p className="mt-2 font-medium text-foreground">{metric.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{metric.note}</p>
              </div>
              <div className={`grid size-11 place-items-center rounded-xl ${metric.color}`}>
                <metric.icon className="size-5" />
              </div>
            </CardContent>
            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-primary/70 via-cyan-500/40 to-transparent" />
          </Card>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(20rem,0.8fr)]">
        <Card className="gap-0 py-0 shadow-sm">
          <CardHeader className="grid-cols-[minmax(0,1fr)_auto] items-center border-b px-5 py-4">
            <div>
              <CardTitle>Últimos diagnósticos</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">Intervenciones técnicas registradas recientemente</p>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link to="/diagnosticos">
                Ver todos
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="divide-y px-0">
            {recentDiagnoses.map((item) => (
              <Link
                key={item.id}
                to="/diagnosticos/$diagnosisId"
                params={{ diagnosisId: item.id }}
                className="group flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-muted/45 sm:flex-row sm:items-center"
              >
                <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
                  <ClipboardCheck className="size-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium group-hover:text-primary">{item.snapshot.equipment.brand} {item.snapshot.equipment.model}</p>
                    <Badge variant="secondary" className="font-mono text-[0.68rem]">
                      {item.snapshot.equipment.uniCode}
                    </Badge>
                  </div>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {item.supportPerformed} · {item.snapshot.area.name}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-3 sm:block sm:text-right">
                  <p className="text-xs font-medium">{item.code}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(item.startedAt)}</p>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="gap-5 py-5 shadow-sm">
          <CardHeader className="grid-cols-[minmax(0,1fr)_auto] items-center px-5">
            <div>
              <CardTitle>Equipos diagnosticados</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">Distribución de este mes</p>
            </div>
            <div className="grid size-9 place-items-center rounded-lg bg-accent text-accent-foreground">
              <Building2 className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-5 px-5">
            {equipmentDistribution.length ? equipmentDistribution.map((item) => (
              <div key={item.label}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-semibold">{item.value}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-cyan-600"
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            )) : <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">Todavía no hay diagnósticos este mes.</p>}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
