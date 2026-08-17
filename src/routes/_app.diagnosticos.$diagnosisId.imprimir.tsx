import { createFileRoute } from "@tanstack/react-router"

import { PrintDiagnosisPage } from "@/features/diagnoses/print-diagnosis-page"

export const Route = createFileRoute("/_app/diagnosticos/$diagnosisId/imprimir")({
  component: PrintDiagnosisRoute,
})

function PrintDiagnosisRoute() {
  const { diagnosisId } = Route.useParams()

  return <PrintDiagnosisPage diagnosisId={diagnosisId} />
}
