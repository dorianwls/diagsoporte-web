import { createFileRoute, redirect } from "@tanstack/react-router"

import { restoreAuthSession } from "@/features/auth/auth-service"
import { LoginPage } from "@/features/auth/login-page"

export const Route = createFileRoute("/login")({
  beforeLoad: async () => {
    if (await restoreAuthSession()) {
      throw redirect({ to: "/dashboard" })
    }
  },
  component: LoginPage,
})
