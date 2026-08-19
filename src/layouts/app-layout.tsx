import { useEffect, useState } from "react"
import { Outlet, useNavigate, useRouterState } from "@tanstack/react-router"
import { Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { getPageTitle } from "@/config/navigation"
import { clearAuthSession } from "@/features/auth/auth-service"
import { AppSidebar } from "@/layouts/app-sidebar"

export function AppLayout() {
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false)
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const pageTitle = getPageTitle(pathname)

  useEffect(() => {
    const handleUnauthorized = () => {
      clearAuthSession()
      void navigate({ to: "/login", replace: true })
    }

    window.addEventListener("diagsoporte:unauthorized", handleUnauthorized)
    return () => window.removeEventListener("diagsoporte:unauthorized", handleUnauthorized)
  }, [navigate])

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

        </header>

        <main className="app-main mx-auto w-full max-w-[96rem] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
