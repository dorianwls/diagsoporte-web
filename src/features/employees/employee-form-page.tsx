import { useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useNavigate } from "@tanstack/react-router"
import { ArrowLeft, IdCard, Info, LoaderCircle, Save, UserRound } from "lucide-react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"

import { PageHeader } from "@/components/shared/page-header"
import { PageErrorState, PageLoadingState } from "@/components/shared/async-state"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { listAllAreas } from "@/features/areas/area-repository"
import {
  createEmployee,
  findEmployeeById,
  updateEmployee,
} from "@/features/employees/employee-repository"
import { employeeFormSchema, type EmployeeFormValues } from "@/features/employees/employee-schema"
import { useApiQuery } from "@/hooks/use-api-query"
import { ApiError, getErrorMessage } from "@/lib/api-client"

interface EmployeeFormPageProps {
  employeeId?: string
}

export function EmployeeFormPage({ employeeId }: EmployeeFormPageProps) {
  const navigate = useNavigate()
  const isEditing = Boolean(employeeId)
  const query = useApiQuery(`employee-form:${employeeId ?? "new"}`, async (signal) => {
    const [employee, allAreas] = await Promise.all([
      employeeId ? findEmployeeById(employeeId, signal) : Promise.resolve(null),
      listAllAreas(undefined, signal),
    ])
    return { employee, areas: allAreas.filter((area) => area.isActive || area.id === employee?.areaId) }
  })
  const employee = query.data?.employee
  const areas = query.data?.areas ?? []
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      employeeNumber: "",
      fullName: "",
      nationalId: "",
      areaId: "",
      isActive: true,
    },
    mode: "onTouched",
  })

  useEffect(() => {
    if (employee) {
      form.reset({
        employeeNumber: employee.employeeNumber,
        fullName: employee.fullName,
        nationalId: employee.nationalId,
        areaId: employee.areaId,
        isActive: employee.isActive,
      })
    }
  }, [employee, form])

  if (query.isLoading) return <PageLoadingState label="Cargando datos del empleado..." />
  if (query.error) return <PageErrorState error={query.error} onRetry={query.reload} />

  async function onSubmit(values: EmployeeFormValues) {
    try {
      if (employeeId) {
        await updateEmployee(employeeId, values)
        toast.success("Empleado actualizado correctamente")
      } else {
        await createEmployee(values)
        toast.success("Empleado registrado correctamente")
      }
      await navigate({ to: "/empleados" })
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        const field = error.message.toLocaleLowerCase("es").includes("cédula")
          ? "nationalId"
          : "employeeNumber"
        form.setError(field, { message: error.message }, { shouldFocus: true })
        return
      }
      form.setError("root", { message: getErrorMessage(error, "No fue posible guardar el empleado. Intente nuevamente.") })
    }
  }

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Directorio institucional"
        title={isEditing ? "Editar empleado" : "Registrar empleado"}
        description={isEditing ? "Actualiza los datos institucionales y la disponibilidad del empleado." : "Añade un empleado que podrá figurar como responsable de equipos y diagnósticos."}
        actions={form.formState.isDirty ? <Badge variant="secondary">Cambios sin guardar</Badge> : undefined}
      />

      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
          <Card className="gap-0 py-0 shadow-sm">
            <CardHeader className="border-b px-5 py-4 sm:px-6">
              <CardTitle className="flex items-center gap-2"><UserRound className="size-4.5 text-primary" />Información del empleado</CardTitle>
            </CardHeader>
            <CardContent className="p-5 sm:p-6">
              <FieldGroup>
                <div className="grid gap-6 md:grid-cols-2">
                  <Field data-invalid={Boolean(form.formState.errors.employeeNumber)}>
                    <FieldLabel htmlFor="employeeNumber">Número de empleado</FieldLabel>
                    <Input
                      {...form.register("employeeNumber", { onChange: () => form.clearErrors("root") })}
                      id="employeeNumber"
                      autoFocus
                      placeholder="Ej. 000184"
                      className="h-10"
                      aria-invalid={Boolean(form.formState.errors.employeeNumber)}
                    />
                    <FieldDescription>Identificador interno asignado por la universidad.</FieldDescription>
                    {form.formState.errors.employeeNumber && <FieldError errors={[form.formState.errors.employeeNumber]} />}
                  </Field>

                  <Field data-invalid={Boolean(form.formState.errors.nationalId)}>
                    <FieldLabel htmlFor="nationalId">Cédula</FieldLabel>
                    <Input
                      {...form.register("nationalId", { onChange: () => form.clearErrors("root") })}
                      id="nationalId"
                      placeholder="Ej. 001-120485-0012A"
                      className="h-10"
                      aria-invalid={Boolean(form.formState.errors.nationalId)}
                    />
                    {form.formState.errors.nationalId && <FieldError errors={[form.formState.errors.nationalId]} />}
                  </Field>
                </div>

                <Field data-invalid={Boolean(form.formState.errors.fullName)}>
                  <FieldLabel htmlFor="fullName">Nombre completo</FieldLabel>
                  <Input
                    {...form.register("fullName", { onChange: () => form.clearErrors("root") })}
                    id="fullName"
                    placeholder="Ej. Juan Carlos Pérez López"
                    className="h-10"
                    aria-invalid={Boolean(form.formState.errors.fullName)}
                  />
                  {form.formState.errors.fullName && <FieldError errors={[form.formState.errors.fullName]} />}
                </Field>

                <Controller
                  name="areaId"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Área</FieldLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id={field.name} className="h-10 w-full" aria-invalid={fieldState.invalid}>
                          <SelectValue placeholder="Seleccione un área" />
                        </SelectTrigger>
                        <SelectContent>
                          {areas.map((area) => (
                            <SelectItem key={area.id} value={area.id}>
                              {area.name}{!area.isActive ? " (inactiva)" : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FieldDescription>Se usará para sugerir el área al crear un diagnóstico.</FieldDescription>
                      {fieldState.error && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                <Controller
                  name="isActive"
                  control={form.control}
                  render={({ field }) => (
                    <Field orientation="horizontal" className="rounded-xl border p-4">
                      <FieldContent>
                        <FieldTitle>Empleado activo</FieldTitle>
                        <FieldDescription>Puede seleccionarse como responsable en nuevos registros.</FieldDescription>
                      </FieldContent>
                      <Switch id={field.name} checked={field.value} onCheckedChange={field.onChange} aria-label="Cambiar disponibilidad del empleado" />
                    </Field>
                  )}
                />

                {form.formState.errors.root?.message && (
                  <div role="alert" className="rounded-xl border border-destructive/20 bg-destructive/6 p-3 text-sm text-destructive">
                    {form.formState.errors.root.message}
                  </div>
                )}
              </FieldGroup>
            </CardContent>
          </Card>

          <aside className="space-y-4">
            <Card className="gap-4 bg-primary/[0.035] shadow-none">
              <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Info className="size-4 text-primary" />Relación con diagnósticos</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
                <p>El empleado representa al responsable del equipo, no necesariamente al técnico.</p>
                <p>Su área podrá sugerirse automáticamente al crear un diagnóstico.</p>
              </CardContent>
            </Card>
            <Card className="gap-3 shadow-none">
              <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><IdCard className="size-4 text-primary" />Identificadores únicos</CardTitle></CardHeader>
              <CardContent className="text-sm leading-6 text-muted-foreground">El número de empleado y la cédula no pueden repetirse.</CardContent>
            </Card>
          </aside>
        </div>

        <div className="mt-5 flex flex-col-reverse gap-2 border-t pt-5 sm:flex-row sm:justify-end">
          <Button asChild variant="outline" size="lg"><Link to="/empleados"><ArrowLeft data-icon="inline-start" />Cancelar</Link></Button>
          <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? <><LoaderCircle className="animate-spin" data-icon="inline-start" />Guardando...</> : <><Save data-icon="inline-start" />{isEditing ? "Guardar cambios" : "Registrar empleado"}</>}
          </Button>
        </div>
      </form>
    </div>
  )
}
