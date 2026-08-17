import { useMemo, useState } from "react"
import { Link } from "@tanstack/react-router"
import { CircleOff, Laptop, Plus, RotateCcw, Search, SlidersHorizontal } from "lucide-react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { equipmentTypes } from "@/config/catalogs"
import { listAreas } from "@/features/areas/area-repository"
import { listDiagnoses } from "@/features/diagnoses/diagnosis-repository"
import {
  createEquipmentColumns,
  equipmentTableFeatures,
  type EquipmentTableRow,
} from "@/features/equipment/equipment-columns"
import { listEquipment, setEquipmentActive } from "@/features/equipment/equipment-repository"
import { listEmployees } from "@/features/employees/employee-repository"
import type { Equipment } from "@/types/domain"

export function EquipmentListPage() {
  const [equipmentList, setEquipmentList] = useState<Equipment[]>(() => listEquipment())
  const [pendingEquipment, setPendingEquipment] = useState<Equipment | null>(null)
  const areas = useMemo(() => listAreas(), [])
  const employees = useMemo(() => listEmployees(), [])
  const diagnosisCounts = useMemo(() => {
    const counts = new Map<string, number>()
    listDiagnoses().forEach((diagnosis) => {
      counts.set(diagnosis.equipmentId, (counts.get(diagnosis.equipmentId) ?? 0) + 1)
    })
    return counts
  }, [])
  const areaNames = useMemo(() => new Map(areas.map((area) => [area.id, area.name])), [areas])
  const employeeNames = useMemo(() => new Map(employees.map((employee) => [employee.id, employee.fullName])), [employees])
  const typeLabels = useMemo(() => new Map(equipmentTypes.map((type) => [type.value, type.label])), [])
  const rows = useMemo<EquipmentTableRow[]>(
    () => equipmentList.map((equipment) => ({
      ...equipment,
      typeLabel: typeLabels.get(equipment.type) ?? equipment.type,
      responsibleName: equipment.currentResponsibleEmployeeId ? employeeNames.get(equipment.currentResponsibleEmployeeId) ?? "Responsable no disponible" : "Sin asignar",
      areaName: equipment.currentAreaId ? areaNames.get(equipment.currentAreaId) ?? "Área no disponible" : "Sin asignar",
      diagnosisCount: diagnosisCounts.get(equipment.id) ?? 0,
    })),
    [areaNames, diagnosisCounts, employeeNames, equipmentList, typeLabels],
  )
  const columns = useMemo(() => createEquipmentColumns({ onStatusRequest: setPendingEquipment }), [])
  const table = useTable({
    features: equipmentTableFeatures,
    columns,
    data: rows,
    globalFilterFn: "includesString",
    initialState: {
      pagination: { pageIndex: 0, pageSize: 10 },
      sorting: [{ id: "uniCode", desc: false }],
    },
  })

  const filteredRowCount = table.getFilteredRowModel().rows.length
  const { pageIndex, pageSize } = table.state.pagination
  const firstVisibleRow = filteredRowCount === 0 ? 0 : pageIndex * pageSize + 1
  const lastVisibleRow = Math.min((pageIndex + 1) * pageSize, filteredRowCount)
  const activeEquipment = equipmentList.filter((equipment) => equipment.isActive).length
  const typeFilter = String(table.getColumn("typeLabel")?.getFilterValue() ?? "all")
  const areaFilter = String(table.getColumn("areaName")?.getFilterValue() ?? "all")
  const statusFilter = table.getColumn("isActive")?.getFilterValue()

  async function handleStatusChange() {
    if (!pendingEquipment) return

    try {
      const updatedEquipment = await setEquipmentActive(pendingEquipment.id, !pendingEquipment.isActive)
      setEquipmentList((current) => current.map((equipment) => equipment.id === updatedEquipment.id ? updatedEquipment : equipment))
      toast.success(updatedEquipment.isActive ? "Equipo reactivado correctamente" : "Equipo desactivado correctamente")
    } catch {
      toast.error("No fue posible actualizar el estado del equipo")
    } finally {
      setPendingEquipment(null)
    }
  }

  function resetFilters() {
    table.resetGlobalFilter(true)
    table.getColumn("typeLabel")?.setFilterValue(undefined)
    table.getColumn("areaName")?.setFilterValue(undefined)
    table.getColumn("isActive")?.setFilterValue(undefined)
  }

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Inventario institucional"
        title="Equipos tecnológicos"
        description="Identifica cada equipo por su Código UNI y consulta su ficha e historial técnico."
        actions={<Button asChild size="lg"><Link to="/equipos/nuevo"><Plus data-icon="inline-start" />Registrar equipo</Link></Button>}
      />

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="h-7 bg-card px-3">{equipmentList.length} equipos registrados</Badge>
        <Badge variant="outline" className="h-7 bg-card px-3 text-emerald-700">{activeEquipment} activos</Badge>
      </div>

      <Card className="gap-0 overflow-hidden py-0 shadow-sm">
        <div className="flex flex-col gap-3 border-b p-4 2xl:flex-row 2xl:items-center">
          <div className="relative min-w-64 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={String(table.state.globalFilter ?? "")}
              onChange={(event) => table.setGlobalFilter(event.target.value)}
              placeholder="Buscar por Código UNI, serie, marca, modelo o responsable..."
              className="h-10 pl-9"
              aria-label="Buscar equipos"
            />
          </div>
          <div className="grid gap-2 sm:grid-cols-3 2xl:flex">
            <SlidersHorizontal className="hidden size-4 self-center text-muted-foreground 2xl:block" />
            <Select value={typeFilter} onValueChange={(value) => table.getColumn("typeLabel")?.setFilterValue(value === "all" ? undefined : value)}>
              <SelectTrigger className="h-10 w-full bg-card 2xl:w-48"><SelectValue placeholder="Tipo de equipo" /></SelectTrigger>
              <SelectContent><SelectItem value="all">Todos los tipos</SelectItem>{equipmentTypes.map((type) => <SelectItem key={type.value} value={type.label}>{type.label}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={areaFilter} onValueChange={(value) => table.getColumn("areaName")?.setFilterValue(value === "all" ? undefined : value)}>
              <SelectTrigger className="h-10 w-full bg-card 2xl:w-48"><SelectValue placeholder="Área" /></SelectTrigger>
              <SelectContent><SelectItem value="all">Todas las áreas</SelectItem>{areas.map((area) => <SelectItem key={area.id} value={area.name}>{area.name}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={statusFilter === undefined ? "all" : statusFilter ? "active" : "inactive"} onValueChange={(value) => table.getColumn("isActive")?.setFilterValue(value === "all" ? undefined : value === "active")}>
              <SelectTrigger className="h-10 w-full bg-card 2xl:w-36"><SelectValue placeholder="Estado" /></SelectTrigger>
              <SelectContent><SelectItem value="all">Todos</SelectItem><SelectItem value="active">Activos</SelectItem><SelectItem value="inactive">Inactivos</SelectItem></SelectContent>
            </Select>
          </div>
        </div>

        <CardContent className="p-0">
          <DataTable
            table={table}
            columnCount={columns.length}
            emptyState={
              <div className="mx-auto flex max-w-sm flex-col items-center">
                <div className="grid size-14 place-items-center rounded-2xl bg-muted text-muted-foreground"><Laptop className="size-6" /></div>
                <h2 className="mt-4 font-semibold">No encontramos equipos</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">Ajuste la búsqueda o los filtros para consultar otros equipos.</p>
                <Button variant="outline" size="sm" className="mt-4" onClick={resetFilters}>Limpiar filtros</Button>
              </div>
            }
          />
        </CardContent>

        <DataTablePagination
          entityLabel="equipos"
          firstVisibleRow={firstVisibleRow}
          lastVisibleRow={lastVisibleRow}
          rowCount={filteredRowCount}
          pageIndex={pageIndex}
          pageSize={pageSize}
          pageCount={table.getPageCount()}
          canPreviousPage={table.getCanPreviousPage()}
          canNextPage={table.getCanNextPage()}
          onPageSizeChange={(value) => table.setPageSize(value)}
          onPreviousPage={() => table.previousPage()}
          onNextPage={() => table.nextPage()}
        />
      </Card>

      <AlertDialog open={Boolean(pendingEquipment)} onOpenChange={(open) => !open && setPendingEquipment(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className={pendingEquipment?.isActive ? "bg-destructive/10 text-destructive" : "bg-accent text-accent-foreground"}>{pendingEquipment?.isActive ? <CircleOff /> : <RotateCcw />}</AlertDialogMedia>
            <AlertDialogTitle>{pendingEquipment?.isActive ? "Desactivar equipo" : "Reactivar equipo"}</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingEquipment?.isActive
                ? `${pendingEquipment.uniCode} dejará de estar disponible para nuevos diagnósticos. Su historial técnico permanecerá intacto.`
                : `${pendingEquipment?.uniCode} volverá a estar disponible para nuevos diagnósticos.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction variant={pendingEquipment?.isActive ? "destructive" : "default"} onClick={handleStatusChange}>{pendingEquipment?.isActive ? "Desactivar" : "Reactivar"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
