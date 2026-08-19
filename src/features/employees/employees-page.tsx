import { useMemo, useState } from "react"
import { Link } from "@tanstack/react-router"
import { CircleOff, Plus, RotateCcw, Search, Users } from "lucide-react"
import { useTable } from "@tanstack/react-table"
import { toast } from "sonner"

import { PageErrorState } from "@/components/shared/async-state"
import { DataTable } from "@/components/shared/data-table"
import { DataTablePagination } from "@/components/shared/data-table-pagination"
import { PageHeader } from "@/components/shared/page-header"
import type { ServerSorting } from "@/components/shared/server-sort-button"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { listAllAreas } from "@/features/areas/area-repository"
import { hasPermission } from "@/features/auth/auth-service"
import { createEmployeeColumns, employeeTableFeatures } from "@/features/employees/employee-columns"
import { listEmployees, setEmployeeActive } from "@/features/employees/employee-repository"
import { useApiQuery } from "@/hooks/use-api-query"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { getErrorMessage } from "@/lib/api-client"
import type { Employee } from "@/types/domain"

export function EmployeesPage() {
  const [search, setSearch] = useState("")
  const [areaId, setAreaId] = useState("all")
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all")
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [sorting, setSorting] = useState<ServerSorting>({ id: "fullName", direction: "asc" })
  const [pendingEmployee, setPendingEmployee] = useState<Employee | null>(null)
  const debouncedSearch = useDebouncedValue(search)
  const canCreate = hasPermission("employees:create")
  const canManage = hasPermission("employees:update")
  const filters = { debouncedSearch, areaId, status, pageIndex, pageSize, sorting }
  const query = useApiQuery(`employees:${JSON.stringify(filters)}`, async (signal) => {
    const [result, areas] = await Promise.all([
      listEmployees({
        search: debouncedSearch,
        areaId: areaId === "all" ? undefined : areaId,
        isActive: status === "all" ? undefined : status === "active",
        sortBy: sorting.id as "fullName" | "employeeNumber" | "areaName",
        sortDirection: sorting.direction,
        page: pageIndex + 1,
        pageSize,
      }, signal),
      listAllAreas(true, signal),
    ])
    return { result, areas }
  })
  const result = query.data?.result
  const columns = useMemo(
    () => createEmployeeColumns({
      onStatusRequest: setPendingEmployee,
      sorting,
      onSortingChange: (value) => { setSorting(value); setPageIndex(0) },
      canManage,
    }),
    [canManage, sorting],
  )
  const table = useTable({
    features: employeeTableFeatures,
    columns,
    data: result?.items ?? [],
    manualPagination: true,
    rowCount: result?.totalItems ?? 0,
  })

  async function handleStatusChange() {
    if (!pendingEmployee) return
    try {
      const updated = await setEmployeeActive(pendingEmployee.id, !pendingEmployee.isActive)
      toast.success(updated.isActive ? "Empleado reactivado correctamente" : "Empleado desactivado correctamente")
      query.reload()
    } catch (error) {
      toast.error(getErrorMessage(error, "No fue posible actualizar el estado del empleado"))
    } finally {
      setPendingEmployee(null)
    }
  }

  function clearFilters() {
    setSearch("")
    setAreaId("all")
    setStatus("all")
    setPageIndex(0)
  }

  const totalItems = result?.totalItems ?? 0

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Directorio institucional"
        title="Empleados"
        description="Consulta y administra a los responsables de equipos vinculados con las áreas universitarias."
        actions={canCreate ? <Button asChild size="lg"><Link to="/empleados/nuevo"><Plus data-icon="inline-start" />Registrar empleado</Link></Button> : undefined}
      />

      <Badge variant="outline" className="h-7 bg-card px-3">{totalItems} empleados encontrados</Badge>

      {query.error ? <PageErrorState error={query.error} onRetry={query.reload} /> : (
        <Card className="gap-0 overflow-hidden py-0 shadow-sm">
          <div className="grid gap-3 border-b p-4 lg:grid-cols-[minmax(18rem,1fr)_13rem_12rem]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(event) => { setSearch(event.target.value); setPageIndex(0) }} placeholder="Buscar por nombre, número o cédula..." className="h-10 pl-9" />
            </div>
            <Select value={areaId} onValueChange={(value) => { setAreaId(value); setPageIndex(0) }}>
              <SelectTrigger className="h-10 bg-card"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="all">Todas las áreas</SelectItem>{query.data?.areas.map((area) => <SelectItem key={area.id} value={area.id}>{area.name}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={status} onValueChange={(value) => { setStatus(value as typeof status); setPageIndex(0) }}>
              <SelectTrigger className="h-10 bg-card"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="all">Todos los estados</SelectItem><SelectItem value="active">Activos</SelectItem><SelectItem value="inactive">Inactivos</SelectItem></SelectContent>
            </Select>
          </div>
          <CardContent className="p-0"><DataTable table={table} columnCount={columns.length} isLoading={query.isLoading} emptyState={<EmployeeEmptyState onReset={clearFilters} />} /></CardContent>
          <DataTablePagination
            entityLabel="empleados"
            firstVisibleRow={totalItems === 0 ? 0 : pageIndex * pageSize + 1}
            lastVisibleRow={Math.min((pageIndex + 1) * pageSize, totalItems)}
            rowCount={totalItems}
            pageIndex={pageIndex}
            pageSize={pageSize}
            pageCount={result?.totalPages ?? 0}
            pageSizeOptions={[10, 20, 50, 100]}
            canPreviousPage={pageIndex > 0}
            canNextPage={pageIndex + 1 < (result?.totalPages ?? 0)}
            onPageSizeChange={(value) => { setPageSize(value); setPageIndex(0) }}
            onPreviousPage={() => setPageIndex((value) => Math.max(0, value - 1))}
            onNextPage={() => setPageIndex((value) => value + 1)}
          />
        </Card>
      )}

      <AlertDialog open={Boolean(pendingEmployee)} onOpenChange={(open) => !open && setPendingEmployee(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className={pendingEmployee?.isActive ? "bg-destructive/10 text-destructive" : "bg-accent text-accent-foreground"}>{pendingEmployee?.isActive ? <CircleOff /> : <RotateCcw />}</AlertDialogMedia>
            <AlertDialogTitle>{pendingEmployee?.isActive ? "Desactivar empleado" : "Reactivar empleado"}</AlertDialogTitle>
            <AlertDialogDescription>{pendingEmployee?.isActive ? `${pendingEmployee.fullName} dejará de estar disponible para registros nuevos.` : `${pendingEmployee?.fullName} volverá a estar disponible.`}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction variant={pendingEmployee?.isActive ? "destructive" : "default"} onClick={handleStatusChange}>{pendingEmployee?.isActive ? "Desactivar" : "Reactivar"}</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function EmployeeEmptyState({ onReset }: { onReset: () => void }) {
  return <div className="mx-auto flex max-w-sm flex-col items-center"><div className="grid size-14 place-items-center rounded-2xl bg-muted text-muted-foreground"><Users className="size-6" /></div><h2 className="mt-4 font-semibold">No encontramos empleados</h2><p className="mt-2 text-sm text-muted-foreground">Pruebe con otros filtros de búsqueda.</p><Button variant="outline" size="sm" className="mt-4" onClick={onReset}>Limpiar filtros</Button></div>
}
