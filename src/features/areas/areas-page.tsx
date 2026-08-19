import { useMemo, useState } from "react"
import { Link } from "@tanstack/react-router"
import { Building2, CircleOff, Plus, RotateCcw, Search, SlidersHorizontal } from "lucide-react"
import { useTable } from "@tanstack/react-table"
import { toast } from "sonner"

import { PageErrorState } from "@/components/shared/async-state"
import { DataTable } from "@/components/shared/data-table"
import { DataTablePagination } from "@/components/shared/data-table-pagination"
import { PageHeader } from "@/components/shared/page-header"
import type { ServerSorting } from "@/components/shared/server-sort-button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { areaTableFeatures, createAreaColumns } from "@/features/areas/area-columns"
import { listAreas, setAreaActive } from "@/features/areas/area-repository"
import { hasPermission } from "@/features/auth/auth-service"
import { useApiQuery } from "@/hooks/use-api-query"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { getErrorMessage } from "@/lib/api-client"
import type { Area } from "@/types/domain"

export function AreasPage() {
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all")
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [sorting, setSorting] = useState<ServerSorting>({ id: "name", direction: "asc" })
  const [pendingArea, setPendingArea] = useState<Area | null>(null)
  const debouncedSearch = useDebouncedValue(search)
  const canCreate = hasPermission("areas:create")
  const canManage = hasPermission("areas:update")
  const queryKey = JSON.stringify({ debouncedSearch, status, pageIndex, pageSize, sorting })
  const query = useApiQuery(`areas:${queryKey}`, async (signal) => {
    const result = await listAreas({
      search: debouncedSearch,
      isActive: status === "all" ? undefined : status === "active",
      sortBy: sorting.id as "name" | "updatedAt",
      sortDirection: sorting.direction,
      page: pageIndex + 1,
      pageSize,
    }, signal)
    return result
  })
  const areas = query.data?.items ?? []
  const columns = useMemo(
    () => createAreaColumns({
      onStatusRequest: setPendingArea,
      sorting,
      onSortingChange: (value) => {
        setSorting(value)
        setPageIndex(0)
      },
      canManage,
    }),
    [canManage, sorting],
  )
  const table = useTable({
    features: areaTableFeatures,
    columns,
    data: areas,
    manualPagination: true,
    rowCount: query.data?.totalItems ?? 0,
  })

  async function handleStatusChange() {
    if (!pendingArea) return

    try {
      const updated = await setAreaActive(pendingArea.id, !pendingArea.isActive)
      toast.success(updated.isActive ? "Área reactivada correctamente" : "Área desactivada correctamente")
      query.reload()
    } catch (error) {
      toast.error(getErrorMessage(error, "No fue posible actualizar el estado del área"))
    } finally {
      setPendingArea(null)
    }
  }

  function resetFilters() {
    setSearch("")
    setStatus("all")
    setPageIndex(0)
  }

  const totalItems = query.data?.totalItems ?? 0
  const firstVisibleRow = totalItems === 0 ? 0 : pageIndex * pageSize + 1
  const lastVisibleRow = Math.min((pageIndex + 1) * pageSize, totalItems)

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Catálogo institucional"
        title="Áreas universitarias"
        description="Administra las unidades académicas y administrativas utilizadas en empleados, equipos y diagnósticos."
        actions={canCreate ? <Button asChild size="lg"><Link to="/areas/nueva"><Plus data-icon="inline-start" />Registrar área</Link></Button> : undefined}
      />

      <Badge variant="outline" className="h-7 bg-card px-3">{totalItems} áreas encontradas</Badge>

      {query.error ? (
        <PageErrorState error={query.error} onRetry={query.reload} />
      ) : (
        <Card className="gap-0 overflow-hidden py-0 shadow-sm">
          <div className="flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(event) => { setSearch(event.target.value); setPageIndex(0) }} placeholder="Buscar un área..." className="h-10 pl-9" aria-label="Buscar áreas" />
            </div>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="hidden size-4 text-muted-foreground sm:block" />
              <Select value={status} onValueChange={(value) => { setStatus(value as typeof status); setPageIndex(0) }}>
                <SelectTrigger className="h-10 w-full min-w-40 bg-card sm:w-44"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las áreas</SelectItem>
                  <SelectItem value="active">Activas</SelectItem>
                  <SelectItem value="inactive">Inactivas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <CardContent className="p-0">
            <DataTable table={table} columnCount={columns.length} isLoading={query.isLoading} emptyState={<EmptyState onReset={resetFilters} />} />
          </CardContent>
          <DataTablePagination
            entityLabel="áreas"
            firstVisibleRow={firstVisibleRow}
            lastVisibleRow={lastVisibleRow}
            rowCount={totalItems}
            pageIndex={pageIndex}
            pageSize={pageSize}
            pageCount={query.data?.totalPages ?? 0}
            pageSizeOptions={[10, 20, 50, 100]}
            canPreviousPage={pageIndex > 0}
            canNextPage={pageIndex + 1 < (query.data?.totalPages ?? 0)}
            onPageSizeChange={(value) => { setPageSize(value); setPageIndex(0) }}
            onPreviousPage={() => setPageIndex((value) => Math.max(value - 1, 0))}
            onNextPage={() => setPageIndex((value) => value + 1)}
          />
        </Card>
      )}

      <AlertDialog open={Boolean(pendingArea)} onOpenChange={(open) => !open && setPendingArea(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className={pendingArea?.isActive ? "bg-destructive/10 text-destructive" : "bg-accent text-accent-foreground"}>
              {pendingArea?.isActive ? <CircleOff /> : <RotateCcw />}
            </AlertDialogMedia>
            <AlertDialogTitle>{pendingArea?.isActive ? "Desactivar área" : "Reactivar área"}</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingArea?.isActive
                ? `${pendingArea.name} dejará de estar disponible para nuevos registros. El historial conservará su información.`
                : `${pendingArea?.name} volverá a estar disponible para registros nuevos.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction variant={pendingArea?.isActive ? "destructive" : "default"} onClick={handleStatusChange}>
              {pendingArea?.isActive ? "Desactivar" : "Reactivar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center">
      <div className="grid size-14 place-items-center rounded-2xl bg-muted text-muted-foreground"><Building2 className="size-6" /></div>
      <h2 className="mt-4 font-semibold">No encontramos áreas</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">Ajuste la búsqueda o el filtro de estado.</p>
      <Button variant="outline" size="sm" className="mt-4" onClick={onReset}>Limpiar filtros</Button>
    </div>
  )
}
