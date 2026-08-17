import { Building2, Plus } from "lucide-react"

import { ModulePlaceholder } from "@/components/shared/module-placeholder"

export function AreasPage() {
  return (
    <ModulePlaceholder
      title="Áreas universitarias"
      description="Administra las unidades académicas y administrativas relacionadas con empleados, equipos y diagnósticos."
      icon={Building2}
      nextStep="Mantendremos este catálogo deliberadamente simple: nombre, disponibilidad y relaciones visibles, sin abstracciones innecesarias."
      primaryAction={{ label: "Registrar área", to: "/areas/nueva" }}
    />
  )
}

export function AreaFormPage() {
  return (
    <ModulePlaceholder
      title="Registrar área"
      description="Crea una nueva unidad administrativa o académica."
      icon={Plus}
      nextStep="Será un formulario pequeño que nos permitirá introducir la integración básica entre Zod, useForm, FormField y mensajes de validación."
    />
  )
}
