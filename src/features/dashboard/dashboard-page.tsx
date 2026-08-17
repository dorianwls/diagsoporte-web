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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getAuthSession } from "@/features/auth/auth-service"

const metrics = [
  {
    label: "Diagnósticos registrados",
    value: "428",
    note: "Repositorio histórico",
    icon: ClipboardCheck,
    color: "bg-primary/8 text-primary",
  },
  {
    label: "Equipos registrados",
    value: "215",
    note: "Inventario institucional",
    icon: Laptop,
    color: "bg-cyan-50 text-cyan-700",
  },
  {
    label: "Empleados",
    value: "96",
    note: "En 18 áreas",
    icon: Users,
    color: "bg-amber-50 text-amber-700",
  },
  {
    label: "Realizados este mes",
    value: "32",
    note: "+8 frente al mes anterior",
    icon: FileClock,
    color: "bg-violet-50 text-violet-700",
  },
]

const recentDiagnoses = [
  {
    id: "DG-000428",
    equipment: "Dell Latitude 5420",
    code: "UNI-00234",
    area: "Registro",
    type: "Diagnóstico",
    date: "16 Ago, 10:35",
  },
  {
    id: "DG-000427",
    equipment: "HP LaserJet Pro M404",
    code: "UNI-00128",
    area: "Auditoría",
    type: "Mantenimiento preventivo",
    date: "15 Ago, 14:20",
  },
  {
    id: "DG-000426",
    equipment: "Dell OptiPlex 7090",
    code: "UNI-00387",
    area: "Recursos Humanos",
    type: "Instalación de software",
    date: "14 Ago, 09:10",
  },
]

const equipmentDistribution = [
  { label: "Laptops", value: 42 },
  { label: "Desktop", value: 31 },
  { label: "Impresoras", value: 18 },
  { label: "Otros", value: 9 },
]

export function DashboardPage() {
  const firstName = getAuthSession()?.fullName.split(" ")[0] ?? "Usuario"

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
                    <p className="font-medium group-hover:text-primary">{item.equipment}</p>
                    <Badge variant="secondary" className="font-mono text-[0.68rem]">
                      {item.code}
                    </Badge>
                  </div>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {item.type} · {item.area}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-3 sm:block sm:text-right">
                  <p className="text-xs font-medium">{item.id}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.date}</p>
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
            {equipmentDistribution.map((item) => (
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
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
