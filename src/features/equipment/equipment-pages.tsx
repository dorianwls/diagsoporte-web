import { History, Laptop, Plus } from "lucide-react"

import { ModulePlaceholder } from "@/components/shared/module-placeholder"

export function EquipmentListPage() {
  return (
    <ModulePlaceholder
      title="Inventario de equipos"
      description="Administra los equipos tecnológicos identificados por su Código UNI y número de serie."
      icon={Laptop}
      nextStep="Incorporaremos un inventario tipado con TanStack Table, búsqueda por identificación y acceso directo al historial técnico de cada equipo."
      primaryAction={{ label: "Registrar equipo", to: "/equipos/nuevo" }}
    />
  )
}

export function EquipmentHistoryPage() {
  return (
    <ModulePlaceholder
      title="Historial técnico del equipo"
      description="Consulta la ficha del equipo y todas las intervenciones documentadas a lo largo del tiempo."
      icon={History}
      nextStep="Esta pantalla combinará la identificación actual del equipo con una cronología de diagnósticos enlazada a sus documentos imprimibles."
    />
  )
}

export function EquipmentFormPage() {
  return (
    <ModulePlaceholder
      title="Registrar equipo"
      description="Añade un equipo tecnológico al inventario institucional."
      icon={Plus}
      nextStep="El formulario utilizará un schema Zod como fuente de validación y de tipos, integrado con React Hook Form y los controles de shadcn/ui."
    />
  )
}
