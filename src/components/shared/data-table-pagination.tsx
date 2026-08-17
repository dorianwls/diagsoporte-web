import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DataTablePaginationProps {
  entityLabel: string
  firstVisibleRow: number
  lastVisibleRow: number
  rowCount: number
  pageIndex: number
  pageSize: number
  pageCount: number
  pageSizeOptions?: number[]
  canPreviousPage: boolean
  canNextPage: boolean
  onPageSizeChange: (pageSize: number) => void
  onPreviousPage: () => void
  onNextPage: () => void
}

export function DataTablePagination({
  entityLabel,
  firstVisibleRow,
  lastVisibleRow,
  rowCount,
  pageIndex,
  pageSize,
  pageCount,
  pageSizeOptions = [10, 20, 50],
  canPreviousPage,
  canNextPage,
  onPageSizeChange,
  onPreviousPage,
  onNextPage,
}: DataTablePaginationProps) {
  return (
    <footer className="flex flex-col gap-3 border-t bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-muted-foreground">
        Mostrando {firstVisibleRow}-{lastVisibleRow} de {rowCount} {entityLabel}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">Filas</span>
        <Select value={String(pageSize)} onValueChange={(value) => onPageSizeChange(Number(value))}>
          <SelectTrigger size="sm" className="w-18 bg-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            {pageSizeOptions.map((option) => (
              <SelectItem key={option} value={String(option)}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="ml-1 text-xs text-muted-foreground">
          Página {pageIndex + 1} de {Math.max(pageCount, 1)}
        </span>
        <Button variant="outline" size="sm" onClick={onPreviousPage} disabled={!canPreviousPage}>
          Anterior
        </Button>
        <Button variant="outline" size="sm" onClick={onNextPage} disabled={!canNextPage}>
          Siguiente
        </Button>
      </div>
    </footer>
  )
}
