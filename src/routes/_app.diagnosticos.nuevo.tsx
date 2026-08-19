import { createFileRoute } from "@tanstack/react-router"

import { DiagnosisFormPage } from "@/features/diagnoses/diagnosis-form-page"
import { requirePermission } from "@/features/auth/route-permissions"

export const Route = createFileRoute("/_app/diagnosticos/nuevo")({
  beforeLoad: () => requirePermission("diagnoses:create"),
  component: DiagnosisFormPage,
})
