import { z } from "zod"

export const areaFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre del área es obligatorio")
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre no puede superar los 100 caracteres"),
  isActive: z.boolean(),
})

export type AreaFormValues = z.infer<typeof areaFormSchema>
