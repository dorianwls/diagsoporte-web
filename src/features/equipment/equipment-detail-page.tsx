import { Link } from "@tanstack/react-router"
import { ArrowLeft, Building2, ClipboardPlus, Eye, History, Laptop, Pencil, Printer, UserRound } from "lucide-react"

import { PageHeader } from "@/components/shared/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { equipmentTypes, supportTypes } from "@/config/catalogs"
import { findAreaById } from "@/features/areas/area-repository"
import { listDiagnosesByEquipmentId } from "@/features/diagnoses/diagnosis-repository"
import { findEquipmentById } from "@/features/equipment/equipment-repository"
import { findEmployeeById } from "@/features/employees/employee-repository"
import { formatLongDate, formatShortDate } from "@/lib/formatters"

interface EquipmentDetailPageProps {
  equipmentId: string
}

export function EquipmentDetailPage({ equipmentId }: EquipmentDetailPageProps) {
  const equipment = findEquipmentById(equipmentId)
  if (!equipment) return <EquipmentNotFound />

  const typeLabel = equipmentTypes.find((type) => type.value === equipment.type)?.label ?? equipment.type
  const responsible = equipment.currentResponsibleEmployeeId ? findEmployeeById(equipment.currentResponsibleEmployeeId) : undefined
  const area = equipment.currentAreaId ? findAreaById(equipment.currentAreaId) : undefined
  const diagnoses = listDiagnosesByEquipmentId(equipmentId)

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Ficha del equipo"
        title={`${equipment.brand} ${equipment.model}`}
        description={`${typeLabel} · Código UNI ${equipment.uniCode}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline"><Link to="/equipos"><ArrowLeft data-icon="inline-start" />Volver</Link></Button>
            <Button asChild><Link to="/equipos/$equipmentId/editar" params={{ equipmentId }}><Pencil data-icon="inline-start" />Editar</Link></Button>
          </div>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <Card className="gap-0 py-0 shadow-sm">
          <CardHeader className="border-b px-5 py-4 sm:px-6">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="flex items-center gap-2"><Laptop className="size-4.5 text-primary" />Datos del equipo</CardTitle>
              {equipment.isActive ? <Badge variant="secondary" className="bg-emerald-50 text-emerald-700">Activo</Badge> : <Badge variant="outline">Inactivo</Badge>}
            </div>
          </CardHeader>
          <CardContent className="p-5 sm:p-6">
            <dl className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <DetailItem label="Tipo" value={typeLabel} />
              <DetailItem label="Marca" value={equipment.brand} />
              <DetailItem label="Modelo" value={equipment.model} />
              <DetailItem label="Código UNI" value={equipment.uniCode} mono />
              <DetailItem label="Número de serie" value={equipment.serialNumber} mono />
              <DetailItem label="Color" value={equipment.color ?? "No especificado"} />
            </dl>
            <Separator className="my-6" />
            <p className="text-xs text-muted-foreground">Última actualización: {formatShortDate(equipment.updatedAt)}</p>
          </CardContent>
        </Card>

        <Card className="gap-4 bg-primary/[0.035] shadow-none">
          <CardHeader><CardTitle className="text-sm">Asignación actual</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Assignment icon={UserRound} label="Responsable" value={responsible?.fullName ?? "Sin asignar"} />
            <Assignment icon={Building2} label="Área" value={area?.name ?? "Sin asignar"} />
          </CardContent>
        </Card>
      </div>

      <Card className="gap-0 overflow-hidden py-0 shadow-sm">
        <CardHeader className="border-b px-5 py-4 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2"><History className="size-4.5 text-primary" />Historial técnico</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">Diagnósticos técnicos documentados para este equipo.</p>
            </div>
            <Button asChild><Link to="/diagnosticos/nuevo"><ClipboardPlus data-icon="inline-start" />Nuevo diagnóstico</Link></Button>
          </div>
        </CardHeader>
        <CardContent className={diagnoses.length ? "p-0" : "flex min-h-64 flex-col items-center justify-center p-8 text-center"}>
          {diagnoses.length ? (
            <div className="divide-y">
              {diagnoses.map((diagnosis) => {
                const supportLabel = diagnosis.supportType === "OTHER" ? diagnosis.supportTypeDetail ?? "Otro" : supportTypes.find((type) => type.value === diagnosis.supportType)?.label ?? diagnosis.supportType
                return (
                  <article key={diagnosis.id} className="grid gap-4 p-5 sm:grid-cols-[8rem_minmax(0,1fr)_auto] sm:items-start sm:p-6">
                    <div><p className="text-sm font-semibold">{formatLongDate(diagnosis.startedAt)}</p><p className="mt-1 font-mono text-xs text-muted-foreground">{diagnosis.code}</p></div>
                    <div><Badge variant="outline" className="font-normal">{supportLabel}</Badge><p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{diagnosis.diagnosis}</p></div>
                    <div className="flex gap-1 sm:justify-end"><Button asChild variant="ghost" size="icon-sm"><Link to="/diagnosticos/$diagnosisId" params={{ diagnosisId: diagnosis.id }} aria-label={`Ver ${diagnosis.code}`}><Eye /></Link></Button><Button asChild variant="ghost" size="icon-sm"><Link to="/diagnosticos/$diagnosisId/imprimir" params={{ diagnosisId: diagnosis.id }} aria-label={`Imprimir ${diagnosis.code}`}><Printer /></Link></Button></div>
                  </article>
                )
              })}
            </div>
          ) : (
            <><div className="grid size-14 place-items-center rounded-2xl bg-muted text-muted-foreground"><History className="size-6" /></div><h2 className="mt-4 font-semibold">Todavía no hay diagnósticos relacionados</h2><p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">Cuando registremos intervenciones técnicas para este Código UNI, aparecerán aquí ordenadas cronológicamente.</p></>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function DetailItem({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return <div><dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt><dd className={`mt-1 font-medium ${mono ? "font-mono text-sm" : ""}`}>{value}</dd></div>
}

function Assignment({ icon: Icon, label, value }: { icon: typeof UserRound; label: string; value: string }) {
  return <div className="flex gap-3"><div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/8 text-primary"><Icon className="size-4" /></div><div><p className="text-xs text-muted-foreground">{label}</p><p className="mt-0.5 text-sm font-medium">{value}</p></div></div>
}

function EquipmentNotFound() {
  return (
    <Card className="mx-auto max-w-xl py-10 text-center shadow-sm">
      <CardContent><Laptop className="mx-auto size-8 text-muted-foreground" /><h1 className="mt-5 text-xl font-semibold">Equipo no encontrado</h1><p className="mt-2 text-sm text-muted-foreground">El registro solicitado no existe.</p><Button asChild className="mt-6"><Link to="/equipos">Volver al inventario</Link></Button></CardContent>
    </Card>
  )
}
