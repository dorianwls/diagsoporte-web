import type { ReactNode } from "react"
import type { ReactTable } from "@tanstack/react-table"
import type { RowData, TableFeatures } from "@tanstack/table-core"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface DataTableProps<TFeatures extends TableFeatures, TData extends RowData> {
  table: ReactTable<TFeatures, TData>
  columnCount: number
  emptyState: ReactNode
}

export function DataTable<TFeatures extends TableFeatures, TData extends RowData>({
  table,
  columnCount,
  emptyState,
}: DataTableProps<TFeatures, TData>) {
  const rows = table.getRowModel().rows

  return (
    <Table>
      <TableHeader className="bg-muted/40">
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id} className="hover:bg-transparent">
            {headerGroup.headers.map((header) => (
              <TableHead
                key={header.id}
                colSpan={header.colSpan}
                className={header.column.id === "actions" ? "w-16 text-right" : "px-4"}
              >
                {header.isPlaceholder ? null : <table.FlexRender header={header} />}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {rows.length > 0 ? (
          rows.map((row) => (
            <TableRow key={row.id}>
              {row.getAllCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className={cell.column.id === "actions" ? "px-4" : "px-4 py-3.5"}
                >
                  <table.FlexRender cell={cell} />
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={columnCount} className="h-72 text-center">
              {emptyState}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
