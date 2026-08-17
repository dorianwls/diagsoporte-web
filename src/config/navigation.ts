import type { LucideIcon } from "lucide-react"
import {
  Building2,
  ClipboardList,
  LayoutDashboard,
  Laptop,
  Plus,
  Users,
  UserRoundCog,
} from "lucide-react"

export interface NavigationItem {
  label: string
  to: string
  icon: LucideIcon
  exact?: boolean
}

export interface NavigationGroup {
  label?: string
  items: NavigationItem[]
}

export const navigationGroups: NavigationGroup[] = [
  {
    items: [
      {
        label: "Dashboard",
        to: "/dashboard",
        icon: LayoutDashboard,
        exact: true,
      },
    ],
  },
  {
    label: "Diagnósticos",
    items: [
      {
        label: "Todos los diagnósticos",
        to: "/diagnosticos",
        icon: ClipboardList,
        exact: true,
      },
      {
        label: "Nuevo diagnóstico",
        to: "/diagnosticos/nuevo",
        icon: Plus,
        exact: true,
      },
    ],
  },
  {
    label: "Inventario institucional",
    items: [
      { label: "Equipos", to: "/equipos", icon: Laptop },
      { label: "Empleados", to: "/empleados", icon: Users },
      { label: "Áreas", to: "/areas", icon: Building2 },
    ],
  },
  {
    label: "Administración",
    items: [
      {
        label: "Usuarios",
        to: "/administracion/usuarios",
        icon: UserRoundCog,
      },
    ],
  },
]

export function getPageTitle(pathname: string) {
  if (pathname.startsWith("/diagnosticos/nuevo")) return "Nuevo diagnóstico"
  if (pathname === "/areas/nueva") return "Registrar área"
  if (/^\/areas\/[^/]+\/editar$/.test(pathname)) return "Editar área"
  if (pathname === "/empleados/nuevo") return "Registrar empleado"
  if (/^\/empleados\/[^/]+\/editar$/.test(pathname)) return "Editar empleado"
  if (/^\/empleados\/[^/]+$/.test(pathname)) return "Ficha del empleado"
  if (pathname === "/equipos/nuevo") return "Registrar equipo"
  if (/^\/equipos\/[^/]+\/editar$/.test(pathname)) return "Editar equipo"
  if (pathname.includes("/imprimir")) return "Vista de impresión"
  if (pathname.includes("/editar")) return "Editar registro"
  if (/^\/diagnosticos\/[^/]+$/.test(pathname)) return "Detalle del diagnóstico"
  if (/^\/equipos\/[^/]+$/.test(pathname)) return "Historial del equipo"

  return (
    navigationGroups
      .flatMap((group) => group.items)
      .find((item) => pathname === item.to)?.label ?? "Diagnósticos UNI"
  )
}
