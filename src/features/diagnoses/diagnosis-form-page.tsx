import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "@tanstack/react-router";
import {
   ArrowLeft,
   CalendarClock,
   Laptop,
   LoaderCircle,
   Plus,
   Save,
   Wrench,
} from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import {
   PageErrorState,
   PageLoadingState,
} from "@/components/shared/async-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
   Field,
   FieldDescription,
   FieldError,
   FieldGroup,
   FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { equipmentTypes } from "@/config/catalogs";
import { listAllAreas } from "@/features/areas/area-repository";
import { getAuthSession, hasPermission } from "@/features/auth/auth-service";
import {
   createDiagnosis,
   findDiagnosisById,
   updateDiagnosis,
} from "@/features/diagnoses/diagnosis-repository";
import {
   diagnosisFormSchema,
   type DiagnosisFormValues,
} from "@/features/diagnoses/diagnosis-schema";
import { listAllEquipment } from "@/features/equipment/equipment-repository";
import { listAllEmployees } from "@/features/employees/employee-repository";
import { listTechnicians } from "@/features/users/user-service";
import { useApiQuery } from "@/hooks/use-api-query";
import { ApiError, getErrorMessage } from "@/lib/api-client";
import { toDateTimeLocal } from "@/lib/formatters";

interface DiagnosisFormPageProps {
   diagnosisId?: string;
}

