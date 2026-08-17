import { z } from "zod"

import { equipmentTypes, type EquipmentType } from "@/config/catalogs"

const equipmentTypeValues = equipmentTypes.map(({ value }) => value) as [
  EquipmentType,
  ...EquipmentType[],
]

export const equipmentFormSchema = z.object({
  type: z.enum(equipmentTypeValues, { error: "Seleccione el tipo de equipo" }),
  brand: z
    .string()
    .trim()
    .min(1, "La marca es obligatoria")
    .max(60, "La marca no puede superar los 60 caracteres"),
  uniCode: z
    .string()
    .trim()
    .min(1, "El Código UNI es obligatorio")
    .max(50, "El Código UNI no puede superar los 50 caracteres"),
  color: z.string().trim().max(40, "El color no puede superar los 40 caracteres"),
  serialNumber: z
    .string()
    .trim()
    .min(1, "El número de serie es obligatorio")
    .max(80, "El número de serie no puede superar los 80 caracteres"),
  model: z
    .string()
    .trim()
    .min(1, "El modelo es obligatorio")
    .max(80, "El modelo no puede superar los 80 caracteres"),
  currentResponsibleEmployeeId: z.string(),
  currentAreaId: z.string(),
  isActive: z.boolean(),
})

export type EquipmentFormValues = z.infer<typeof equipmentFormSchema>
