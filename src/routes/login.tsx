import { createFileRoute, redirect } from "@tanstack/react-router"

import { getAuthSession } from "@/features/auth/auth-service"
import { LoginPage } from "@/features/auth/login-page"

export const Route = createFileRoute("/login")({
  beforeLoad: () => {
    if (getAuthSession()) {
      throw redirect({ to: "/dashboard" })
    }
  },
  component: LoginPage,
})
