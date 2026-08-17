import { useMemo, useState } from "react"
import { Link } from "@tanstack/react-router"
import { ClipboardList, Plus, Search, SlidersHorizontal } from "lucide-react"
import { useTable } from "@tanstack/react-table"

import { DataTable } from "@/components/shared/data-table"
import { DataTablePagination } from "@/components/shared/data-table-pagination"
import { PageHeader } from "@/components/shared/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { equipmentTypes, supportTypes } from "@/config/catalogs"
import { diagnosisColumns, diagnosisTableFeatures, type DiagnosisTableRow } from "@/features/diagnoses/diagnosis-columns"
import { listDiagnoses } from "@/features/diagnoses/diagnosis-repository"

export function DiagnosesPage() {
  const diagnoses = useMemo(() => listDiagnoses(), [])
  const [dateFilter, setDateFilter] = useState("")
  const typeLabels = useMemo(() => new Map(equipmentTypes.map((type) => [type.value, type.label])), [])
  const supportLabels = useMemo(() => new Map(supportTypes.map((type) => [type.value, type.label])), [])
  const allRows = useMemo<DiagnosisTableRow[]>(
    () => diagnoses.map((diagnosis) => ({
      ...diagnosis,
      equipmentSearch: `${typeLabels.get(diagnosis.snapshot.equipment.type) ?? diagnosis.snapshot.equipment.type} ${diagnosis.snapshot.equipment.brand} ${diagnosis.snapshot.equipment.model} ${diagnosis.snapshot.equipment.uniCode} ${diagnosis.snapshot.equipment.serialNumber}`,
      responsibleName: diagnosis.snapshot.responsible.fullName,
      areaName: diagnosis.snapshot.area.name,
      supportTypeLabel: diagnosis.supportType === "OTHER" ? `Otro${diagnosis.supportTypeDetail ? ` · ${diagnosis.supportTypeDetail}` : ""}` : supportLabels.get(diagnosis.supportType) ?? diagnosis.supportType,
      technicianName: diagnosis.snapshot.assignedTechnician.fullName,
    })),
    [diagnoses, supportLabels, typeLabels],
  )
  const rows = useMemo(
    () => dateFilter ? allRows.filter((row) => toLocalDateKey(row.startedAt) === dateFilter) : allRows,
    [allRows, dateFilter],
  )
  const table = useTable({
    features: diagnosisTableFeatures,
    columns: diagnosisColumns,
    data: rows,
    globalFilterFn: "includesString",
    initialState: {
      pagination: { pageIndex: 0, pageSize: 10 },
      sorting: [{ id: "startedAt", desc: true }],
    },
  })

  const filteredRowCount = table.getFilteredRowModel().rows.length
  const { pageIndex, pageSize } = table.state.pagination
  const firstVisibleRow = filteredRowCount === 0 ? 0 : pageIndex * pageSize + 1
  const lastVisibleRow = Math.min((pageIndex + 1) * pageSize, filteredRowCount)
  const areaFilter = String(table.getColumn("areaName")?.getFilterValue() ?? "all")
  const supportFilter = String(table.getColumn("supportTypeLabel")?.getFilterValue() ?? "all")
  const technicianFilter = String(table.getColumn("technicianName")?.getFilterValue() ?? "all")
  const equipmentFilter = String(table.getColumn("equipmentSearch")?.getFilterValue() ?? "all")
  const uniqueAreas = [...new Set(allRows.map((row) => row.areaName))].sort()
  const uniqueTechnicians = [...new Set(allRows.map((row) => row.technicianName))].sort()
  const currentMonth = toLocalDateKey(new Date().toISOString()).slice(0, 7)
  const diagnosesThisMonth = diagnoses.filter((diagnosis) => toLocalDateKey(diagnosis.startedAt).startsWith(currentMonth)).length

  function resetFilters() {
    table.resetGlobalFilter(true)
    table.resetColumnFilters(true)
    setDateFilter("")
  }

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Repositorio histórico"
        title="Diagnósticos técnicos"
        description="Busca, filtra y consulta las intervenciones documentadas sobre los equipos de la universidad."
        actions={<Button asChild size="lg"><Link to="/diagnosticos/nuevo"><Plus data-icon="inline-start" />Nuevo diagnóstico</Link></Button>}
      />

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="h-7 bg-card px-3">{diagnoses.length} diagnósticos registrados</Badge>
        <Badge variant="outline" className="h-7 bg-card px-3 text-primary">{diagnosesThisMonth} realizados este mes</Badge>
      </div>

      <Card className="gap-0 overflow-hidden py-0 shadow-sm">
        <div className="space-y-3 border-b p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={String(table.state.globalFilter ?? "")} onChange={(event) => table.setGlobalFilter(event.target.value)} placeholder="Buscar por Código UNI, serie, equipo, responsable, área o técnico..." className="h-10 pl-9" aria-label="Buscar diagnósticos" />
          </div>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-[auto_repeat(5,minmax(0,1fr))]">
            <SlidersHorizontal className="hidden size-4 self-center text-muted-foreground xl:block" />
            <Select value={areaFilter} onValueChange={(value) => table.getColumn("areaName")?.setFilterValue(value === "all" ? undefined : value)}><SelectTrigger className="h-10 w-full bg-card"><SelectValue placeholder="Área" /></SelectTrigger><SelectContent><SelectItem value="all">Todas las áreas</SelectItem>{uniqueAreas.map((area) => <SelectItem key={area} value={area}>{area}</SelectItem>)}</SelectContent></Select>
            <Select value={equipmentFilter} onValueChange={(value) => table.getColumn("equipmentSearch")?.setFilterValue(value === "all" ? undefined : value)}><SelectTrigger className="h-10 w-full bg-card"><SelectValue placeholder="Tipo de equipo" /></SelectTrigger><SelectContent><SelectItem value="all">Todos los equipos</SelectItem>{equipmentTypes.map((type) => <SelectItem key={type.value} value={type.label}>{type.label}</SelectItem>)}</SelectContent></Select>
            <Select value={supportFilter} onValueChange={(value) => table.getColumn("supportTypeLabel")?.setFilterValue(value === "all" ? undefined : value)}><SelectTrigger className="h-10 w-full bg-card"><SelectValue placeholder="Tipo de soporte" /></SelectTrigger><SelectContent><SelectItem value="all">Todos los soportes</SelectItem>{supportTypes.map((type) => <SelectItem key={type.value} value={type.label}>{type.label}</SelectItem>)}</SelectContent></Select>
            <Select value={technicianFilter} onValueChange={(value) => table.getColumn("technicianName")?.setFilterValue(value === "all" ? undefined : value)}><SelectTrigger className="h-10 w-full bg-card"><SelectValue placeholder="Técnico" /></SelectTrigger><SelectContent><SelectItem value="all">Todos los técnicos</SelectItem>{uniqueTechnicians.map((technician) => <SelectItem key={technician} value={technician}>{technician}</SelectItem>)}</SelectContent></Select>
            <Input type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} className="h-10 bg-card" aria-label="Filtrar por fecha" />
          </div>
        </div>

        <CardContent className="p-0">
          <DataTable table={table} columnCount={diagnosisColumns.length} emptyState={<div className="mx-auto flex max-w-sm flex-col items-center"><div className="grid size-14 place-items-center rounded-2xl bg-muted text-muted-foreground"><ClipboardList className="size-6" /></div><h2 className="mt-4 font-semibold">No encontramos diagnósticos</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Ajuste la búsqueda o los filtros para consultar otros registros.</p><Button variant="outline" size="sm" className="mt-4" onClick={resetFilters}>Limpiar filtros</Button></div>} />
        </CardContent>

        <DataTablePagination entityLabel="diagnósticos" firstVisibleRow={firstVisibleRow} lastVisibleRow={lastVisibleRow} rowCount={filteredRowCount} pageIndex={pageIndex} pageSize={pageSize} pageCount={table.getPageCount()} canPreviousPage={table.getCanPreviousPage()} canNextPage={table.getCanNextPage()} onPageSizeChange={(value) => table.setPageSize(value)} onPreviousPage={() => table.previousPage()} onNextPage={() => table.nextPage()} />
      </Card>
    </div>
  )
}

function toLocalDateKey(value: string) {
  const date = new Date(value)
  const pad = (part: number) => String(part).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}
