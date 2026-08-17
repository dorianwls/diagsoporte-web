import { createFileRoute } from "@tanstack/react-router"

import { EmployeeFormPage } from "@/features/employees/employee-form-page"

export const Route = createFileRoute("/_app/empleados/nuevo")({
  component: EmployeeFormPage,
})
