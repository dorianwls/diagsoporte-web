import { createFileRoute } from "@tanstack/react-router"

import { EmployeeFormPage } from "@/features/employees/employee-form-page"

export const Route = createFileRoute("/_app/empleados/$employeeId/editar")({
  component: EditEmployeeRoute,
})

function EditEmployeeRoute() {
  const { employeeId } = Route.useParams()
  return <EmployeeFormPage employeeId={employeeId} />
}
