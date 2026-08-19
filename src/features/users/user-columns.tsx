import { CircleOff, MoreHorizontal, Pencil, RotateCcw } from "lucide-react"
import {
  createPaginatedRowModel,
  rowPaginationFeature,
  tableFeatures,
  type ColumnDef,
} from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatShortDate } from "@/lib/formatters"
import type { User } from "@/types/domain"

export const userTableFeatures = tableFeatures({
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
})

export function createUserColumns({
  onEdit,
  onStatusRequest,
}: {
  onEdit: (user: User) => void
  onStatusRequest: (user: User) => void
}): ColumnDef<typeof userTableFeatures, User>[] {
  return [
    {
      accessorKey: "fullName",
      header: "Empleado",
      cell: ({ row }) => <div><p className="font-medium">{row.original.fullName}</p><p className="mt-0.5 font-mono text-xs text-muted-foreground">{row.original.employeeNumber}</p></div>,
    },
    { accessorKey: "userName", header: "Usuario", cell: ({ row }) => <span className="font-mono text-xs">{row.original.userName}</span> },
    { accessorKey: "email", header: "Correo" },
    {
      accessorKey: "role",
      header: "Rol",
      cell: ({ row }) => <Badge variant="secondary">{row.original.role === "ADMINISTRATOR" ? "Administrador" : "Técnico"}</Badge>,
    },
    {
      accessorKey: "isActive",
      header: "Estado",
      cell: ({ row }) => row.original.isActive
        ? <Badge variant="secondary" className="bg-emerald-50 text-emerald-700">Activo</Badge>
        : <Badge variant="outline">Inactivo</Badge>,
    },
    { accessorKey: "createdAt", header: "Creado", cell: ({ row }) => <span className="text-muted-foreground">{formatShortDate(row.original.createdAt)}</span> },
    {
      id: "actions",
      header: () => <span className="sr-only">Acciones</span>,
      cell: ({ row }) => <div className="text-right"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm"><MoreHorizontal /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuLabel>Acciones</DropdownMenuLabel><DropdownMenuItem onSelect={() => onEdit(row.original)}><Pencil />Editar cuenta</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem variant={row.original.isActive ? "destructive" : "default"} onSelect={() => onStatusRequest(row.original)}>{row.original.isActive ? <CircleOff /> : <RotateCcw />}{row.original.isActive ? "Desactivar" : "Reactivar"}</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div>,
    },
  ]
}
