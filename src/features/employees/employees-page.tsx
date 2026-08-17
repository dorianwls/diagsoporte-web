import { useMemo, useState } from "react"
import { Link } from "@tanstack/react-router"
import { CircleOff, Plus, RotateCcw, Search, SlidersHorizontal, Users } from "lucide-react"
import { useTable } from "@tanstack/react-table"
import { toast } from "sonner"

import { DataTable } from "@/components/shared/data-table"
import { DataTablePagination } from "@/components/shared/data-table-pagination"
import { PageHeader } from "@/components/shared/page-header"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { listAreas } from "@/features/areas/area-repository"
import { createEmployeeColumns, employeeTableFeatures, type EmployeeTableRow } from "@/features/employees/employee-columns"
import { listEmployees, setEmployeeActive } from "@/features/employees/employee-repository"
import type { Employee } from "@/types/domain"

export function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>(() => listEmployees())
  const [pendingEmployee, setPendingEmployee] = useState<Employee | null>(null)
  const areas = useMemo(() => listAreas(), [])
  const areaNames = useMemo(() => new Map(areas.map((area) => [area.id, area.name])), [areas])
  const rows = useMemo<EmployeeTableRow[]>(
    () => employees.map((employee) => ({
      ...employee,
      areaName: areaNames.get(employee.areaId) ?? "Área no disponible",
    })),
    [areaNames, employees],
  )
  const columns = useMemo(() => createEmployeeColumns({ onStatusRequest: setPendingEmployee }), [])
  const table = useTable({
    features: employeeTableFeatures,
    columns,
    data: rows,
    globalFilterFn: "includesString",
    initialState: {
      pagination: { pageIndex: 0, pageSize: 10 },
      sorting: [{ id: "fullName", desc: false }],
    },
  })

  const filteredRowCount = table.getFilteredRowModel().rows.length
  const { pageIndex, pageSize } = table.state.pagination
  const firstVisibleRow = filteredRowCount === 0 ? 0 : pageIndex * pageSize + 1
  const lastVisibleRow = Math.min((pageIndex + 1) * pageSize, filteredRowCount)
  const activeEmployees = employees.filter((employee) => employee.isActive).length
  const statusFilter = table.getColumn("isActive")?.getFilterValue()
  const areaFilter = String(table.getColumn("areaName")?.getFilterValue() ?? "all")

  async function handleStatusChange() {
    if (!pendingEmployee) return

    try {
      const updatedEmployee = await setEmployeeActive(pendingEmployee.id, !pendingEmployee.isActive)
      setEmployees((current) => current.map((employee) => employee.id === updatedEmployee.id ? updatedEmployee : employee))
      toast.success(updatedEmployee.isActive ? "Empleado reactivado correctamente" : "Empleado desactivado correctamente")
    } catch {
      toast.error("No fue posible actualizar el estado del empleado")
    } finally {
      setPendingEmployee(null)
    }
  }

  function resetFilters() {
    table.resetGlobalFilter(true)
    table.getColumn("areaName")?.setFilterValue(undefined)
    table.getColumn("isActive")?.setFilterValue(undefined)
  }

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Directorio institucional"
        title="Empleados"
        description="Consulta a los responsables de equipos y su pertenencia a las áreas universitarias."
        actions={
          <Button asChild size="lg">
            <Link to="/empleados/nuevo"><Plus data-icon="inline-start" />Registrar empleado</Link>
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="h-7 bg-card px-3">{employees.length} empleados registrados</Badge>
        <Badge variant="outline" className="h-7 bg-card px-3 text-emerald-700">{activeEmployees} activos</Badge>
      </div>

      <Card className="gap-0 overflow-hidden py-0 shadow-sm">
        <div className="flex flex-col gap-3 border-b p-4 xl:flex-row xl:items-center">
          <div className="relative min-w-64 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={String(table.state.globalFilter ?? "")}
              onChange={(event) => table.setGlobalFilter(event.target.value)}
              placeholder="Buscar por nombre, número, cédula o área..."
              className="h-10 pl-9"
              aria-label="Buscar empleados"
            />
          </div>
          <div className="grid gap-2 sm:grid-cols-2 xl:flex">
            <SlidersHorizontal className="hidden size-4 self-center text-muted-foreground xl:block" />
            <Select value={areaFilter} onValueChange={(value) => table.getColumn("areaName")?.setFilterValue(value === "all" ? undefined : value)}>
              <SelectTrigger className="h-10 w-full bg-card xl:w-52"><SelectValue placeholder="Todas las áreas" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las áreas</SelectItem>
                {areas.map((area) => <SelectItem key={area.id} value={area.name}>{area.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select
              value={statusFilter === undefined ? "all" : statusFilter ? "active" : "inactive"}
              onValueChange={(value) => table.getColumn("isActive")?.setFilterValue(value === "all" ? undefined : value === "active")}
            >
              <SelectTrigger className="h-10 w-full bg-card xl:w-40"><SelectValue placeholder="Estado" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="inactive">Inactivos</SelectItem>
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
                <div className="grid size-14 place-items-center rounded-2xl bg-muted text-muted-foreground"><Users className="size-6" /></div>
                <h2 className="mt-4 font-semibold">No encontramos empleados</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">Ajuste la búsqueda o los filtros para ver otros resultados.</p>
                <Button variant="outline" size="sm" className="mt-4" onClick={resetFilters}>Limpiar filtros</Button>
              </div>
            }
          />
        </CardContent>

        <DataTablePagination
          entityLabel="empleados"
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

      <AlertDialog open={Boolean(pendingEmployee)} onOpenChange={(open) => !open && setPendingEmployee(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className={pendingEmployee?.isActive ? "bg-destructive/10 text-destructive" : "bg-accent text-accent-foreground"}>
              {pendingEmployee?.isActive ? <CircleOff /> : <RotateCcw />}
            </AlertDialogMedia>
            <AlertDialogTitle>{pendingEmployee?.isActive ? "Desactivar empleado" : "Reactivar empleado"}</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingEmployee?.isActive
                ? `${pendingEmployee.fullName} dejará de estar disponible para nuevas asignaciones. Su historial permanecerá intacto.`
                : `${pendingEmployee?.fullName} volverá a estar disponible para nuevas asignaciones.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction variant={pendingEmployee?.isActive ? "destructive" : "default"} onClick={handleStatusChange}>
              {pendingEmployee?.isActive ? "Desactivar" : "Reactivar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
