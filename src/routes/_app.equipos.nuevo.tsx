import { createFileRoute } from "@tanstack/react-router"

import { EquipmentFormPage } from "@/features/equipment/equipment-form-page"

export const Route = createFileRoute("/_app/equipos/nuevo")({
  component: EquipmentFormPage,
})
