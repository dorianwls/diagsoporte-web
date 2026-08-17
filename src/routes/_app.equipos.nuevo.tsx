import { createFileRoute } from "@tanstack/react-router"

import { EquipmentFormPage } from "@/features/equipment/equipment-pages"

export const Route = createFileRoute("/_app/equipos/nuevo")({
  component: EquipmentFormPage,
})
