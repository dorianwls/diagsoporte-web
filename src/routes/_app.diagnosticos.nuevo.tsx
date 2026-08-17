import { createFileRoute } from "@tanstack/react-router"

import { DiagnosisFormPlaceholder } from "@/features/diagnoses/diagnosis-form-placeholder"

export const Route = createFileRoute("/_app/diagnosticos/nuevo")({
  component: () => <DiagnosisFormPlaceholder mode="create" />,
})
