import { UserPlus, Users } from "lucide-react"

import { ModulePlaceholder } from "@/components/shared/module-placeholder"

export function EmployeesPage() {
  return (
    <ModulePlaceholder
      title="Empleados"
      description="Consulta a los responsables de equipos y su pertenencia a las áreas universitarias."
      icon={Users}
      nextStep="La lista mostrará número de empleado, nombre, cédula y área, con acceso a sus diagnósticos relacionados."
      primaryAction={{ label: "Registrar empleado", to: "/empleados/nuevo" }}
    />
  )
}

export function EmployeeFormPage() {
  return (
    <ModulePlaceholder
      title="Registrar empleado"
      description="Añade un empleado que podrá figurar como responsable de equipos."
      icon={UserPlus}
      nextStep="Usaremos React Hook Form para el estado, Zod para reglas comprensibles y un selector de área conectado mediante FormField."
    />
  )
}
