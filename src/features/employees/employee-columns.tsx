import { Link } from "@tanstack/react-router"
import { ArrowDown, ArrowUp, ArrowUpDown, CircleOff, Eye, MoreHorizontal, Pencil, RotateCcw } from "lucide-react"
import {
  columnFilteringFeature,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_equals,
  filterFn_includesString,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSortingFeature,
  sortFn_text,
  tableFeatures,
  type ColumnDef,
} from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Employee } from "@/types/domain"

export interface EmployeeTableRow extends Employee {
  areaName: string
}

export const employeeTableFeatures = tableFeatures({
  columnFilteringFeature,
  globalFilteringFeature,
  rowSortingFeature,
  rowPaginationFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  filterFns: { equals: filterFn_equals, includesString: filterFn_includesString },
  sortFns: { text: sortFn_text },
})

interface EmployeeColumnsOptions {
  onStatusRequest: (employee: Employee) => void
}

export function createEmployeeColumns({
  onStatusRequest,
}: EmployeeColumnsOptions): ColumnDef<typeof employeeTableFeatures, EmployeeTableRow>[] {
  return [
    {
      accessorKey: "employeeNumber",
      header: ({ column }) => (
        renderSortButton("N.º empleado", column.getIsSorted(), () => column.toggleSorting(column.getIsSorted() === "asc"))
      ),
      cell: ({ row }) => <span className="font-mono text-xs font-semibold">{row.original.employeeNumber}</span>,
      sortFn: "text",
    },
    {
      accessorKey: "fullName",
      header: ({ column }) => (
        renderSortButton("Empleado", column.getIsSorted(), () => column.toggleSorting(column.getIsSorted() === "asc"))
      ),
      cell: ({ row }) => (
        <Link
          to="/empleados/$employeeId"
          params={{ employeeId: row.original.id }}
          className="font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
        >
          {row.original.fullName}
        </Link>
      ),
      sortFn: "text",
    },
    {
      accessorKey: "nationalId",
      header: "Cédula",
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.nationalId}</span>,
      sortFn: "text",
    },
    {
      accessorKey: "areaName",
      header: ({ column }) => (
        renderSortButton("Área", column.getIsSorted(), () => column.toggleSorting(column.getIsSorted() === "asc"))
      ),
      filterFn: "equals",
      sortFn: "text",
    },
    {
      accessorKey: "isActive",
      header: "Estado",
      cell: ({ row }) =>
        row.original.isActive ? (
          <Badge variant="secondary" className="bg-emerald-50 text-emerald-700">
            <span className="size-1.5 rounded-full bg-emerald-500" /> Activo
          </Badge>
        ) : (
          <Badge variant="outline" className="text-muted-foreground">
            <span className="size-1.5 rounded-full bg-slate-400" /> Inactivo
          </Badge>
        ),
      filterFn: "equals",
      enableGlobalFilter: false,
      enableSorting: false,
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Acciones</span>,
      cell: ({ row }) => {
        const employee = row.original
        return (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label={`Acciones para ${employee.fullName}`}><MoreHorizontal /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link to="/empleados/$employeeId" params={{ employeeId: employee.id }}><Eye />Ver ficha</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/empleados/$employeeId/editar" params={{ employeeId: employee.id }}><Pencil />Editar empleado</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant={employee.isActive ? "destructive" : "default"} onSelect={() => onStatusRequest(employee)}>
                  {employee.isActive ? <CircleOff /> : <RotateCcw />}
                  {employee.isActive ? "Desactivar" : "Reactivar"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
      enableGlobalFilter: false,
      enableSorting: false,
    },
  ]
}

function renderSortButton(label: string, direction: false | "asc" | "desc", onClick: () => void) {
  return (
    <Button variant="ghost" size="sm" className="-ml-2" onClick={onClick}>
      {label}
      {direction === "asc" ? <ArrowUp data-icon="inline-end" /> : direction === "desc" ? <ArrowDown data-icon="inline-end" /> : <ArrowUpDown className="opacity-45" data-icon="inline-end" />}
    </Button>
  )
}
