import { useMemo, useState } from "react"
import { Link } from "@tanstack/react-router"
import { CircleOff, Laptop, Plus, RotateCcw, Search } from "lucide-react"
import { useTable } from "@tanstack/react-table"
import { toast } from "sonner"

import { PageErrorState } from "@/components/shared/async-state"
import { DataTable } from "@/components/shared/data-table"
import { DataTablePagination } from "@/components/shared/data-table-pagination"
import { PageHeader } from "@/components/shared/page-header"
import type { ServerSorting } from "@/components/shared/server-sort-button"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { equipmentTypes } from "@/config/catalogs"
import { listAllAreas } from "@/features/areas/area-repository"
import { hasPermission } from "@/features/auth/auth-service"
import { createEquipmentColumns, equipmentTableFeatures, type EquipmentTableRow } from "@/features/equipment/equipment-columns"
import { listEquipment, setEquipmentActive } from "@/features/equipment/equipment-repository"
import { useApiQuery } from "@/hooks/use-api-query"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { getErrorMessage } from "@/lib/api-client"
import type { Equipment } from "@/types/domain"

export function EquipmentListPage() {
  const [search, setSearch] = useState("")
  const [type, setType] = useState("all")
  const [areaId, setAreaId] = useState("all")
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all")
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [sorting, setSorting] = useState<ServerSorting>({ id: "uniCode", direction: "asc" })
  const [pendingEquipment, setPendingEquipment] = useState<Equipment | null>(null)
  const debouncedSearch = useDebouncedValue(search)
  const canCreate = hasPermission("equipment:create")
  const canManage = hasPermission("equipment:update")
  const filterState = { debouncedSearch, type, areaId, status, pageIndex, pageSize, sorting }
  const query = useApiQuery(`equipment:${JSON.stringify(filterState)}`, async (signal) => {
    const [result, areas] = await Promise.all([
      listEquipment({
        search: debouncedSearch,
        type: type === "all" ? undefined : type,
        areaId: areaId === "all" ? undefined : areaId,
        isActive: status === "all" ? undefined : status === "active",
        sortBy: sorting.id as "uniCode" | "brand" | "updatedAt",
        sortDirection: sorting.direction,
        page: pageIndex + 1,
        pageSize,
      }, signal),
      listAllAreas(true, signal),
    ])
    return { result, areas }
  })
  const result = query.data?.result
  const rows: EquipmentTableRow[] = (result?.items ?? []).map((equipment) => ({
    ...equipment,
    typeLabel: equipmentTypes.find((item) => item.value === equipment.type)?.label ?? equipment.type,
  }))
  const columns = useMemo(
    () => createEquipmentColumns({
      onStatusRequest: setPendingEquipment,
      sorting,
      onSortingChange: (value) => { setSorting(value); setPageIndex(0) },
      canManage,
    }),
    [canManage, sorting],
  )
  const table = useTable({
    features: equipmentTableFeatures,
    columns,
    data: rows,
    manualPagination: true,
    rowCount: result?.totalItems ?? 0,
  })

  async function handleStatusChange() {
    if (!pendingEquipment) return
    try {
      const updated = await setEquipmentActive(pendingEquipment.id, !pendingEquipment.isActive)
      toast.success(updated.isActive ? "Equipo reactivado correctamente" : "Equipo desactivado correctamente")
      query.reload()
    } catch (error) {
      toast.error(getErrorMessage(error, "No fue posible actualizar el estado del equipo"))
    } finally {
      setPendingEquipment(null)
    }
  }

  function clearFilters() {
    setSearch("")
    setType("all")
    setAreaId("all")
    setStatus("all")
    setPageIndex(0)
  }

  const totalItems = result?.totalItems ?? 0

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Inventario institucional"
        title="Equipos tecnológicos"
        description="Consulta los activos tecnológicos y accede al historial técnico documentado de cada equipo."
        actions={canCreate ? <Button asChild size="lg"><Link to="/equipos/nuevo"><Plus data-icon="inline-start" />Registrar equipo</Link></Button> : undefined}
      />
      <Badge variant="outline" className="h-7 bg-card px-3">{totalItems} equipos encontrados</Badge>

      {query.error ? <PageErrorState error={query.error} onRetry={query.reload} /> : (
        <Card className="gap-0 overflow-hidden py-0 shadow-sm">
          <div className="grid gap-3 border-b p-4 xl:grid-cols-[minmax(20rem,1fr)_13rem_14rem_12rem]">
            <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => { setSearch(event.target.value); setPageIndex(0) }} placeholder="Buscar por código UNI, serie, marca o modelo..." className="h-10 pl-9" /></div>
            <Select value={type} onValueChange={(value) => { setType(value); setPageIndex(0) }}><SelectTrigger className="h-10 bg-card"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todos los equipos</SelectItem>{equipmentTypes.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent></Select>
            <Select value={areaId} onValueChange={(value) => { setAreaId(value); setPageIndex(0) }}><SelectTrigger className="h-10 bg-card"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todas las áreas</SelectItem>{query.data?.areas.map((area) => <SelectItem key={area.id} value={area.id}>{area.name}</SelectItem>)}</SelectContent></Select>
            <Select value={status} onValueChange={(value) => { setStatus(value as typeof status); setPageIndex(0) }}><SelectTrigger className="h-10 bg-card"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todos los estados</SelectItem><SelectItem value="active">Activos</SelectItem><SelectItem value="inactive">Inactivos</SelectItem></SelectContent></Select>
          </div>
          <CardContent className="p-0"><DataTable table={table} columnCount={columns.length} isLoading={query.isLoading} emptyState={<EquipmentEmptyState onReset={clearFilters} />} /></CardContent>
          <DataTablePagination
            entityLabel="equipos" firstVisibleRow={totalItems === 0 ? 0 : pageIndex * pageSize + 1}
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

      <AlertDialog open={Boolean(pendingEquipment)} onOpenChange={(open) => !open && setPendingEquipment(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogMedia className={pendingEquipment?.isActive ? "bg-destructive/10 text-destructive" : "bg-accent text-accent-foreground"}>{pendingEquipment?.isActive ? <CircleOff /> : <RotateCcw />}</AlertDialogMedia><AlertDialogTitle>{pendingEquipment?.isActive ? "Desactivar equipo" : "Reactivar equipo"}</AlertDialogTitle><AlertDialogDescription>{pendingEquipment?.isActive ? `${pendingEquipment.uniCode} dejará de estar disponible para diagnósticos nuevos.` : `${pendingEquipment?.uniCode} volverá a estar disponible.`}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction variant={pendingEquipment?.isActive ? "destructive" : "default"} onClick={handleStatusChange}>{pendingEquipment?.isActive ? "Desactivar" : "Reactivar"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function EquipmentEmptyState({ onReset }: { onReset: () => void }) {
  return <div className="mx-auto flex max-w-sm flex-col items-center"><div className="grid size-14 place-items-center rounded-2xl bg-muted text-muted-foreground"><Laptop className="size-6" /></div><h2 className="mt-4 font-semibold">No encontramos equipos</h2><p className="mt-2 text-sm text-muted-foreground">Ajuste la búsqueda o los filtros.</p><Button variant="outline" size="sm" className="mt-4" onClick={onReset}>Limpiar filtros</Button></div>
}
