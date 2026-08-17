import { createFileRoute } from "@tanstack/react-router"

import { EquipmentFormPage } from "@/features/equipment/equipment-form-page"

export const Route = createFileRoute("/_app/equipos/$equipmentId/editar")({
  component: EditEquipmentRoute,
})

function EditEquipmentRoute() {
  const { equipmentId } = Route.useParams()
  return <EquipmentFormPage equipmentId={equipmentId} />
}
