import { createFileRoute } from "@tanstack/react-router"

import { DiagnosisFormPage } from "@/features/diagnoses/diagnosis-form-page"

export const Route = createFileRoute("/_app/diagnosticos/nuevo")({
  component: DiagnosisFormPage,
})
