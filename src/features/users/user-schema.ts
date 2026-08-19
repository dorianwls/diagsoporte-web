import { z } from "zod"

export const userFormSchema = z.object({
  employeeId: z.string().min(1, "Seleccione un empleado"),
  userName: z
    .string()
    .trim()
    .min(3, "El usuario debe tener al menos 3 caracteres")
    .max(50, "El usuario no puede superar los 50 caracteres"),
  email: z.email("Ingrese un correo electrónico válido"),
  password: z.string(),
  role: z.enum(["ADMINISTRATOR", "TECHNICIAN"]),
}).superRefine((values, context) => {
  if (values.password && values.password.length < 8) {
    context.addIssue({ code: "custom", path: ["password"], message: "La contraseña debe tener al menos 8 caracteres" })
  }
  if (values.password && !/[A-Z]/.test(values.password)) {
    context.addIssue({ code: "custom", path: ["password"], message: "Incluya al menos una letra mayúscula" })
  }
  if (values.password && !/[a-z]/.test(values.password)) {
    context.addIssue({ code: "custom", path: ["password"], message: "Incluya al menos una letra minúscula" })
  }
  if (values.password && !/\d/.test(values.password)) {
    context.addIssue({ code: "custom", path: ["password"], message: "Incluya al menos un número" })
  }
})

export type UserFormValues = z.infer<typeof userFormSchema>
