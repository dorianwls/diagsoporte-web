import { createFileRoute } from "@tanstack/react-router"

import { PrintDiagnosisPage } from "@/features/diagnoses/print-diagnosis-page"
import { requirePermission } from "@/features/auth/route-permissions"

export const Route = createFileRoute("/_app/diagnosticos/$diagnosisId/imprimir")({
  beforeLoad: () => requirePermission("diagnoses:export"),
  component: PrintDiagnosisRoute,
})

function PrintDiagnosisRoute() {
  const { diagnosisId } = Route.useParams()

  return <PrintDiagnosisPage diagnosisId={diagnosisId} />
}
