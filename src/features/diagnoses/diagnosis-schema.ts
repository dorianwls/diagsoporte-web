import { z } from "zod"

export const diagnosisFormSchema = z
  .object({
    responsibleEmployeeId: z.string().min(1, "Seleccione al responsable del equipo"),
    areaId: z.string().min(1, "Seleccione el área"),
    equipmentId: z.string().min(1, "Seleccione un equipo"),
    assignedTechnicianUserId: z.string().min(1, "Seleccione al técnico asignado"),
    startedAt: z.string().min(1, "La fecha de inicio es obligatoria"),
    finishedAt: z.string().min(1, "La fecha de finalización es obligatoria"),
    supportPerformed: z
      .string()
      .trim()
      .min(10, "Describa con más detalle el soporte realizado")
      .max(1500, "El soporte realizado no puede superar los 1500 caracteres"),
    technicalObservations: z
      .string()
      .trim()
      .min(10, "Describa con más detalle las observaciones técnicas")
      .max(3000, "Las observaciones no pueden superar los 3000 caracteres"),
    diagnosis: z
      .string()
      .trim()
      .min(10, "Describa con más detalle la conclusión técnica")
      .max(3000, "El diagnóstico no puede superar los 3000 caracteres"),
  })
  .superRefine((values, context) => {
    if (values.startedAt && values.finishedAt) {
      const startedAt = new Date(values.startedAt).getTime()
      const finishedAt = new Date(values.finishedAt).getTime()

      if (finishedAt < startedAt) {
        context.addIssue({
          code: "custom",
          path: ["finishedAt"],
          message: "La finalización no puede ser anterior al inicio",
        })
      }
    }
  })

export type DiagnosisFormValues = z.infer<typeof diagnosisFormSchema>
