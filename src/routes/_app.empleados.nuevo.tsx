import { createFileRoute } from "@tanstack/react-router"

import { EmployeeFormPage } from "@/features/employees/employee-form-page"
import { requirePermission } from "@/features/auth/route-permissions"

export const Route = createFileRoute("/_app/empleados/nuevo")({
  beforeLoad: () => requirePermission("employees:create"),
  component: EmployeeFormPage,
})