export function DiagnosisFormPage({ diagnosisId }: DiagnosisFormPageProps) {
   const navigate = useNavigate();
   const isEditing = Boolean(diagnosisId);
   const now = new Date();
   const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
   const query = useApiQuery(
      `diagnosis-form:${diagnosisId ?? "new"}`,
      async (signal) => {
         const [
            currentDiagnosis,
            allEmployees,
            allAreas,
            allEquipment,
            activeTechnicians,
         ] = await Promise.all([
            diagnosisId
               ? findDiagnosisById(diagnosisId, signal)
               : Promise.resolve(null),
            listAllEmployees(undefined, signal),
            listAllAreas(undefined, signal),
            listAllEquipment(undefined, signal),
            listTechnicians(signal),
         ]);
         const technicians = [...activeTechnicians];
         if (
            currentDiagnosis &&
            !technicians.some(
               (item) => item.id === currentDiagnosis.assignedTechnicianUserId,
            )
         ) {
            technicians.push({
               id: currentDiagnosis.assignedTechnicianUserId,
               fullName: currentDiagnosis.snapshot.assignedTechnician.fullName,
            });
         }
         return {
            currentDiagnosis,
            employees: allEmployees.filter(
               (item) =>
                  item.isActive ||
                  item.id === currentDiagnosis?.responsibleEmployeeId,
            ),
            areas: allAreas.filter(
               (item) => item.isActive || item.id === currentDiagnosis?.areaId,
            ),
            equipment: allEquipment.filter(
               (item) =>
                  item.isActive || item.id === currentDiagnosis?.equipmentId,
            ),
            technicians,
         };
      },
   );
   const currentDiagnosis = query.data?.currentDiagnosis;
   const employees = query.data?.employees ?? [];
   const areas = query.data?.areas ?? [];
   const equipmentList = query.data?.equipment ?? [];
   const technicians = query.data?.technicians ?? [];
   const form = useForm<DiagnosisFormValues>({
      resolver: zodResolver(diagnosisFormSchema),
      defaultValues: {
         responsibleEmployeeId: "",
         areaId: "",
         equipmentId: "",
         assignedTechnicianUserId: "",
         startedAt: toDateTimeLocal(now),
         finishedAt: toDateTimeLocal(oneHourLater),
         supportPerformed: "",
         technicalObservations: "",
         diagnosis: "",
      },
      mode: "onTouched",
   });
   const selectedEquipmentId = useWatch({
      control: form.control,
      name: "equipmentId",
   });
   const selectedEquipment = equipmentList.find(
      (equipment) => equipment.id === selectedEquipmentId,
   );
   const equipmentTypeLabel = equipmentTypes.find(
      (type) => type.value === selectedEquipment?.type,
   )?.label;

   useEffect(() => {
      if (currentDiagnosis) {
         form.reset({
            responsibleEmployeeId: currentDiagnosis.responsibleEmployeeId,
            areaId: currentDiagnosis.areaId,
            equipmentId: currentDiagnosis.equipmentId,
            assignedTechnicianUserId: currentDiagnosis.assignedTechnicianUserId,
            startedAt: toDateTimeLocal(currentDiagnosis.startedAt),
            finishedAt: toDateTimeLocal(currentDiagnosis.finishedAt),
            supportPerformed: currentDiagnosis.supportPerformed,
            technicalObservations: currentDiagnosis.technicalObservations,
            diagnosis: currentDiagnosis.diagnosis,
         });
         return;
      }

      const session = getAuthSession();
      if (!diagnosisId && session?.role === "TECHNICIAN") {
         form.setValue("assignedTechnicianUserId", session.userId);
      }
   }, [currentDiagnosis, diagnosisId, form]);

   if (query.isLoading)
      return (
         <PageLoadingState label="Preparando el formulario de diagnóstico..." />
      );
   if (query.error)
      return <PageErrorState error={query.error} onRetry={query.reload} />;

   async function onSubmit(values: DiagnosisFormValues) {
      try {
         const savedDiagnosis = diagnosisId
            ? await updateDiagnosis(diagnosisId, values)
            : await createDiagnosis(values);
         toast.success(
            diagnosisId
               ? "Diagnóstico actualizado correctamente"
               : "Diagnóstico registrado correctamente",
         );
         await navigate({
            to: "/diagnosticos/$diagnosisId",
            params: { diagnosisId: savedDiagnosis.id },
         });
      } catch (error) {
         if (error instanceof ApiError) {
            const fields = Object.keys(error.validationErrors) as Array<
               keyof DiagnosisFormValues
            >;
            fields.forEach((field) => {
               if (field in form.getValues()) {
                  form.setError(field, {
                     message: error.validationErrors[field]?.[0],
                  });
               }
            });
         }
         form.setError("root", {
            message: getErrorMessage(
               error,
               "No fue posible guardar el diagnóstico. Revise los datos e intente nuevamente.",
            ),
         });
      }
   }

   return (
      <div className="space-y-7">
         <PageHeader
            eyebrow="Repositorio histórico"
            title={
               isEditing
                  ? `Editar ${currentDiagnosis?.code}`
                  : "Nuevo Diagnóstico Técnico"
            }
            description="Documenta la intervención realizada y conserva una ficha histórica del equipo, responsable y técnico."
            actions={
               form.formState.isDirty ? (
                  <Badge variant="secondary">Cambios sin guardar</Badge>
               ) : undefined
            }
         />

         <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <div className="space-y-5">
               <FormCard
                  icon={CalendarClock}
                  title="Información general"
                  description="Identifica al responsable, el área y el periodo de la actividad técnica."
               >
                  <FieldGroup>
                     <div className="grid gap-6 md:grid-cols-2">
                        <Controller
                           name="responsibleEmployeeId"
                           control={form.control}
                           render={({ field, fieldState }) => (
                              <Field data-invalid={fieldState.invalid}>
                                 <FieldLabel htmlFor={field.name}>
                                    Responsable del equipo
                                 </FieldLabel>
                                 <Select
                                    value={field.value}
                                    onValueChange={(value) => {
                                       field.onChange(value);
                                       const employee = employees.find(
                                          (item) => item.id === value,
                                       );
                                       if (employee)
                                          form.setValue(
                                             "areaId",
                                             employee.areaId,
                                             {
                                                shouldDirty: true,
                                                shouldValidate: true,
                                             },
                                          );
                                    }}
                                 >
                                    <SelectTrigger
                                       id={field.name}
                                       className="h-10 w-full"
                                       aria-invalid={fieldState.invalid}
                                    >
                                       <SelectValue placeholder="Seleccione un empleado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                       {employees.map((employee) => (
                                          <SelectItem
                                             key={employee.id}
                                             value={employee.id}
                                          >
                                             {employee.fullName} ·{" "}
                                             {employee.employeeNumber}
                                          </SelectItem>
                                       ))}
                                    </SelectContent>
                                 </Select>
                                 <FieldDescription>
                                    Al seleccionarlo sugerimos su área
                                    institucional.
                                 </FieldDescription>
                                 {fieldState.error && (
                                    <FieldError errors={[fieldState.error]} />
                                 )}
                              </Field>
                           )}
                        />

                        <Controller
                           name="areaId"
                           control={form.control}
                           render={({ field, fieldState }) => (
                              <Field data-invalid={fieldState.invalid}>
                                 <FieldLabel htmlFor={field.name}>
                                    Área
                                 </FieldLabel>
                                 <Select
                                    value={field.value}
                                    onValueChange={field.onChange}
                                 >
                                    <SelectTrigger
                                       id={field.name}
                                       className="h-10 w-full"
                                       aria-invalid={fieldState.invalid}
                                    >
                                       <SelectValue placeholder="Seleccione un área" />
                                    </SelectTrigger>
                                    <SelectContent>
                                       {areas.map((area) => (
                                          <SelectItem
                                             key={area.id}
                                             value={area.id}
                                          >
                                             {area.name}
                                          </SelectItem>
                                       ))}
                                    </SelectContent>
                                 </Select>
                                 {fieldState.error && (
                                    <FieldError errors={[fieldState.error]} />
                                 )}
                              </Field>
                           )}
                        />
                     </div>

                     <div className="grid gap-6 md:grid-cols-2">
                        <DateTimeField
                           form={form}
                           name="startedAt"
                           label="Fecha de inicio de actividad técnica"
                        />
                        <DateTimeField
                           form={form}
                           name="finishedAt"
                           label="Fecha de finalización de actividad técnica"
                        />
                     </div>
                  </FieldGroup>
               </FormCard>

               <FormCard
                  icon={Laptop}
                  title="Datos del equipo"
                  description="Selecciona un equipo del inventario; sus datos quedarán copiados en el diagnóstico."
               >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                     <Controller
                        name="equipmentId"
                        control={form.control}
                        render={({ field, fieldState }) => (
                           <Field
                              data-invalid={fieldState.invalid}
                              className="flex-1"
                           >
                              <FieldLabel htmlFor={field.name}>
                                 Equipo
                              </FieldLabel>
                              <Select
                                 value={field.value}
                                 onValueChange={field.onChange}
                              >
                                 <SelectTrigger
                                    id={field.name}
                                    className="h-10 w-full"
                                    aria-invalid={fieldState.invalid}
                                 >
                                    <SelectValue placeholder="Busque por Código UNI, marca o modelo" />
                                 </SelectTrigger>
                                 <SelectContent>
                                    {equipmentList.map((equipment) => (
                                       <SelectItem
                                          key={equipment.id}
                                          value={equipment.id}
                                       >
                                          {equipment.uniCode} ·{" "}
                                          {equipment.brand} {equipment.model}
                                       </SelectItem>
                                    ))}
                                 </SelectContent>
                              </Select>
                              {fieldState.error && (
                                 <FieldError errors={[fieldState.error]} />
                              )}
                           </Field>
                        )}
                     />
                     {hasPermission("equipment:create") && (
                        <Button asChild type="button" variant="outline">
                           <Link to="/equipos/nuevo">
                              <Plus data-icon="inline-start" />
                              Registrar equipo
                           </Link>
                        </Button>
                     )}
                  </div>

                  {selectedEquipment ? (
                     <dl className="mt-5 grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2 lg:grid-cols-3">
                        <EquipmentDatum
                           label="Tipo"
                           value={equipmentTypeLabel ?? selectedEquipment.type}
                        />
                        <EquipmentDatum
                           label="Marca"
                           value={selectedEquipment.brand}
                        />
                        <EquipmentDatum
                           label="Código UNI"
                           value={selectedEquipment.uniCode}
                           mono
                        />
                        <EquipmentDatum
                           label="Color"
                           value={selectedEquipment.color ?? "No especificado"}
                        />
                        <EquipmentDatum
                           label="Número de serie"
                           value={selectedEquipment.serialNumber}
                           mono
                        />
                        <EquipmentDatum
                           label="Modelo"
                           value={selectedEquipment.model}
                        />
                     </dl>
                  ) : (
                     <div className="mt-5 rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                        Seleccione un equipo para revisar sus datos antes de
                        guardar.
                     </div>
                  )}
               </FormCard>

               <FormCard
                  icon={Wrench}
                  title="Trabajo técnico"
                  description="Diferencia claramente las acciones observadas de la conclusión técnica obtenida."
               >
                  <FieldGroup>
                     <div className="max-w-xl">
                        <Controller
                           name="assignedTechnicianUserId"
                           control={form.control}
                           render={({ field, fieldState }) => (
                              <Field data-invalid={fieldState.invalid}>
                                 <FieldLabel htmlFor={field.name}>
                                    Asignado a
                                 </FieldLabel>
                                 <Select
                                    value={field.value}
                                    onValueChange={field.onChange}
                                 >
                                    <SelectTrigger
                                       id={field.name}
                                       className="h-10 w-full"
                                       aria-invalid={fieldState.invalid}
                                    >
                                       <SelectValue placeholder="Seleccione al técnico" />
                                    </SelectTrigger>
                                    <SelectContent>
                                       {technicians.map((technician) => (
                                          <SelectItem
                                             key={technician.id}
                                             value={technician.id}
                                          >
                                             {technician.fullName}
                                          </SelectItem>
                                       ))}
                                    </SelectContent>
                                 </Select>
                                 {fieldState.error && (
                                    <FieldError errors={[fieldState.error]} />
                                 )}
                              </Field>
                           )}
                        />
                     </div>

                     <Field
                        data-invalid={Boolean(
                           form.formState.errors.supportPerformed,
                        )}
                     >
                        <FieldLabel htmlFor="supportPerformed">
                           Tipo de soporte realizado
                        </FieldLabel>
                        <Textarea
                           {...form.register("supportPerformed")}
                           id="supportPerformed"
                           rows={5}
                           placeholder="Describa qué trabajo se realizó al equipo. Ej. Revisión e inspección técnica, limpieza interna y configuración del sistema..."
                           aria-invalid={Boolean(
                              form.formState.errors.supportPerformed,
                           )}
                        />
                        <FieldDescription>
                           Describa libremente el trabajo técnico realizado al
                           equipo.
                        </FieldDescription>
                        {form.formState.errors.supportPerformed && (
                           <FieldError
                              errors={[form.formState.errors.supportPerformed]}
                           />
                        )}
                     </Field>

                     <Field
                        data-invalid={Boolean(
                           form.formState.errors.technicalObservations,
                        )}
                     >
                        <FieldLabel htmlFor="technicalObservations">
                           Observaciones Técnicas
                        </FieldLabel>
                        <Textarea
                           {...form.register("technicalObservations")}
                           id="technicalObservations"
                           rows={7}
                           placeholder="Detalle qué revisó, encontró o realizó durante la intervención..."
                           aria-invalid={Boolean(
                              form.formState.errors.technicalObservations,
                           )}
                        />
                        <FieldDescription>
                           Incluya comprobaciones, comportamiento observado y
                           acciones realizadas.
                        </FieldDescription>
                        {form.formState.errors.technicalObservations && (
                           <FieldError
                              errors={[
                                 form.formState.errors.technicalObservations,
                              ]}
                           />
                        )}
                     </Field>

                     <Field
                        data-invalid={Boolean(form.formState.errors.diagnosis)}
                     >
                        <FieldLabel htmlFor="diagnosis">Diagnóstico</FieldLabel>
                        <Textarea
                           {...form.register("diagnosis")}
                           id="diagnosis"
                           rows={7}
                           placeholder="Escriba la conclusión técnica y, si corresponde, la recomendación..."
                           aria-invalid={Boolean(
                              form.formState.errors.diagnosis,
                           )}
                        />
                        <FieldDescription>
                           Registre la conclusión obtenida después de la
                           revisión.
                        </FieldDescription>
                        {form.formState.errors.diagnosis && (
                           <FieldError
                              errors={[form.formState.errors.diagnosis]}
                           />
                        )}
                     </Field>

                     {form.formState.errors.root?.message && (
                        <div
                           role="alert"
                           className="rounded-xl border border-destructive/20 bg-destructive/6 p-3 text-sm text-destructive"
                        >
                           {form.formState.errors.root.message}
                        </div>
                     )}
                  </FieldGroup>
               </FormCard>
            </div>

            <div className="sticky bottom-0 z-10 -mx-4 mt-6 flex flex-col-reverse gap-2 border-t bg-background/95 px-4 py-4 backdrop-blur sm:flex-row sm:justify-end lg:-mx-7 lg:px-7">
               <Button asChild variant="outline" size="lg">
                  <Link to="/diagnosticos">
                     <ArrowLeft data-icon="inline-start" />
                     Cancelar
                  </Link>
               </Button>
               <Button
                  type="submit"
                  size="lg"
                  disabled={form.formState.isSubmitting}
               >
                  {form.formState.isSubmitting ? (
                     <>
                        <LoaderCircle
                           className="animate-spin"
                           data-icon="inline-start"
                        />
                        Guardando...
                     </>
                  ) : (
                     <>
                        <Save data-icon="inline-start" />
                        {isEditing
                           ? "Guardar cambios"
                           : "Registrar diagnóstico"}
                     </>
                  )}
               </Button>
            </div>
         </form>
      </div>
   );
}

