import { createFileRoute } from "@tanstack/react-router"

import { EmployeesPage } from "@/features/employees/employees-page"

export const Route = createFileRoute("/_app/empleados/")({
  component: EmployeesPage,
})
