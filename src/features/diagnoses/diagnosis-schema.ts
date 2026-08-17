import { z } from "zod"

import { supportTypes, type SupportType } from "@/config/catalogs"

const supportTypeValues = supportTypes.map(({ value }) => value) as [
  SupportType,
  ...SupportType[],
]

export const diagnosisFormSchema = z
  .object({
    responsibleEmployeeId: z.string().min(1, "Seleccione al responsable del equipo"),
    areaId: z.string().min(1, "Seleccione el área"),
    equipmentId: z.string().min(1, "Seleccione un equipo"),
    assignedTechnicianUserId: z.string().min(1, "Seleccione al técnico asignado"),
    startedAt: z.string().min(1, "La fecha de inicio es obligatoria"),
    finishedAt: z.string().min(1, "La fecha de finalización es obligatoria"),
    supportType: z.enum(supportTypeValues, { error: "Seleccione el tipo de soporte realizado" }),
    supportTypeDetail: z
      .string()
      .trim()
      .max(120, "El detalle no puede superar los 120 caracteres"),
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
    if (values.supportType === "OTHER" && !values.supportTypeDetail) {
      context.addIssue({
        code: "custom",
        path: ["supportTypeDetail"],
        message: "Especifique el tipo de soporte realizado",
      })
    }

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
