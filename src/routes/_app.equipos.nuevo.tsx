import { createFileRoute } from "@tanstack/react-router"

import { EquipmentFormPage } from "@/features/equipment/equipment-form-page"
import { requirePermission } from "@/features/auth/route-permissions"

export const Route = createFileRoute("/_app/equipos/nuevo")({
  beforeLoad: () => requirePermission("equipment:create"),
  component: EquipmentFormPage,
})
