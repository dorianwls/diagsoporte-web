import { Link } from "@tanstack/react-router"
import {
  CircleOff,
  MoreHorizontal,
  Pencil,
  RotateCcw,
} from "lucide-react"
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
  sortFn_datetime,
  sortFn_text,
  tableFeatures,
  type ColumnDef,
} from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ServerSortButton, type ServerSorting } from "@/components/shared/server-sort-button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatShortDate } from "@/lib/formatters"
import type { Area } from "@/types/domain"

export const areaTableFeatures = tableFeatures({
  columnFilteringFeature,
  globalFilteringFeature,
  rowSortingFeature,
  rowPaginationFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  filterFns: {
    equals: filterFn_equals,
    includesString: filterFn_includesString,
  },
  sortFns: {
    datetime: sortFn_datetime,
    text: sortFn_text,
  },
})

interface AreaColumnsOptions {
  onStatusRequest: (area: Area) => void
  sorting: ServerSorting
  onSortingChange: (sorting: ServerSorting) => void
  canManage: boolean
}

export function createAreaColumns({
  onStatusRequest,
  sorting,
  onSortingChange,
  canManage,
}: AreaColumnsOptions): ColumnDef<typeof areaTableFeatures, Area>[] {
  return [
    {
      accessorKey: "name",
      header: () => <ServerSortButton label="Área" column="name" sorting={sorting} onChange={onSortingChange} />,
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-foreground">{row.original.name}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {row.original.employeeCount} empleados · {row.original.equipmentCount} equipos
          </p>
        </div>
      ),
      sortFn: "text",
    },
    {
      accessorKey: "isActive",
      header: "Estado",
      cell: ({ row }) =>
        row.original.isActive ? (
          <Badge variant="secondary" className="bg-emerald-50 text-emerald-700">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Activa
          </Badge>
        ) : (
          <Badge variant="outline" className="text-muted-foreground">
            <span className="size-1.5 rounded-full bg-slate-400" />
            Inactiva
          </Badge>
        ),
      filterFn: "equals",
      enableGlobalFilter: false,
      enableSorting: false,
    },
    {
      accessorKey: "updatedAt",
      header: () => <ServerSortButton label="Última actualización" column="updatedAt" sorting={sorting} onChange={onSortingChange} />,
      cell: ({ row }) => (
        <span className="text-muted-foreground">{formatShortDate(row.original.updatedAt)}</span>
      ),
      sortFn: "datetime",
      enableGlobalFilter: false,
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Acciones</span>,
      cell: ({ row }) => {
        const area = row.original

        if (!canManage) return null

        return (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label={`Acciones para ${area.name}`}>
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link to="/areas/$areaId/editar" params={{ areaId: area.id }}>
                    <Pencil />
                    Editar área
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant={area.isActive ? "destructive" : "default"}
                  onSelect={() => onStatusRequest(area)}
                >
                  {area.isActive ? <CircleOff /> : <RotateCcw />}
                  {area.isActive ? "Desactivar" : "Reactivar"}
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
