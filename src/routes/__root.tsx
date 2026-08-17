import { createRootRoute, Link, Outlet } from "@tanstack/react-router"
import { FileQuestion } from "lucide-react"

import { Button } from "@/components/ui/button"

export const Route = createRootRoute({
  component: () => <Outlet />,
  notFoundComponent: NotFoundPage,
})

function NotFoundPage() {
  return (
    <main className="grid min-h-svh place-items-center p-6">
      <div className="max-w-md text-center">
        <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-primary/8 text-primary">
          <FileQuestion className="size-7" />
        </div>
        <p className="mt-6 text-sm font-semibold text-primary">Error 404</p>
        <h1 className="mt-2 text-2xl font-semibold">No encontramos esta página</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          La dirección puede ser incorrecta o el contenido pudo haberse movido.
        </p>
        <Button asChild className="mt-6">
          <Link to="/dashboard">Volver al dashboard</Link>
        </Button>
      </div>
    </main>
  )
}
