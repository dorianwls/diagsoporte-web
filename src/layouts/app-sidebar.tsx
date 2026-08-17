import { Link, useNavigate } from "@tanstack/react-router"
import { LogOut } from "lucide-react"
import { toast } from "sonner"

import { AppLogo } from "@/components/shared/app-logo"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { navigationGroups } from "@/config/navigation"
import { getAuthSession, signOut } from "@/features/auth/auth-service"
import { cn } from "@/lib/utils"

interface AppSidebarProps {
  onNavigate?: () => void
}

export function AppSidebar({ onNavigate }: AppSidebarProps) {
  const navigate = useNavigate()
  const session = getAuthSession()
  const initials = session?.fullName
    .split(" ")
    .slice(0, 2)
    .map((name) => name[0])
    .join("")
    .toUpperCase()

  async function handleSignOut() {
    signOut()
    onNavigate?.()
    toast.success("Sesión cerrada correctamente")
    await navigate({ to: "/login" })
  }

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-20 items-center px-5">
        <AppLogo inverse />
      </div>

      <Separator className="bg-sidebar-border" />

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5" aria-label="Navegación principal">
        {navigationGroups.map((group, groupIndex) => (
          <div key={group.label ?? `main-${groupIndex}`}>
            {group.label && (
              <p className="mb-2 px-3 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-sidebar-foreground/45">
                {group.label}
              </p>
            )}
            <div className="space-y-1">
              {group.items.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  activeOptions={{ exact: item.exact }}
                  onClick={onNavigate}
                  className={cn(
                    "group flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-sidebar-foreground/72 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                  activeProps={{
                    className:
                      "bg-sidebar-accent text-sidebar-accent-foreground shadow-[inset_3px_0_0_var(--sidebar-primary)]",
                  }}
                >
                  <item.icon className="size-[1.05rem] opacity-80 group-hover:opacity-100" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3">
        <div className="rounded-xl border border-sidebar-border bg-white/5 p-3">
          <div className="flex items-center gap-3">
            <Avatar className="size-9 border border-white/10">
              <AvatarFallback className="bg-sidebar-primary font-semibold text-sidebar-primary-foreground">
                {initials ?? "US"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">
                {session?.fullName ?? "Usuario"}
              </p>
              <p className="truncate text-xs text-sidebar-foreground/55">
                {session?.role === "ADMINISTRATOR" ? "Administrador" : "Técnico"}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Cerrar sesión"
              className="text-sidebar-foreground/60 hover:bg-white/10 hover:text-white"
              onClick={handleSignOut}
            >
              <LogOut />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
