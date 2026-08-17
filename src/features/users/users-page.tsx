import { UserRoundCog } from "lucide-react"

import { ModulePlaceholder } from "@/components/shared/module-placeholder"

export function UsersPage() {
  return (
    <ModulePlaceholder
      title="Usuarios del sistema"
      description="Gestiona las cuentas autorizadas y sus roles de Administrador o Técnico."
      icon={UserRoundCog}
      nextStep="Las cuentas se vincularán con empleados existentes. Los permisos de interfaz complementarán, pero no sustituirán, la autorización del backend."
    />
  )
}
