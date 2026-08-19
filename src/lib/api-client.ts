export interface ApiMessage {
  code: string
  message: string
}

export interface ApiResponse<T> {
  data: T
  messages?: ApiMessage[]
}

export interface PagedResponse<T> {
  items: T[]
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

interface ProblemDetails {
  title?: string
  detail?: string
  errors?: Record<string, string[]>
  code?: string
  message?: string
}

export class ApiError extends Error {
  readonly status: number
  readonly title?: string
  readonly validationErrors: Record<string, string[]>

  constructor(status: number, problem: ProblemDetails = {}) {
    const firstValidationMessage = Object.values(problem.errors ?? {}).flat()[0]
    super(problem.detail ?? problem.message ?? firstValidationMessage ?? problem.title ?? defaultErrorMessage(status))
    this.name = "ApiError"
    this.status = status
    this.title = problem.title
    this.validationErrors = problem.errors ?? {}
  }

  fieldMessage(field: string) {
    return this.validationErrors[field]?.[0]
  }
}

export type QueryValue = string | number | boolean | null | undefined

const configuredBaseUrl = import.meta.env.VITE_API_URL?.trim()
const apiBaseUrl = (configuredBaseUrl || "/api").replace(/\/$/, "")
let csrfToken: string | null = null

export function buildQuery<T extends object>(values: T) {
  const parameters = new URLSearchParams()

  Object.entries(values as Record<string, QueryValue>).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      parameters.set(key, String(value))
    }
  })

  const query = parameters.toString()
  return query ? `?${query}` : ""
}

export async function apiGet<T>(path: string, signal?: AbortSignal): Promise<T> {
  return apiRequest<T>(path, { method: "GET", signal })
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return apiRequest<T>(path, jsonRequest("POST", body))
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  return apiRequest<T>(path, jsonRequest("PUT", body))
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  return apiRequest<T>(path, jsonRequest("PATCH", body))
}

export async function apiDelete(path: string): Promise<void> {
  await apiRequest<void>(path, { method: "DELETE" })
}

export async function apiDownload(path: string): Promise<{ blob: Blob; fileName: string }> {
  const response = await fetch(resolveApiUrl(path), {
    credentials: "include",
    headers: { Accept: "application/octet-stream" },
  })

  if (!response.ok) {
    throw await createApiError(response)
  }

  const disposition = response.headers.get("content-disposition")
  const encodedName = disposition?.match(/filename\*=UTF-8''([^;]+)/i)?.[1]
  const simpleName = disposition?.match(/filename="?([^";]+)"?/i)?.[1]
  const fileName = encodedName ? decodeURIComponent(encodedName) : (simpleName ?? "diagnostico")

  return { blob: await response.blob(), fileName }
}

export function saveDownloadedFile({ blob, fileName }: { blob: Blob; fileName: string }) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = fileName
  document.body.append(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) return error.message
  if (error instanceof TypeError) {
    return "No fue posible conectar con el servidor. Verifique que la API esté disponible."
  }
  return fallback
}

export function clearCsrfToken() {
  csrfToken = null
}

export async function fetchAllPages<T>(
  loadPage: (page: number, signal?: AbortSignal) => Promise<PagedResponse<T>>,
  signal?: AbortSignal,
) {
  const firstPage = await loadPage(1, signal)

  if (firstPage.totalPages <= 1) return firstPage.items

  const remainingPages = await Promise.all(
    Array.from({ length: firstPage.totalPages - 1 }, (_, index) => loadPage(index + 2, signal)),
  )

  return [firstPage.items, ...remainingPages.map((page) => page.items)].flat()
}

async function apiRequest<T>(path: string, init: RequestInit, retriedCsrf = false): Promise<T> {
  const method = init.method?.toUpperCase() ?? "GET"
  const headers = new Headers(init.headers)

  if (!isSafeMethod(method)) {
    headers.set("X-CSRF-TOKEN", await getCsrfToken())
  }

  const response = await fetch(resolveApiUrl(path), {
    ...init,
    credentials: "include",
    headers,
  })

  if (!response.ok) {
    const error = await createApiError(response)

    if (!retriedCsrf && !isSafeMethod(method) && error.status === 400 && error.title === "Token CSRF inválido") {
      clearCsrfToken()
      return apiRequest<T>(path, init, true)
    }

    if (error.status === 401 && !path.startsWith("/auth/")) {
      window.dispatchEvent(new CustomEvent("diagsoporte:unauthorized"))
    }

    throw error
  }

  if (response.status === 204) return undefined as T

  const payload = (await response.json()) as ApiResponse<T>
  return payload.data
}

async function getCsrfToken() {
  if (csrfToken) return csrfToken

  const response = await fetch(resolveApiUrl("/auth/csrf"), {
    credentials: "include",
    headers: { Accept: "application/json" },
  })

  if (!response.ok) throw await createApiError(response)

  const payload = (await response.json()) as ApiResponse<{ requestToken: string }>
  csrfToken = payload.data.requestToken
  return csrfToken
}

async function createApiError(response: Response) {
  let problem: ProblemDetails = {}

  try {
    problem = (await response.json()) as ProblemDetails
  } catch {
    // Algunas respuestas del proxy o del servidor no contienen JSON.
  }

  return new ApiError(response.status, problem)
}

function jsonRequest(method: string, body?: unknown): RequestInit {
  return {
    method,
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  }
}

function resolveApiUrl(path: string) {
  return `${apiBaseUrl}${path.startsWith("/") ? path : `/${path}`}`
}

function isSafeMethod(method: string) {
  return method === "GET" || method === "HEAD" || method === "OPTIONS"
}

function defaultErrorMessage(status: number) {
  if (status === 401) return "Debe iniciar sesión para continuar."
  if (status === 403) return "No tiene permisos para realizar esta acción."
  if (status === 404) return "El recurso solicitado no existe."
  if (status === 409) return "La operación entra en conflicto con los datos actuales."
  if (status === 429) return "Se realizaron demasiadas solicitudes. Intente nuevamente en unos minutos."
  return "Ocurrió un error al comunicarse con el servidor."
}
