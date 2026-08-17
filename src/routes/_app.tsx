import { createFileRoute, redirect } from "@tanstack/react-router"

import { getAuthSession } from "@/features/auth/auth-service"
import { AppLayout } from "@/layouts/app-layout"

export const Route = createFileRoute("/_app")({
  beforeLoad: () => {
    if (!getAuthSession()) {
      throw redirect({ to: "/login" })
    }
  },
  component: AppLayout,
})
