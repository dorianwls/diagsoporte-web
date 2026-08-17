import { createFileRoute } from "@tanstack/react-router"

import { EquipmentListPage } from "@/features/equipment/equipment-list-page"

export const Route = createFileRoute("/_app/equipos/")({
  component: EquipmentListPage,
})
