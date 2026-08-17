import { z } from "zod"

export const employeeFormSchema = z.object({
  employeeNumber: z
    .string()
    .trim()
    .min(1, "El número de empleado es obligatorio")
    .max(30, "El número de empleado no puede superar los 30 caracteres"),
  fullName: z
    .string()
    .trim()
    .min(1, "El nombre completo es obligatorio")
    .min(5, "Escriba el nombre completo del empleado")
    .max(120, "El nombre no puede superar los 120 caracteres"),
  nationalId: z
    .string()
    .trim()
    .min(1, "La cédula es obligatoria")
    .max(30, "La cédula no puede superar los 30 caracteres"),
  areaId: z.string().min(1, "Seleccione el área del empleado"),
  isActive: z.boolean(),
})

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>
