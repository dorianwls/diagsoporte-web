import { Link } from "@tanstack/react-router"
import { ArrowDown, ArrowUp, ArrowUpDown, Eye, MoreHorizontal, Pencil, Printer } from "lucide-react"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDateTime } from "@/lib/formatters"
import type { TechnicalDiagnosis } from "@/types/domain"

export interface DiagnosisTableRow extends TechnicalDiagnosis {
  equipmentSearch: string
  responsibleName: string
  areaName: string
  supportTypeLabel: string
  technicianName: string
}

export const diagnosisTableFeatures = tableFeatures({
  columnFilteringFeature,
  globalFilteringFeature,
  rowSortingFeature,
  rowPaginationFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  filterFns: { equals: filterFn_equals, includesString: filterFn_includesString },
  sortFns: { datetime: sortFn_datetime, text: sortFn_text },
})

export const diagnosisColumns: ColumnDef<typeof diagnosisTableFeatures, DiagnosisTableRow>[] = [
  {
    accessorKey: "code",
    header: ({ column }) => renderSortButton("Código", column.getIsSorted(), () => column.toggleSorting(column.getIsSorted() === "asc")),
    cell: ({ row }) => <Link to="/diagnosticos/$diagnosisId" params={{ diagnosisId: row.original.id }} className="font-mono text-xs font-semibold text-primary underline-offset-4 hover:underline">{row.original.code}</Link>,
    sortFn: "text",
  },
  {
    accessorKey: "startedAt",
    header: ({ column }) => renderSortButton("Fecha", column.getIsSorted(), () => column.toggleSorting(column.getIsSorted() === "asc")),
    cell: ({ row }) => <span className="text-muted-foreground">{formatDateTime(row.original.startedAt)}</span>,
    sortFn: "datetime",
    enableGlobalFilter: false,
  },
  {
    accessorKey: "equipmentSearch",
    header: "Equipo",
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.original.snapshot.equipment.brand} {row.original.snapshot.equipment.model}</p>
        <p className="mt-0.5 font-mono text-[0.68rem] text-muted-foreground">{row.original.snapshot.equipment.uniCode} · {row.original.snapshot.equipment.serialNumber}</p>
      </div>
    ),
    filterFn: "includesString",
    sortFn: "text",
  },
  {
    accessorKey: "responsibleName",
    header: "Responsable",
    sortFn: "text",
  },
  {
    accessorKey: "areaName",
    header: "Área",
    filterFn: "includesString",
    sortFn: "text",
  },
  {
    accessorKey: "supportTypeLabel",
    header: "Tipo de soporte",
    cell: ({ row }) => <Badge variant="outline" className="font-normal">{row.original.supportTypeLabel}</Badge>,
    filterFn: "includesString",
    sortFn: "text",
  },
  {
    accessorKey: "technicianName",
    header: "Técnico",
    filterFn: "equals",
    sortFn: "text",
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Acciones</span>,
    cell: ({ row }) => (
      <div className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm" aria-label={`Acciones para ${row.original.code}`}><MoreHorizontal /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuItem asChild><Link to="/diagnosticos/$diagnosisId" params={{ diagnosisId: row.original.id }}><Eye />Ver diagnóstico</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link to="/diagnosticos/$diagnosisId/editar" params={{ diagnosisId: row.original.id }}><Pencil />Editar</Link></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild><Link to="/diagnosticos/$diagnosisId/imprimir" params={{ diagnosisId: row.original.id }}><Printer />Imprimir o exportar</Link></DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
    enableGlobalFilter: false,
    enableSorting: false,
  },
]

function renderSortButton(label: string, direction: false | "asc" | "desc", onClick: () => void) {
  return <Button variant="ghost" size="sm" className="-ml-2" onClick={onClick}>{label}{direction === "asc" ? <ArrowUp data-icon="inline-end" /> : direction === "desc" ? <ArrowDown data-icon="inline-end" /> : <ArrowUpDown className="opacity-45" data-icon="inline-end" />}</Button>
}
