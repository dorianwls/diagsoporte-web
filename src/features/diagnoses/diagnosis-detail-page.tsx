import { Link } from "@tanstack/react-router"
import { CalendarClock, Pencil, Printer, UserRound, Wrench } from "lucide-react"

import { PageHeader } from "@/components/shared/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface DiagnosisDetailPageProps {
  diagnosisId: string
}

const equipmentFields = [
  ["Tipo", "Laptop"],
  ["Marca", "Dell"],
  ["Código UNI", "UNI-00234"],
  ["Color", "Gris"],
  ["Número de serie", "8H2L9Q3"],
  ["Modelo", "Latitude 5420"],
]

export function DiagnosisDetailPage({ diagnosisId }: DiagnosisDetailPageProps) {
  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Ficha técnica"
        title={`Diagnóstico ${diagnosisId}`}
        description="Documento técnico registrado el 16 de agosto de 2026."
        actions={
          <>
            <Button asChild variant="outline" size="lg">
              <Link to="/diagnosticos/$diagnosisId/editar" params={{ diagnosisId }}>
                <Pencil data-icon="inline-start" />
                Editar
              </Link>
            </Button>
            <Button asChild size="lg">
              <Link to="/diagnosticos/$diagnosisId/imprimir" params={{ diagnosisId }}>
                <Printer data-icon="inline-start" />
                Imprimir
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-5">
          <Card className="gap-5 shadow-sm">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <UserRound className="size-4.5 text-primary" />
                Información general
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2">
              <Info label="Responsable del equipo" value="Juan Pérez" />
              <Info label="Área" value="Auditoría Interna" />
              <Info label="Fecha de inicio" value="16/08/2026 · 08:15" />
              <Info label="Fecha de finalización" value="16/08/2026 · 09:30" />
            </CardContent>
          </Card>

          <Card className="gap-5 shadow-sm">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <Wrench className="size-4.5 text-primary" />
                Datos del equipo
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {equipmentFields.map(([label, value]) => (
                <Info key={label} label={label} value={value} />
              ))}
            </CardContent>
          </Card>

          <Card className="gap-5 shadow-sm">
            <CardHeader className="border-b">
              <CardTitle>Trabajo técnico</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Tipo de soporte realizado
                </p>
                <Badge className="mt-2">Diagnóstico</Badge>
              </div>
              <Separator />
              <Info
                label="Observaciones Técnicas"
                value="Se verificó el funcionamiento del disco duro, memoria RAM, sistema operativo y conectividad. Se detectó lentitud durante el inicio del sistema operativo."
                multiline
              />
              <Separator />
              <Info
                label="Diagnóstico"
                value="El equipo presenta degradación del disco duro. Se recomienda reemplazar el dispositivo por una unidad SSD."
                multiline
              />
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-5">
          <Card className="gap-4 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarClock className="size-4.5 text-primary" />
                Registro
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Info label="Asignado a" value="Dorian Lanuza" />
              <Info label="Creado por" value="Dorian Lanuza" />
              <Info label="Última actualización" value="16/08/2026 · 09:42" />
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}

function Info({ label, value, multiline = false }: { label: string; value: string; multiline?: boolean }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className={multiline ? "mt-2 max-w-3xl text-sm leading-7" : "mt-1 text-sm font-medium"}>
        {value}
      </p>
    </div>
  )
}
