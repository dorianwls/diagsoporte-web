import { createFileRoute, redirect } from "@tanstack/react-router"

import { restoreAuthSession } from "@/features/auth/auth-service"
import { AppLayout } from "@/layouts/app-layout"

export const Route = createFileRoute("/_app")({
  beforeLoad: async () => {
    if (!(await restoreAuthSession())) {
      throw redirect({ to: "/login" })
    }
  },
  component: AppLayout,
})
