import { useState } from "react"
import { Outlet, useRouterState } from "@tanstack/react-router"
import { Bell, Menu, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { getPageTitle } from "@/config/navigation"
import { AppSidebar } from "@/layouts/app-sidebar"

export function AppLayout() {
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false)
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const pageTitle = getPageTitle(pathname)

  return (
    <div className="app-shell min-h-svh lg:grid lg:grid-cols-[17.5rem_minmax(0,1fr)]">
      <aside className="app-chrome fixed inset-y-0 left-0 z-40 hidden w-70 lg:block">
        <AppSidebar />
      </aside>

      <div className="app-content min-w-0 lg:col-start-2">
        <header className="app-chrome sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/92 px-4 backdrop-blur-xl sm:px-6 lg:h-18 lg:px-8">
          <Sheet open={mobileNavigationOpen} onOpenChange={setMobileNavigationOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden" aria-label="Abrir navegación">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[18rem] border-0 bg-sidebar p-0" showCloseButton={false}>
              <SheetHeader className="sr-only">
                <SheetTitle>Navegación principal</SheetTitle>
                <SheetDescription>Secciones del sistema de diagnósticos técnicos</SheetDescription>
              </SheetHeader>
              <AppSidebar onNavigate={() => setMobileNavigationOpen(false)} />
            </SheetContent>
          </Sheet>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground sm:text-base">{pageTitle}</p>
            <p className="hidden text-xs text-muted-foreground sm:block">
              Sistema de registro e inventario técnico
            </p>
          </div>

          <div className="relative hidden w-full max-w-xs xl:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label="Buscar en el repositorio"
              placeholder="Buscar en el repositorio..."
              className="h-9 bg-card pl-9 shadow-none"
            />
          </div>

          <Button variant="outline" size="icon" aria-label="Notificaciones" className="relative bg-card">
            <Bell />
            <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-primary" />
          </Button>
        </header>

        <main className="app-main mx-auto w-full max-w-[96rem] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
