import { Link } from "@tanstack/react-router"
import { ArrowLeft, Building2, ClipboardList, IdCard, Laptop, Pencil, UserRound } from "lucide-react"

import { PageHeader } from "@/components/shared/page-header"
import { PageErrorState, PageLoadingState } from "@/components/shared/async-state"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { hasPermission } from "@/features/auth/auth-service"
import { findEmployeeById } from "@/features/employees/employee-repository"
import { useApiQuery } from "@/hooks/use-api-query"
import { formatShortDate } from "@/lib/formatters"

interface EmployeeDetailPageProps {
  employeeId: string
}

export function EmployeeDetailPage({ employeeId }: EmployeeDetailPageProps) {
  const query = useApiQuery(`employee:${employeeId}`, (signal) => findEmployeeById(employeeId, signal))
  const employee = query.data

  if (query.isLoading) return <PageLoadingState label="Cargando ficha del empleado..." />
  if (query.error) return <PageErrorState error={query.error} onRetry={query.reload} />
  if (!employee) return <EmployeeNotFound />

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Ficha del empleado"
        title={employee.fullName}
        description={`Número de empleado ${employee.employeeNumber}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline"><Link to="/empleados"><ArrowLeft data-icon="inline-start" />Volver</Link></Button>
            {hasPermission("employees:update") && <Button asChild><Link to="/empleados/$employeeId/editar" params={{ employeeId }}><Pencil data-icon="inline-start" />Editar</Link></Button>}
          </div>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <Card className="gap-0 py-0 shadow-sm">
          <CardHeader className="border-b px-5 py-4 sm:px-6">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="flex items-center gap-2"><UserRound className="size-4.5 text-primary" />Datos institucionales</CardTitle>
              {employee.isActive ? (
                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700">Activo</Badge>
              ) : (
                <Badge variant="outline">Inactivo</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-5 sm:p-6">
            <dl className="grid gap-6 sm:grid-cols-2">
              <DetailItem icon={IdCard} label="Número de empleado" value={employee.employeeNumber} />
              <DetailItem icon={IdCard} label="Cédula" value={employee.nationalId} />
              <DetailItem icon={Building2} label="Área" value={employee.areaName} />
              <DetailItem icon={UserRound} label="Nombre completo" value={employee.fullName} />
            </dl>
            <Separator className="my-6" />
            <p className="text-xs text-muted-foreground">Última actualización: {formatShortDate(employee.updatedAt)}</p>
          </CardContent>
        </Card>

        <Card className="gap-3 bg-primary/[0.035] shadow-none">
          <CardHeader><CardTitle className="text-sm">Uso en el sistema</CardTitle></CardHeader>
          <CardContent className="text-sm leading-6 text-muted-foreground">
            Esta ficha reunirá los equipos bajo responsabilidad del empleado y sus diagnósticos relacionados.
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <RelatedCard icon={Laptop} title="Equipos asignados" description={`${employee.equipmentCount} equipos están actualmente bajo responsabilidad de este empleado.`} />
        <RelatedCard icon={ClipboardList} title="Diagnósticos relacionados" description="El historial permitirá consultar intervenciones donde este empleado figure como responsable." />
      </div>
    </div>
  )
}

interface DetailItemProps {
  icon: typeof IdCard
  label: string
  value: string
}

function DetailItem({ icon: Icon, label, value }: DetailItemProps) {
  return (
    <div className="flex gap-3">
      <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/8 text-primary"><Icon className="size-4" /></div>
      <div><dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt><dd className="mt-1 font-medium">{value}</dd></div>
    </div>
  )
}

interface RelatedCardProps {
  icon: typeof Laptop
  title: string
  description: string
}

function RelatedCard({ icon: Icon, title, description }: RelatedCardProps) {
  return (
    <Card className="shadow-sm">
      <CardContent className="flex min-h-44 flex-col items-center justify-center px-6 text-center">
        <div className="grid size-12 place-items-center rounded-2xl bg-muted text-muted-foreground"><Icon className="size-5" /></div>
        <h2 className="mt-4 font-semibold">{title}</h2>
        <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

function EmployeeNotFound() {
  return (
    <Card className="mx-auto max-w-xl py-10 text-center shadow-sm">
      <CardContent>
        <UserRound className="mx-auto size-8 text-muted-foreground" />
        <h1 className="mt-5 text-xl font-semibold">Empleado no encontrado</h1>
        <p className="mt-2 text-sm text-muted-foreground">El registro solicitado no existe.</p>
        <Button asChild className="mt-6"><Link to="/empleados">Volver a los empleados</Link></Button>
      </CardContent>
    </Card>
  )
}
