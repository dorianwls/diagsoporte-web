import { createFileRoute } from "@tanstack/react-router"

import { EmployeeFormPage } from "@/features/employees/employee-form-page"
import { requirePermission } from "@/features/auth/route-permissions"

export const Route = createFileRoute("/_app/empleados/$employeeId/editar")({
  beforeLoad: () => requirePermission("employees:update"),
  component: EditEmployeeRoute,
})

function EditEmployeeRoute() {
  const { employeeId } = Route.useParams()
  return <EmployeeFormPage employeeId={employeeId} />
}
