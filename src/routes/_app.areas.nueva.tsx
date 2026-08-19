import { createFileRoute } from "@tanstack/react-router"

import { AreaFormPage } from "@/features/areas/area-form-page"
import { requirePermission } from "@/features/auth/route-permissions"

export const Route = createFileRoute("/_app/areas/nueva")({
  beforeLoad: () => requirePermission("areas:create"),
  component: () => <AreaFormPage />,
})
