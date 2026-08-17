import { z } from "zod"

import type { LoginFormValues } from "@/features/auth/login-schema"

const AUTH_SESSION_KEY = "diagsoporte.auth-session"

const authSessionSchema = z.object({
  userId: z.string(),
  employeeId: z.string(),
  username: z.string(),
  fullName: z.string(),
  role: z.enum(["ADMINISTRATOR", "TECHNICIAN"]),
})

export type AuthSession = z.infer<typeof authSessionSchema>

export const demoCredentials: LoginFormValues = {
  username: "dorian",
  password: "soporte123",
}

const demoSession: AuthSession = {
  userId: "user-demo-001",
  employeeId: "employee-demo-001",
  username: "dorian",
  fullName: "Dorian Lanuza",
  role: "TECHNICIAN",
}

export class InvalidCredentialsError extends Error {
  constructor() {
    super("Usuario o contraseña incorrectos")
    this.name = "InvalidCredentialsError"
  }
}

export async function signIn(credentials: LoginFormValues): Promise<AuthSession> {
  await new Promise((resolve) => setTimeout(resolve, 650))

  if (
    credentials.username.toLowerCase() !== demoCredentials.username ||
    credentials.password !== demoCredentials.password
  ) {
    throw new InvalidCredentialsError()
  }

  sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(demoSession))

  return demoSession
}

export function getAuthSession(): AuthSession | null {
  const storedSession = sessionStorage.getItem(AUTH_SESSION_KEY)

  if (!storedSession) return null

  try {
    const parsedSession = authSessionSchema.safeParse(JSON.parse(storedSession))

    if (parsedSession.success) return parsedSession.data
  } catch {
    // Una sesión dañada se elimina y se trata como no autenticada.
  }

  sessionStorage.removeItem(AUTH_SESSION_KEY)
  return null
}

export function signOut() {
  sessionStorage.removeItem(AUTH_SESSION_KEY)
}
