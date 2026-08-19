import { z } from "zod"

import type { LoginFormValues } from "@/features/auth/login-schema"
import { ApiError, apiGet, apiPost, clearCsrfToken } from "@/lib/api-client"

const menuItemSchema: z.ZodType<MenuItem> = z.lazy(() =>
  z.object({
    id: z.number(),
    name: z.string(),
    route: z.string(),
    icon: z.string().nullable(),
    section: z.string().nullable(),
    subMenus: z.array(menuItemSchema),
  }),
)

const authSessionSchema = z.object({
  userId: z.string(),
  employeeId: z.string(),
  userName: z.string(),
  email: z.string(),
  fullName: z.string(),
  role: z.enum(["ADMINISTRATOR", "TECHNICIAN"]),
  permissions: z.array(z.string()),
  menu: z.array(menuItemSchema),
})

export interface MenuItem {
  id: number
  name: string
  route: string
  icon: string | null
  section: string | null
  subMenus: MenuItem[]
}

export type AuthSession = z.infer<typeof authSessionSchema>

let currentSession: AuthSession | null = null
let sessionRequest: Promise<AuthSession | null> | null = null

export class InvalidCredentialsError extends Error {
  constructor(message = "Usuario o contraseña incorrectos") {
    super(message)
    this.name = "InvalidCredentialsError"
  }
}

export async function signIn(credentials: LoginFormValues): Promise<AuthSession> {
  try {
    const response = await apiPost<unknown>("/auth/login", {
      userName: credentials.username,
      password: credentials.password,
    })
    currentSession = authSessionSchema.parse(response)
    return currentSession
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      throw new InvalidCredentialsError(error.message)
    }
    throw error
  }
}

export async function restoreAuthSession(force = false): Promise<AuthSession | null> {
  if (currentSession && !force) return currentSession
  if (sessionRequest && !force) return sessionRequest

  sessionRequest = apiGet<unknown>("/auth/me")
    .then((response) => {
      currentSession = authSessionSchema.parse(response)
      return currentSession
    })
    .catch((error: unknown) => {
      if ((error instanceof ApiError && error.status === 401) || error instanceof TypeError) {
        currentSession = null
        return null
      }
      throw error
    })
    .finally(() => {
      sessionRequest = null
    })

  return sessionRequest
}

export function getAuthSession() {
  return currentSession
}

export function hasPermission(permission: string) {
  return currentSession?.permissions.includes(permission) ?? false
}

export async function signOut() {
  try {
    await apiPost<void>("/auth/logout")
  } finally {
    clearAuthSession()
  }
}

export function clearAuthSession() {
  currentSession = null
  sessionRequest = null
  clearCsrfToken()
}
