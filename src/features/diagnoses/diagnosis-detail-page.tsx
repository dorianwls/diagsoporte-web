import { Link } from "@tanstack/react-router"
import { CalendarClock, FileOutput, FileText, Laptop, Pencil, Printer, UserRound, Wrench } from "lucide-react"

import { PageHeader } from "@/components/shared/page-header"
import { PageErrorState, PageLoadingState } from "@/components/shared/async-state"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { equipmentTypes } from "@/config/catalogs"
import { hasPermission } from "@/features/auth/auth-service"
import { findDiagnosisById } from "@/features/diagnoses/diagnosis-repository"
import { useApiQuery } from "@/hooks/use-api-query"
import { formatDateTime } from "@/lib/formatters"

interface DiagnosisDetailPageProps {
  diagnosisId: string
}

export function DiagnosisDetailPage({ diagnosisId }: DiagnosisDetailPageProps) {
  const query = useApiQuery(`diagnosis:${diagnosisId}`, (signal) => findDiagnosisById(diagnosisId, signal))
  const diagnosis = query.data

  if (query.isLoading) return <PageLoadingState label="Cargando diagnóstico técnico..." />
  if (query.error) return <PageErrorState error={query.error} onRetry={query.reload} />
  if (!diagnosis) return <DiagnosisNotFound />

  const { snapshot } = diagnosis
  const equipmentType = equipmentTypes.find((type) => type.value === snapshot.equipment.type)?.label ?? snapshot.equipment.type

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Ficha técnica"
        title={`Diagnóstico ${diagnosis.code}`}
        description={`Intervención documentada el ${formatDateTime(diagnosis.startedAt)}.`}
        actions={
          <div className="flex flex-wrap gap-2">
            {hasPermission("diagnoses:update") && <Button asChild variant="outline"><Link to="/diagnosticos/$diagnosisId/editar" params={{ diagnosisId }}><Pencil data-icon="inline-start" />Editar</Link></Button>}
            {hasPermission("diagnoses:export") && <Button asChild><Link to="/diagnosticos/$diagnosisId/imprimir" params={{ diagnosisId }}><FileOutput data-icon="inline-start" />Imprimir o exportar</Link></Button>}
          </div>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-5">
          <Card className="gap-5 shadow-sm">
            <CardHeader className="border-b"><CardTitle className="flex items-center gap-2"><UserRound className="size-4.5 text-primary" />Información general</CardTitle></CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2">
              <Info label="Responsable del equipo" value={snapshot.responsible.fullName} />
              <Info label="Área" value={snapshot.area.name} />
              <Info label="Fecha de inicio" value={formatDateTime(diagnosis.startedAt)} />
              <Info label="Fecha de finalización" value={formatDateTime(diagnosis.finishedAt)} />
            </CardContent>
          </Card>

          <Card className="gap-5 shadow-sm">
            <CardHeader className="border-b"><CardTitle className="flex items-center gap-2"><Laptop className="size-4.5 text-primary" />Datos del equipo</CardTitle></CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Info label="Tipo" value={equipmentType} />
              <Info label="Marca" value={snapshot.equipment.brand} />
              <Info label="Código UNI" value={snapshot.equipment.uniCode} mono />
              <Info label="Color" value={snapshot.equipment.color ?? "No especificado"} />
              <Info label="Número de serie" value={snapshot.equipment.serialNumber} mono />
              <Info label="Modelo" value={snapshot.equipment.model} />
            </CardContent>
          </Card>

          <Card className="gap-5 shadow-sm">
            <CardHeader className="border-b"><CardTitle className="flex items-center gap-2"><Wrench className="size-4.5 text-primary" />Trabajo técnico</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <Info label="Tipo de soporte realizado" value={diagnosis.supportPerformed} multiline />
              <Separator />
              <Info label="Observaciones Técnicas" value={diagnosis.technicalObservations} multiline />
              <Separator />
              <Info label="Diagnóstico" value={diagnosis.diagnosis} multiline />
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-5">
          <Card className="gap-4 shadow-sm">
            <CardHeader><CardTitle className="flex items-center gap-2"><CalendarClock className="size-4.5 text-primary" />Registro</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Info label="Asignado a" value={snapshot.assignedTechnician.fullName} />
              <Info label="Código" value={diagnosis.code} mono />
              <Info label="Última actualización" value={formatDateTime(diagnosis.updatedAt)} />
            </CardContent>
          </Card>
          {hasPermission("diagnoses:export") && <Card className="gap-3 bg-primary/[0.035] shadow-none">
            <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Printer className="size-4 text-primary" />Documento institucional</CardTitle></CardHeader>
            <CardContent><p className="text-sm leading-6 text-muted-foreground">La vista documental permite imprimir o descargar este reporte en Word y PDF.</p><Button asChild variant="outline" className="mt-4 w-full"><Link to="/diagnosticos/$diagnosisId/imprimir" params={{ diagnosisId }}><FileText />Abrir documento</Link></Button></CardContent>
          </Card>}
        </aside>
      </div>
    </div>
  )
}

function Info({ label, value, multiline = false, mono = false }: { label: string; value: string; multiline?: boolean; mono?: boolean }) {
  return <div><p className="text-xs font-medium text-muted-foreground">{label}</p><p className={`${multiline ? "mt-2 max-w-3xl whitespace-pre-line text-sm leading-7" : "mt-1 text-sm font-medium"} ${mono ? "font-mono" : ""}`}>{value}</p></div>
}

function DiagnosisNotFound() {
  return <Card className="mx-auto max-w-xl py-10 text-center shadow-sm"><CardContent><FileText className="mx-auto size-8 text-muted-foreground" /><h1 className="mt-5 text-xl font-semibold">Diagnóstico no encontrado</h1><p className="mt-2 text-sm text-muted-foreground">El registro solicitado no existe.</p><Button asChild className="mt-6"><Link to="/diagnosticos">Volver a los diagnósticos</Link></Button></CardContent></Card>
}
