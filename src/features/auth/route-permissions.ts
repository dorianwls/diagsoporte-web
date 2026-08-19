import { redirect } from "@tanstack/react-router"

import { hasPermission } from "@/features/auth/auth-service"

export function requirePermission(permission: string) {
  if (!hasPermission(permission)) {
    throw redirect({ to: "/dashboard" })
  }
}
