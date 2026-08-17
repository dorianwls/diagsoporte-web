import { createFileRoute } from "@tanstack/react-router"

import { AreasPage } from "@/features/areas/areas-page"

export const Route = createFileRoute("/_app/areas/")({
  component: AreasPage,
})
