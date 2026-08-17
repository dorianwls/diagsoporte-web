import { createFileRoute } from "@tanstack/react-router"

import { DiagnosisFormPlaceholder } from "@/features/diagnoses/diagnosis-form-placeholder"

export const Route = createFileRoute("/_app/diagnosticos/$diagnosisId/editar")({
  component: () => <DiagnosisFormPlaceholder mode="edit" />,
})
