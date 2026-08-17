import { Link } from "@tanstack/react-router"
import { Columns3, Filter, Plus, Search } from "lucide-react"

import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export function DiagnosesPage() {
  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Repositorio histórico"
        title="Diagnósticos técnicos"
        description="Busca, filtra y consulta las intervenciones realizadas sobre los equipos de la universidad."
        actions={
          <Button asChild size="lg">
            <Link to="/diagnosticos/nuevo">
              <Plus data-icon="inline-start" />
              Nuevo diagnóstico
            </Link>
          </Button>
        }
      />

      <Card className="gap-0 py-0 shadow-sm">
        <div className="flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por Código UNI, serie, equipo, responsable..."
              className="h-10 pl-9"
              aria-label="Buscar diagnósticos"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="lg" className="flex-1 lg:flex-none">
              <Filter data-icon="inline-start" />
              Filtros
            </Button>
            <Button variant="outline" size="lg" className="flex-1 lg:flex-none">
              <Columns3 data-icon="inline-start" />
              Columnas
            </Button>
          </div>
        </div>
        <CardContent className="flex min-h-80 flex-col items-center justify-center p-8 text-center">
          <div className="grid size-14 place-items-center rounded-2xl bg-secondary text-primary">
            <Search className="size-6" />
          </div>
          <h2 className="mt-5 text-lg font-semibold">Tabla preparada para el siguiente incremento</h2>
          <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
            Aquí conectaremos TanStack Table con búsqueda global, filtros, ordenamiento,
            paginación y visibilidad de columnas usando registros tipados.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
