import { createFileRoute } from "@tanstack/react-router"

import { EquipmentHistoryPage } from "@/features/equipment/equipment-pages"

export const Route = createFileRoute("/_app/equipos/$equipmentId/")({
  component: EquipmentHistoryPage,
})
