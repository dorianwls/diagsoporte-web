import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"

export interface ServerSorting {
  id: string
  direction: "asc" | "desc"
}

export function ServerSortButton({
  label,
  column,
  sorting,
  onChange,
}: {
  label: string
  column: string
  sorting: ServerSorting
  onChange: (sorting: ServerSorting) => void
}) {
  const active = sorting.id === column
  const direction = active ? sorting.direction : undefined

  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-2"
      onClick={() => onChange({ id: column, direction: active && direction === "asc" ? "desc" : "asc" })}
    >
      {label}
      {direction === "asc" ? (
        <ArrowUp data-icon="inline-end" />
      ) : direction === "desc" ? (
        <ArrowDown data-icon="inline-end" />
      ) : (
        <ArrowUpDown className="opacity-45" data-icon="inline-end" />
      )}
    </Button>
  )
}
