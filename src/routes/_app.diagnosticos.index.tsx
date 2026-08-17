import { createFileRoute } from "@tanstack/react-router"

import { DiagnosesPage } from "@/features/diagnoses/diagnoses-page"

export const Route = createFileRoute("/_app/diagnosticos/")({
  component: DiagnosesPage,
})
