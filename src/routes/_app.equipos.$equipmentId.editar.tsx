import { createFileRoute } from "@tanstack/react-router"

import { EquipmentFormPage } from "@/features/equipment/equipment-form-page"
import { requirePermission } from "@/features/auth/route-permissions"

export const Route = createFileRoute("/_app/equipos/$equipmentId/editar")({
  beforeLoad: () => requirePermission("equipment:update"),
  component: EditEquipmentRoute,
})

function EditEquipmentRoute() {
  const { equipmentId } = Route.useParams()
  return <EquipmentFormPage equipmentId={equipmentId} />
}
