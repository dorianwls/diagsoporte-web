import { ClipboardPenLine } from "lucide-react"

import { ModulePlaceholder } from "@/components/shared/module-placeholder"

interface DiagnosisFormPlaceholderProps {
  mode: "create" | "edit"
}

export function DiagnosisFormPlaceholder({ mode }: DiagnosisFormPlaceholderProps) {
  const isCreate = mode === "create"

  return (
    <ModulePlaceholder
      title={isCreate ? "Nuevo Diagnóstico Técnico" : "Editar Diagnóstico Técnico"}
      description={
        isCreate
          ? "Documenta una intervención técnica realizada sobre un equipo institucional."
          : "Actualiza la información documentada de esta intervención técnica."
      }
      icon={ClipboardPenLine}
      nextStep="Este será el primer formulario grande del sistema. Lo construiremos por tres secciones usando Zod, React Hook Form, zodResolver y componentes Form de shadcn/ui."
    />
  )
}
