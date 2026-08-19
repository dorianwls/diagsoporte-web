import { apiGet } from "@/lib/api-client"
import type { TechnicalDiagnosis } from "@/types/domain"

export interface DashboardSummary {
  diagnosesRegistered: number
  equipmentRegistered: number
  employeesRegistered: number
  areasRegistered: number
  diagnosesThisMonth: number
  equipmentTypeDistribution: Array<{ type: string; count: number; percentage: number }>
}

export function getDashboardSummary(signal?: AbortSignal) {
  return apiGet<DashboardSummary>("/dashboard/summary", signal)
}

export function getRecentDiagnoses(limit = 5, signal?: AbortSignal) {
  return apiGet<TechnicalDiagnosis[]>(`/dashboard/recent-diagnoses?limit=${limit}`, signal)
}
