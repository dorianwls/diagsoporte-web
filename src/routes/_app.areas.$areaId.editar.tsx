import { createFileRoute } from "@tanstack/react-router"

import { AreaFormPage } from "@/features/areas/area-form-page"
import { requirePermission } from "@/features/auth/route-permissions"

export const Route = createFileRoute("/_app/areas/$areaId/editar")({
  beforeLoad: () => requirePermission("areas:update"),
  component: EditAreaRoute,
})

function EditAreaRoute() {
  const { areaId } = Route.useParams()

  return <AreaFormPage areaId={areaId} />
}
