import { Link } from "@tanstack/react-router"
import {
  CircleOff,
  History,
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
  sortFn_basic,
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
import type { Equipment } from "@/types/domain"

export interface EquipmentTableRow extends Equipment {
  typeLabel: string
}

export const equipmentTableFeatures = tableFeatures({
  columnFilteringFeature,
  globalFilteringFeature,
  rowSortingFeature,
  rowPaginationFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  filterFns: { equals: filterFn_equals, includesString: filterFn_includesString },
  sortFns: { basic: sortFn_basic, text: sortFn_text },
})

interface EquipmentColumnsOptions {
  onStatusRequest: (equipment: Equipment) => void
  sorting: ServerSorting
  onSortingChange: (sorting: ServerSorting) => void
  canManage: boolean
}

export function createEquipmentColumns({
  onStatusRequest,
  sorting,
  onSortingChange,
  canManage,
}: EquipmentColumnsOptions): ColumnDef<typeof equipmentTableFeatures, EquipmentTableRow>[] {
  return [
    {
      accessorKey: "uniCode",
      header: () => <ServerSortButton label="Código UNI" column="uniCode" sorting={sorting} onChange={onSortingChange} />,
      cell: ({ row }) => (
        <Link
          to="/equipos/$equipmentId"
          params={{ equipmentId: row.original.id }}
          className="font-mono text-xs font-semibold text-primary underline-offset-4 hover:underline"
        >
          {row.original.uniCode}
        </Link>
      ),
      sortFn: "text",
    },
    {
      accessorKey: "typeLabel",
      header: () => <ServerSortButton label="Equipo" column="brand" sorting={sorting} onChange={onSortingChange} />,
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-foreground">{row.original.brand} {row.original.model}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{row.original.typeLabel}</p>
        </div>
      ),
      filterFn: "equals",
      sortFn: "text",
    },
    {
      accessorKey: "serialNumber",
      header: "Número de serie",
      cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.serialNumber}</span>,
      sortFn: "text",
    },
    {
      accessorKey: "currentResponsibleName",
      header: "Responsable",
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.currentResponsibleName ?? "Sin asignar"}</span>,
      sortFn: "text",
    },
    {
      accessorKey: "currentAreaName",
      header: "Área",
      filterFn: "equals",
      sortFn: "text",
    },
    {
      accessorKey: "diagnosisCount",
      header: "Diagnósticos",
      cell: ({ row }) => (
        <Link
          to="/equipos/$equipmentId"
          params={{ equipmentId: row.original.id }}
          className="inline-flex min-w-8 justify-center rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground"
          aria-label={`Ver historial técnico de ${row.original.uniCode}`}
        >
          {row.original.diagnosisCount}
        </Link>
      ),
      enableGlobalFilter: false,
      sortFn: "basic",
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
        const equipment = row.original
        if (!canManage) return null

        return (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label={`Acciones para ${equipment.uniCode}`}>
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link to="/equipos/$equipmentId" params={{ equipmentId: equipment.id }}><History />Ver historial</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/equipos/$equipmentId/editar" params={{ equipmentId: equipment.id }}><Pencil />Editar equipo</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant={equipment.isActive ? "destructive" : "default"} onSelect={() => onStatusRequest(equipment)}>
                  {equipment.isActive ? <CircleOff /> : <RotateCcw />}
                  {equipment.isActive ? "Desactivar" : "Reactivar"}
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
