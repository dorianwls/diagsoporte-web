import { createFileRoute } from "@tanstack/react-router"

import { UsersPage } from "@/features/users/users-page"
import { requirePermission } from "@/features/auth/route-permissions"

export const Route = createFileRoute("/_app/administracion/usuarios")({
  beforeLoad: () => requirePermission("users:read"),
  component: UsersPage,
})
