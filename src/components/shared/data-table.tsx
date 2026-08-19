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
  isLoading?: boolean
}

export function DataTable<TFeatures extends TableFeatures, TData extends RowData>({
  table,
  columnCount,
  emptyState,
  isLoading = false,
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
        {isLoading ? (
          Array.from({ length: 6 }, (_, rowIndex) => (
            <TableRow key={`loading-${rowIndex}`} className="hover:bg-transparent">
              {Array.from({ length: columnCount }, (_, cellIndex) => (
                <TableCell key={`loading-${rowIndex}-${cellIndex}`} className="px-4 py-4">
                  <div className="h-4 animate-pulse rounded bg-muted" />
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : rows.length > 0 ? (
          rows.map((row) => (
            <TableRow key={row.id}>
              {row.getAllCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className={cell.column.id === "actions" ? "px-4" : "whitespace-normal px-4 py-3.5"}
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
