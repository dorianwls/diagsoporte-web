import { useMemo, useState } from "react"
import { Link } from "@tanstack/react-router"
import { Building2, CircleOff, Plus, RotateCcw, Search, SlidersHorizontal } from "lucide-react"
import { useTable } from "@tanstack/react-table"
import { toast } from "sonner"

import { DataTable } from "@/components/shared/data-table"
import { DataTablePagination } from "@/components/shared/data-table-pagination"
import { PageHeader } from "@/components/shared/page-header"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { areaTableFeatures, createAreaColumns } from "@/features/areas/area-columns"
import { listAreas, setAreaActive } from "@/features/areas/area-repository"
import type { Area } from "@/types/domain"

export function AreasPage() {
  const [areas, setAreas] = useState<Area[]>(() => listAreas())
  const [pendingArea, setPendingArea] = useState<Area | null>(null)
  const columns = useMemo(
    () => createAreaColumns({ onStatusRequest: setPendingArea }),
    [],
  )
  const table = useTable({
    features: areaTableFeatures,
    columns,
    data: areas,
    globalFilterFn: "includesString",
    initialState: {
      pagination: { pageIndex: 0, pageSize: 10 },
      sorting: [{ id: "name", desc: false }],
    },
  })

  const filteredRowCount = table.getFilteredRowModel().rows.length
  const { pageIndex, pageSize } = table.state.pagination
  const firstVisibleRow = filteredRowCount === 0 ? 0 : pageIndex * pageSize + 1
  const lastVisibleRow = Math.min((pageIndex + 1) * pageSize, filteredRowCount)
  const activeAreas = areas.filter((area) => area.isActive).length
  const statusFilter = table.getColumn("isActive")?.getFilterValue()

  async function handleStatusChange() {
    if (!pendingArea) return

    try {
      const updatedArea = await setAreaActive(pendingArea.id, !pendingArea.isActive)
      setAreas((currentAreas) =>
        currentAreas.map((area) => (area.id === updatedArea.id ? updatedArea : area)),
      )
      toast.success(
        updatedArea.isActive
          ? "Área reactivada correctamente"
          : "Área desactivada correctamente",
      )
    } catch {
      toast.error("No fue posible actualizar el estado del área")
    } finally {
      setPendingArea(null)
    }
  }

  function resetFilters() {
    table.resetGlobalFilter(true)
    table.getColumn("isActive")?.setFilterValue(undefined)
  }

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Catálogo institucional"
        title="Áreas universitarias"
        description="Administra las unidades académicas y administrativas utilizadas en empleados, equipos y diagnósticos."
        actions={
          <Button asChild size="lg">
            <Link to="/areas/nueva">
              <Plus data-icon="inline-start" />
              Registrar área
            </Link>
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="h-7 bg-card px-3">
          {areas.length} áreas registradas
        </Badge>
        <Badge variant="outline" className="h-7 bg-card px-3 text-emerald-700">
          {activeAreas} disponibles
        </Badge>
      </div>

      <Card className="gap-0 overflow-hidden py-0 shadow-sm">
        <div className="flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={String(table.state.globalFilter ?? "")}
              onChange={(event) => table.setGlobalFilter(event.target.value)}
              placeholder="Buscar un área..."
              className="h-10 pl-9"
              aria-label="Buscar áreas"
            />
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="hidden size-4 text-muted-foreground sm:block" />
            <Select
              value={statusFilter === undefined ? "all" : statusFilter ? "active" : "inactive"}
              onValueChange={(value) =>
                table
                  .getColumn("isActive")
                  ?.setFilterValue(value === "all" ? undefined : value === "active")
              }
            >
              <SelectTrigger className="h-10 w-full min-w-40 bg-card sm:w-44">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las áreas</SelectItem>
                <SelectItem value="active">Activas</SelectItem>
                <SelectItem value="inactive">Inactivas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <CardContent className="p-0">
          <DataTable
            table={table}
            columnCount={columns.length}
            emptyState={
              <div className="mx-auto flex max-w-sm flex-col items-center">
                <div className="grid size-14 place-items-center rounded-2xl bg-muted text-muted-foreground">
                  <Building2 className="size-6" />
                </div>
                <h2 className="mt-4 font-semibold">No encontramos áreas</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Ajuste la búsqueda o el filtro de estado para ver otros resultados.
                </p>
                <Button variant="outline" size="sm" className="mt-4" onClick={resetFilters}>
                  Limpiar filtros
                </Button>
              </div>
            }
          />
        </CardContent>

        <DataTablePagination
          entityLabel="áreas"
          firstVisibleRow={firstVisibleRow}
          lastVisibleRow={lastVisibleRow}
          rowCount={filteredRowCount}
          pageIndex={pageIndex}
          pageSize={pageSize}
          pageCount={table.getPageCount()}
          pageSizeOptions={[5, 10, 20]}
          canPreviousPage={table.getCanPreviousPage()}
          canNextPage={table.getCanNextPage()}
          onPageSizeChange={(value) => table.setPageSize(value)}
          onPreviousPage={() => table.previousPage()}
          onNextPage={() => table.nextPage()}
        />
      </Card>

      <AlertDialog
        open={Boolean(pendingArea)}
        onOpenChange={(open) => !open && setPendingArea(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia
              className={pendingArea?.isActive ? "bg-destructive/10 text-destructive" : "bg-accent text-accent-foreground"}
            >
              {pendingArea?.isActive ? <CircleOff /> : <RotateCcw />}
            </AlertDialogMedia>
            <AlertDialogTitle>
              {pendingArea?.isActive ? "Desactivar área" : "Reactivar área"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingArea?.isActive
                ? `${pendingArea.name} dejará de estar disponible para nuevos registros. Los diagnósticos históricos conservarán su información.`
                : `${pendingArea?.name} volverá a estar disponible para empleados, equipos y diagnósticos nuevos.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant={pendingArea?.isActive ? "destructive" : "default"}
              onClick={handleStatusChange}
            >
              {pendingArea?.isActive ? "Desactivar" : "Reactivar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
