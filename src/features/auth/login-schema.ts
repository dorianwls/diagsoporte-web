import { z } from "zod"

export const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, "Ingrese su nombre de usuario")
    .min(3, "El nombre de usuario debe tener al menos 3 caracteres")
    .max(50, "El nombre de usuario es demasiado largo"),
  password: z
    .string()
    .min(1, "Ingrese su contraseña")
    .min(8, "La contraseña debe tener al menos 8 caracteres"),
})

export type LoginFormValues = z.infer<typeof loginSchema>
