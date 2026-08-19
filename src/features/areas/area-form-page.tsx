import { useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useNavigate } from "@tanstack/react-router"
import { ArrowLeft, Building2, Info, LoaderCircle, Save } from "lucide-react"
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
import { Switch } from "@/components/ui/switch"
import {
  createArea,
  findAreaById,
  updateArea,
} from "@/features/areas/area-repository"
import { areaFormSchema, type AreaFormValues } from "@/features/areas/area-schema"
import { useApiQuery } from "@/hooks/use-api-query"
import { ApiError, getErrorMessage } from "@/lib/api-client"

interface AreaFormPageProps {
  areaId?: string
}

export function AreaFormPage({ areaId }: AreaFormPageProps) {
  const navigate = useNavigate()
  const isEditing = Boolean(areaId)
  const query = useApiQuery(
    `area-form:${areaId ?? "new"}`,
    (signal) => areaId ? findAreaById(areaId, signal) : Promise.resolve(null),
  )
  const area = query.data
  const form = useForm<AreaFormValues>({
    resolver: zodResolver(areaFormSchema),
    defaultValues: {
      name: "",
      isActive: true,
    },
    mode: "onTouched",
  })

  useEffect(() => {
    if (area) form.reset({ name: area.name, isActive: area.isActive })
  }, [area, form])

  if (isEditing && query.isLoading) return <PageLoadingState label="Cargando el área..." />
  if (isEditing && query.error) return <PageErrorState error={query.error} onRetry={query.reload} />

  async function onSubmit(values: AreaFormValues) {
    try {
      if (areaId) {
        await updateArea(areaId, values)
        toast.success("Área actualizada correctamente")
      } else {
        await createArea(values)
        toast.success("Área registrada correctamente")
      }

      await navigate({ to: "/areas" })
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        form.setError("name", { message: error.message }, { shouldFocus: true })
        return
      }

      form.setError("root", {
        message: getErrorMessage(error, "No fue posible guardar el área. Intente nuevamente."),
      })
    }
  }

  const nameRegistration = form.register("name", {
    onChange: () => form.clearErrors("root"),
  })

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Catálogo institucional"
        title={isEditing ? "Editar área" : "Registrar área"}
        description={
          isEditing
            ? "Actualiza el nombre o la disponibilidad de esta unidad universitaria."
            : "Crea una unidad académica o administrativa para relacionarla con empleados, equipos y diagnósticos."
        }
        actions={
          form.formState.isDirty ? (
            <Badge variant="secondary">Cambios sin guardar</Badge>
          ) : undefined
        }
      />

      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
          <Card className="gap-0 py-0 shadow-sm">
            <CardHeader className="border-b px-5 py-4 sm:px-6">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="size-4.5 text-primary" />
                Información del área
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 sm:p-6">
              <FieldGroup>
                <Field data-invalid={Boolean(form.formState.errors.name)}>
                  <FieldLabel htmlFor="name">Nombre del área</FieldLabel>
                  <Input
                    {...nameRegistration}
                    id="name"
                    autoFocus
                    placeholder="Ej. Auditoría Interna"
                    className="h-10 max-w-xl"
                    aria-invalid={Boolean(form.formState.errors.name)}
                  />
                  <FieldDescription>
                    Utilice el nombre institucional completo y evite abreviaturas ambiguas.
                  </FieldDescription>
                  {form.formState.errors.name && (
                    <FieldError errors={[form.formState.errors.name]} />
                  )}
                </Field>

                <Controller
                  name="isActive"
                  control={form.control}
                  render={({ field }) => (
                    <Field orientation="horizontal" className="max-w-xl rounded-xl border p-4">
                      <FieldContent>
                        <FieldTitle>Área activa</FieldTitle>
                        <FieldDescription>
                          Las áreas activas pueden seleccionarse en nuevos registros.
                        </FieldDescription>
                      </FieldContent>
                      <Switch
                        id={field.name}
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        aria-label="Cambiar disponibilidad del área"
                      />
                    </Field>
                  )}
                />

                {form.formState.errors.root?.message && (
                  <div
                    role="alert"
                    className="rounded-xl border border-destructive/20 bg-destructive/6 p-3 text-sm text-destructive"
                  >
                    {form.formState.errors.root.message}
                  </div>
                )}
              </FieldGroup>
            </CardContent>
          </Card>

          <aside>
            <Card className="gap-4 bg-primary/[0.035] shadow-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Info className="size-4 text-primary" />
                  ¿Dónde se utilizará?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
                <p>En la asignación de empleados y equipos.</p>
                <p>En búsquedas y filtros del repositorio histórico.</p>
                <p>En la hoja imprimible de cada diagnóstico técnico.</p>
              </CardContent>
            </Card>
          </aside>
        </div>

        <div className="mt-5 flex flex-col-reverse gap-2 border-t pt-5 sm:flex-row sm:justify-end">
          <Button asChild variant="outline" size="lg">
            <Link to="/areas">
              <ArrowLeft data-icon="inline-start" />
              Cancelar
            </Link>
          </Button>
          <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? (
              <>
                <LoaderCircle className="animate-spin" data-icon="inline-start" />
                Guardando...
              </>
            ) : (
              <>
                <Save data-icon="inline-start" />
                {isEditing ? "Guardar cambios" : "Registrar área"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
