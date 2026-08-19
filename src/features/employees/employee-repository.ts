import type { EmployeeFormValues } from "@/features/employees/employee-schema"
import {
  apiGet,
  apiPost,
  apiPut,
  buildQuery,
  fetchAllPages,
  type PagedResponse,
} from "@/lib/api-client"
import type { Employee } from "@/types/domain"

export interface EmployeeListQuery {
  search?: string
  areaId?: string
  isActive?: boolean
  sortBy?: "fullName" | "employeeNumber" | "areaName" | "updatedAt"
  sortDirection?: "asc" | "desc"
  page?: number
  pageSize?: number
}

export function listEmployees(query: EmployeeListQuery = {}, signal?: AbortSignal) {
  return apiGet<PagedResponse<Employee>>(`/employees${buildQuery(query)}`, signal)
}

export function listAllEmployees(isActive?: boolean, signal?: AbortSignal) {
  return fetchAllPages(
    (page, currentSignal) => listEmployees({ isActive, page, pageSize: 100 }, currentSignal),
    signal,
  )
}

export function findEmployeeById(employeeId: string, signal?: AbortSignal) {
  return apiGet<Employee>(`/employees/${employeeId}`, signal)
}

export function createEmployee(values: EmployeeFormValues) {
  return apiPost<Employee>("/employees", values)
}

export function updateEmployee(employeeId: string, values: EmployeeFormValues) {
  return apiPut<Employee>(`/employees/${employeeId}`, values)
}

export function setEmployeeActive(employeeId: string, isActive: boolean) {
  return apiPost<Employee>(`/employees/${employeeId}/${isActive ? "activate" : "deactivate"}`)
}
