import { apiGet, apiPatch, apiPost, apiPut, buildQuery, type PagedResponse } from "@/lib/api-client"
import type { TechnicianOption, User } from "@/types/domain"

export interface CreateUserRequest {
  employeeId: string
  userName: string
  email: string
  password: string
  role: "ADMINISTRATOR" | "TECHNICIAN"
}

export function listUsers(search = "", page = 1, pageSize = 20, signal?: AbortSignal) {
  return apiGet<PagedResponse<User>>(`/users${buildQuery({ search, page, pageSize })}`, signal)
}

export function listTechnicians(signal?: AbortSignal) {
  return apiGet<TechnicianOption[]>("/users/technicians", signal)
}

export function createUser(request: CreateUserRequest) {
  return apiPost<User>("/users", request)
}

export function updateUser(userId: string, values: { userName?: string; email?: string }) {
  return apiPatch<User>(`/users/${userId}`, values)
}

export function updateUserRole(userId: string, role: User["role"]) {
  return apiPut<{ id: string; role: string }>(`/users/${userId}/roles`, { role })
}

export function setUserActive(userId: string, isActive: boolean) {
  return apiPost<{ id: string; isActive: boolean }>(
    `/users/${userId}/${isActive ? "activate" : "deactivate"}`,
  )
}
