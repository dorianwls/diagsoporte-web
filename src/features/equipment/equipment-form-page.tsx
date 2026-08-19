import { useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useNavigate } from "@tanstack/react-router"
import { ArrowLeft, Info, Laptop, LoaderCircle, MapPin, Save, UserRound } from "lucide-react"
import { Controller, useForm, useWatch } from "react-hook-form"
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
import { equipmentTypes } from "@/config/catalogs"
import { listAllAreas } from "@/features/areas/area-repository"
import {
  createEquipment,
  findEquipmentById,
  updateEquipment,
} from "@/features/equipment/equipment-repository"
import { equipmentFormSchema, type EquipmentFormValues } from "@/features/equipment/equipment-schema"
import { listAllEmployees } from "@/features/employees/employee-repository"
import { useApiQuery } from "@/hooks/use-api-query"
import { ApiError, getErrorMessage } from "@/lib/api-client"

interface EquipmentFormPageProps {
  equipmentId?: string
}

export function EquipmentFormPage({ equipmentId }: EquipmentFormPageProps) {
  const navigate = useNavigate()
  const isEditing = Boolean(equipmentId)
  const query = useApiQuery(`equipment-form:${equipmentId ?? "new"}`, async (signal) => {
    const [equipment, allEmployees, allAreas] = await Promise.all([
      equipmentId ? findEquipmentById(equipmentId, signal) : Promise.resolve(null),
      listAllEmployees(undefined, signal),
      listAllAreas(undefined, signal),
    ])
    return {
      equipment,
      employees: allEmployees.filter((employee) => employee.isActive || employee.id === equipment?.currentResponsibleEmployeeId),
      areas: allAreas.filter((area) => area.isActive || area.id === equipment?.currentAreaId),
    }
  })
  const equipment = query.data?.equipment
  const employees = query.data?.employees ?? []
  const areas = query.data?.areas ?? []
  const form = useForm<EquipmentFormValues>({
    resolver: zodResolver(equipmentFormSchema),
    defaultValues: {
      type: "LAPTOP",
      brand: "",
      uniCode: "",
      color: "",
      serialNumber: "",
      model: "",
      currentResponsibleEmployeeId: "",
      currentAreaId: "",
      isActive: true,
    },
    mode: "onTouched",
  })
  const selectedResponsibleId = useWatch({ control: form.control, name: "currentResponsibleEmployeeId" })
  const selectedAreaId = useWatch({ control: form.control, name: "currentAreaId" })
  const selectedResponsible = employees.find((employee) => employee.id === selectedResponsibleId)
  const selectedArea = areas.find((area) => area.id === selectedAreaId)

  useEffect(() => {
    if (equipment) {
      form.reset({
        type: equipment.type,
        brand: equipment.brand,
        uniCode: equipment.uniCode,
        color: equipment.color ?? "",
        serialNumber: equipment.serialNumber,
        model: equipment.model,
        currentResponsibleEmployeeId: equipment.currentResponsibleEmployeeId ?? "",
        currentAreaId: equipment.currentAreaId ?? "",
        isActive: equipment.isActive,
      })
    }
  }, [equipment, form])

  if (query.isLoading) return <PageLoadingState label="Cargando datos del equipo..." />
  if (query.error) return <PageErrorState error={query.error} onRetry={query.reload} />

  async function onSubmit(values: EquipmentFormValues) {
    try {
      if (equipmentId) {
        await updateEquipment(equipmentId, values)
        toast.success("Equipo actualizado correctamente")
      } else {
        await createEquipment(values)
        toast.success("Equipo registrado correctamente")
      }
      await navigate({ to: "/equipos" })
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        const field = error.message.toLocaleLowerCase("es").includes("serie")
          ? "serialNumber"
          : "uniCode"
        form.setError(field, { message: error.message }, { shouldFocus: true })
        return
      }
      form.setError("root", { message: getErrorMessage(error, "No fue posible guardar el equipo. Intente nuevamente.") })
    }
  }

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Inventario institucional"
        title={isEditing ? "Editar equipo" : "Registrar equipo"}
        description={isEditing ? "Actualiza la identificación y asignación actual del equipo." : "Añade un equipo tecnológico para documentar posteriormente sus diagnósticos."}
        actions={form.formState.isDirty ? <Badge variant="secondary">Cambios sin guardar</Badge> : undefined}
      />

      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="space-y-5">
            <Card className="gap-0 py-0 shadow-sm">
              <CardHeader className="border-b px-5 py-4 sm:px-6">
                <CardTitle className="flex items-center gap-2"><Laptop className="size-4.5 text-primary" />Identificación del equipo</CardTitle>
              </CardHeader>
              <CardContent className="p-5 sm:p-6">
                <FieldGroup>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Controller
                      name="type"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor={field.name}>Tipo de equipo</FieldLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger id={field.name} className="h-10 w-full" aria-invalid={fieldState.invalid}><SelectValue /></SelectTrigger>
                            <SelectContent>{equipmentTypes.map((type) => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}</SelectContent>
                          </Select>
                          {fieldState.error && <FieldError errors={[fieldState.error]} />}
                        </Field>
                      )}
                    />

                    <TextField form={form} name="brand" label="Marca" placeholder="Ej. Dell" />
                    <TextField form={form} name="model" label="Modelo" placeholder="Ej. Latitude 5420" />
                  </div>

                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <TextField form={form} name="uniCode" label="Código UNI" placeholder="Ej. UNI-00234" description="Código patrimonial de la universidad." />
                    <TextField form={form} name="serialNumber" label="Número de serie" placeholder="Ej. 8H2L9Q3" />
                    <TextField form={form} name="color" label="Color" placeholder="Ej. Gris" optional />
                  </div>
                </FieldGroup>
              </CardContent>
            </Card>

            <Card className="gap-0 py-0 shadow-sm">
              <CardHeader className="border-b px-5 py-4 sm:px-6">
                <CardTitle className="flex items-center gap-2"><MapPin className="size-4.5 text-primary" />Asignación actual</CardTitle>
              </CardHeader>
              <CardContent className="p-5 sm:p-6">
                <FieldGroup>
                  <div className="grid gap-6 md:grid-cols-2">
                    <Controller
                      name="currentResponsibleEmployeeId"
                      control={form.control}
                      render={({ field }) => (
                        <Field>
                          <FieldLabel htmlFor={field.name}>Responsable del equipo</FieldLabel>
                          <Select
                            value={field.value || "unassigned"}
                            onValueChange={(value) => {
                              const employeeId = value === "unassigned" ? "" : value
                              field.onChange(employeeId)
                              const responsible = employees.find((employee) => employee.id === employeeId)
                              if (responsible) {
                                form.setValue("currentAreaId", responsible.areaId, { shouldDirty: true, shouldValidate: true })
                              }
                            }}
                          >
                            <SelectTrigger id={field.name} className="h-10 w-full"><SelectValue placeholder="Seleccione un empleado" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="unassigned">Sin responsable asignado</SelectItem>
                              {employees.map((employee) => <SelectItem key={employee.id} value={employee.id}>{employee.fullName} · {employee.employeeNumber}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FieldDescription>Al seleccionar un responsable sugerimos automáticamente su área.</FieldDescription>
                        </Field>
                      )}
                    />

                    <Controller
                      name="currentAreaId"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor={field.name}>Área actual</FieldLabel>
                          <Select value={field.value || "unassigned"} onValueChange={(value) => field.onChange(value === "unassigned" ? "" : value)}>
                            <SelectTrigger id={field.name} className="h-10 w-full" aria-invalid={fieldState.invalid}><SelectValue placeholder="Seleccione un área" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="unassigned">Sin área asignada</SelectItem>
                              {areas.map((area) => <SelectItem key={area.id} value={area.id}>{area.name}{!area.isActive ? " (inactiva)" : ""}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          {fieldState.error && <FieldError errors={[fieldState.error]} />}
                        </Field>
                      )}
                    />
                  </div>

                  <Controller
                    name="isActive"
                    control={form.control}
                    render={({ field }) => (
                      <Field orientation="horizontal" className="rounded-xl border p-4">
                        <FieldContent><FieldTitle>Equipo activo</FieldTitle><FieldDescription>Puede seleccionarse en nuevos diagnósticos técnicos.</FieldDescription></FieldContent>
                        <Switch id={field.name} checked={field.value} onCheckedChange={field.onChange} aria-label="Cambiar disponibilidad del equipo" />
                      </Field>
                    )}
                  />

                  {form.formState.errors.root?.message && <div role="alert" className="rounded-xl border border-destructive/20 bg-destructive/6 p-3 text-sm text-destructive">{form.formState.errors.root.message}</div>}
                </FieldGroup>
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-4">
            <Card className="gap-4 bg-primary/[0.035] shadow-none">
              <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Info className="size-4 text-primary" />Resumen de asignación</CardTitle></CardHeader>
              <CardContent className="space-y-4 text-sm">
                <SummaryItem icon={UserRound} label="Responsable" value={selectedResponsible?.fullName ?? "Sin asignar"} />
                <SummaryItem icon={MapPin} label="Área" value={selectedArea?.name ?? "Sin asignar"} />
              </CardContent>
            </Card>
            <p className="px-1 text-xs leading-5 text-muted-foreground">La asignación refleja la ubicación actual. Cada diagnóstico conservará una copia histórica de sus datos.</p>
          </aside>
        </div>

        <div className="mt-5 flex flex-col-reverse gap-2 border-t pt-5 sm:flex-row sm:justify-end">
          <Button asChild variant="outline" size="lg"><Link to="/equipos"><ArrowLeft data-icon="inline-start" />Cancelar</Link></Button>
          <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? <><LoaderCircle className="animate-spin" data-icon="inline-start" />Guardando...</> : <><Save data-icon="inline-start" />{isEditing ? "Guardar cambios" : "Registrar equipo"}</>}
          </Button>
        </div>
      </form>
    </div>
  )
}

type TextFieldName = "brand" | "model" | "uniCode" | "serialNumber" | "color"

interface TextFieldProps {
  form: ReturnType<typeof useForm<EquipmentFormValues>>
  name: TextFieldName
  label: string
  placeholder: string
  description?: string
  optional?: boolean
}

function TextField({ form, name, label, placeholder, description, optional }: TextFieldProps) {
  const error = form.formState.errors[name]
  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={name}>{label}{optional && <span className="font-normal text-muted-foreground"> (opcional)</span>}</FieldLabel>
      <Input {...form.register(name, { onChange: () => form.clearErrors("root") })} id={name} placeholder={placeholder} className="h-10" aria-invalid={Boolean(error)} />
      {description && <FieldDescription>{description}</FieldDescription>}
      {error && <FieldError errors={[error]} />}
    </Field>
  )
}

function SummaryItem({ icon: Icon, label, value }: { icon: typeof UserRound; label: string; value: string }) {
  return <div className="flex gap-3"><div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/8 text-primary"><Icon className="size-4" /></div><div><p className="text-xs text-muted-foreground">{label}</p><p className="mt-0.5 font-medium">{value}</p></div></div>
}