function FormCard({
   icon: Icon,
   title,
   description,
   children,
}: {
   icon: typeof Laptop;
   title: string;
   description: string;
   children: React.ReactNode;
}) {
   return (
      <Card className="gap-0 py-0 shadow-sm">
         <CardHeader className="border-b px-5 py-4 sm:px-6">
            <CardTitle className="flex items-center gap-2">
               <Icon className="size-4.5 text-primary" />
               {title}
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
         </CardHeader>
         <CardContent className="p-5 sm:p-6">{children}</CardContent>
      </Card>
   );
}

function DateTimeField({
   form,
   name,
   label,
}: {
   form: ReturnType<typeof useForm<DiagnosisFormValues>>;
   name: "startedAt" | "finishedAt";
   label: string;
}) {
   const error = form.formState.errors[name];
   return (
      <Field data-invalid={Boolean(error)}>
         <FieldLabel htmlFor={name}>{label}</FieldLabel>
         <Input
            {...form.register(name)}
            id={name}
            type="datetime-local"
            className="h-10"
            aria-invalid={Boolean(error)}
         />
         {error && <FieldError errors={[error]} />}
      </Field>
   );
}

function EquipmentDatum({
   label,
   value,
   mono = false,
}: {
   label: string;
   value: string;
   mono?: boolean;
}) {
   return (
      <div className="bg-card p-4">
         <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
         <dd
            className={`mt-1 text-sm font-semibold ${mono ? "font-mono" : ""}`}
         >
            {value}
         </dd>
      </div>
   );
}
