import { createFileRoute } from "@tanstack/react-router"

import { AreaFormPage } from "@/features/areas/area-form-page"

export const Route = createFileRoute("/_app/areas/$areaId/editar")({
  component: EditAreaRoute,
})

function EditAreaRoute() {
  const { areaId } = Route.useParams()

  return <AreaFormPage areaId={areaId} />
}
