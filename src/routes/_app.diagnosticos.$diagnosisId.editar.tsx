import { createFileRoute } from "@tanstack/react-router"

import { DiagnosisFormPage } from "@/features/diagnoses/diagnosis-form-page"
import { requirePermission } from "@/features/auth/route-permissions"

export const Route = createFileRoute("/_app/diagnosticos/$diagnosisId/editar")({
  beforeLoad: () => requirePermission("diagnoses:update"),
  component: EditDiagnosisRoute,
})

function EditDiagnosisRoute() {
  const { diagnosisId } = Route.useParams()
  return <DiagnosisFormPage diagnosisId={diagnosisId} />
}
