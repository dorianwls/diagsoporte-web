import { createFileRoute } from "@tanstack/react-router"

import { DiagnosisDetailPage } from "@/features/diagnoses/diagnosis-detail-page"

export const Route = createFileRoute("/_app/diagnosticos/$diagnosisId/")({
  component: DiagnosisDetailRoute,
})

function DiagnosisDetailRoute() {
  const { diagnosisId } = Route.useParams()

  return <DiagnosisDetailPage diagnosisId={diagnosisId} />
}
