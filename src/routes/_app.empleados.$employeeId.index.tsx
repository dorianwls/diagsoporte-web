import { createFileRoute } from "@tanstack/react-router"

import { EmployeeDetailPage } from "@/features/employees/employee-detail-page"

export const Route = createFileRoute("/_app/empleados/$employeeId/")({
  component: EmployeeDetailRoute,
})

function EmployeeDetailRoute() {
  const { employeeId } = Route.useParams()
  return <EmployeeDetailPage employeeId={employeeId} />
}
