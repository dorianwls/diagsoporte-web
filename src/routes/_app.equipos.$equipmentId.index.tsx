import { createFileRoute } from "@tanstack/react-router"

import { EquipmentDetailPage } from "@/features/equipment/equipment-detail-page"

export const Route = createFileRoute("/_app/equipos/$equipmentId/")({
  component: EquipmentDetailRoute,
})

function EquipmentDetailRoute() {
  const { equipmentId } = Route.useParams()
  return <EquipmentDetailPage equipmentId={equipmentId} />
}
