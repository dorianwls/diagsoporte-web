import { createFileRoute } from "@tanstack/react-router"

import { AreaFormPage } from "@/features/areas/area-form-page"

export const Route = createFileRoute("/_app/areas/nueva")({
  component: () => <AreaFormPage />,
})
