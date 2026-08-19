import { useMemo, useState } from "react"
import { Link } from "@tanstack/react-router"
import { ClipboardList, Plus, Search } from "lucide-react"
import { useTable } from "@tanstack/react-table"

import { PageErrorState } from "@/components/shared/async-state"
import { DataTable } from "@/components/shared/data-table"
import { DataTablePagination } from "@/components/shared/data-table-pagination"
import { PageHeader } from "@/components/shared/page-header"
import type { ServerSorting } from "@/components/shared/server-sort-button"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { equipmentTypes } from "@/config/catalogs"
import { listAllAreas } from "@/features/areas/area-repository"
import { hasPermission } from "@/features/auth/auth-service"
import { createDiagnosisColumns, diagnosisTableFeatures, type DiagnosisTableRow } from "@/features/diagnoses/diagnosis-columns"
import { listDiagnoses } from "@/features/diagnoses/diagnosis-repository"
import { listTechnicians } from "@/features/users/user-service"
import { useApiQuery } from "@/hooks/use-api-query"
import { useDebouncedValue } from "@/hooks/use-debounced-value"

export function DiagnosesPage() {
  const [search, setSearch] = useState("")
  const [areaId, setAreaId] = useState("all")
  const [equipmentType, setEquipmentType] = useState("all")
  const [technicianId, setTechnicianId] = useState("all")
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [sorting, setSorting] = useState<ServerSorting>({ id: "startedAt", direction: "desc" })
  const debouncedSearch = useDebouncedValue(search)
  const state = { debouncedSearch, areaId, equipmentType, technicianId, pageIndex, pageSize, sorting }
  const query = useApiQuery(`diagnoses:${JSON.stringify(state)}`, async (signal) => {
    const [result, areas, technicians] = await Promise.all([
      listDiagnoses({
        search: debouncedSearch,
        areaId: areaId === "all" ? undefined : areaId,
        equipmentType: equipmentType === "all" ? undefined : equipmentType,
        technicianId: technicianId === "all" ? undefined : technicianId,
        sortBy: sorting.id as "startedAt" | "code" | "area" | "technician",
        sortDirection: sorting.direction,
        page: pageIndex + 1,
        pageSize,
      }, signal),
      listAllAreas(true, signal),
      listTechnicians(signal),
    ])
    return { result, areas, technicians }
  })
  const result = query.data?.result
  const rows: DiagnosisTableRow[] = (result?.items ?? []).map((diagnosis) => ({
    ...diagnosis,
    equipmentSearch: `${diagnosis.snapshot.equipment.brand} ${diagnosis.snapshot.equipment.model} ${diagnosis.snapshot.equipment.uniCode} ${diagnosis.snapshot.equipment.serialNumber}`,
    responsibleName: diagnosis.snapshot.responsible.fullName,
    areaName: diagnosis.snapshot.area.name,
    technicianName: diagnosis.snapshot.assignedTechnician.fullName,
  }))
  const columns = useMemo(
    () => createDiagnosisColumns({
      sorting,
      onSortingChange: (value) => { setSorting(value); setPageIndex(0) },
      canEdit: hasPermission("diagnoses:update"),
      canExport: hasPermission("diagnoses:export"),
    }),
    [sorting],
  )
  const table = useTable({
    features: diagnosisTableFeatures,
    columns,
    data: rows,
    manualPagination: true,
    rowCount: result?.totalItems ?? 0,
  })

  function clearFilters() {
    setSearch("")
    setAreaId("all")
    setEquipmentType("all")
    setTechnicianId("all")
    setPageIndex(0)
  }

  const totalItems = result?.totalItems ?? 0

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Repositorio histórico"
        title="Diagnósticos técnicos"
        description="Busca y consulta las intervenciones técnicas documentadas para los equipos de la universidad."
        actions={hasPermission("diagnoses:create") ? <Button asChild size="lg"><Link to="/diagnosticos/nuevo"><Plus data-icon="inline-start" />Nuevo diagnóstico</Link></Button> : undefined}
      />
      <Badge variant="outline" className="h-7 bg-card px-3">{totalItems} diagnósticos encontrados</Badge>

      {query.error ? <PageErrorState error={query.error} onRetry={query.reload} /> : (
        <Card className="gap-0 overflow-hidden py-0 shadow-sm">
          <div className="grid gap-3 border-b p-4 xl:grid-cols-[minmax(20rem,1fr)_14rem_14rem_14rem]">
            <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => { setSearch(event.target.value); setPageIndex(0) }} placeholder="Buscar por código UNI, serie, equipo o responsable..." className="h-10 pl-9" /></div>
            <Select value={areaId} onValueChange={(value) => { setAreaId(value); setPageIndex(0) }}><SelectTrigger className="h-10 bg-card"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todas las áreas</SelectItem>{query.data?.areas.map((area) => <SelectItem key={area.id} value={area.id}>{area.name}</SelectItem>)}</SelectContent></Select>
            <Select value={equipmentType} onValueChange={(value) => { setEquipmentType(value); setPageIndex(0) }}><SelectTrigger className="h-10 bg-card"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todos los equipos</SelectItem>{equipmentTypes.map((type) => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}</SelectContent></Select>
            <Select value={technicianId} onValueChange={(value) => { setTechnicianId(value); setPageIndex(0) }}><SelectTrigger className="h-10 bg-card"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todos los técnicos</SelectItem>{query.data?.technicians.map((technician) => <SelectItem key={technician.id} value={technician.id}>{technician.fullName}</SelectItem>)}</SelectContent></Select>
          </div>
          <CardContent className="p-0"><DataTable table={table} columnCount={columns.length} isLoading={query.isLoading} emptyState={<DiagnosisEmptyState onReset={clearFilters} />} /></CardContent>
          <DataTablePagination
            entityLabel="diagnósticos" firstVisibleRow={totalItems === 0 ? 0 : pageIndex * pageSize + 1}
            lastVisibleRow={Math.min((pageIndex + 1) * pageSize, totalItems)} rowCount={totalItems}
            pageIndex={pageIndex} pageSize={pageSize} pageCount={result?.totalPages ?? 0}
            pageSizeOptions={[10, 20, 50, 100]} canPreviousPage={pageIndex > 0}
            canNextPage={pageIndex + 1 < (result?.totalPages ?? 0)}
            onPageSizeChange={(value) => { setPageSize(value); setPageIndex(0) }}
            onPreviousPage={() => setPageIndex((value) => Math.max(0, value - 1))}
            onNextPage={() => setPageIndex((value) => value + 1)}
          />
        </Card>
      )}
    </div>
  )
}

function DiagnosisEmptyState({ onReset }: { onReset: () => void }) {
  return <div className="mx-auto flex max-w-sm flex-col items-center"><div className="grid size-14 place-items-center rounded-2xl bg-muted text-muted-foreground"><ClipboardList className="size-6" /></div><h2 className="mt-4 font-semibold">No encontramos diagnósticos</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Pruebe con otros criterios de búsqueda.</p><Button variant="outline" size="sm" className="mt-4" onClick={onReset}>Limpiar filtros</Button></div>
}
