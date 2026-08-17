import { createFileRoute } from "@tanstack/react-router"

import { DiagnosisFormPage } from "@/features/diagnoses/diagnosis-form-page"

export const Route = createFileRoute("/_app/diagnosticos/$diagnosisId/editar")({
  component: EditDiagnosisRoute,
})

function EditDiagnosisRoute() {
  const { diagnosisId } = Route.useParams()
  return <DiagnosisFormPage diagnosisId={diagnosisId} />
}
