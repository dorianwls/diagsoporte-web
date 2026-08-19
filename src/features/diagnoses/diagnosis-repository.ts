import type { DiagnosisFormValues } from "@/features/diagnoses/diagnosis-schema"
import {
  apiDelete,
  apiGet,
  apiPost,
  apiPut,
  buildQuery,
  type PagedResponse,
} from "@/lib/api-client"
import type { TechnicalDiagnosis } from "@/types/domain"

export interface DiagnosisListQuery {
  search?: string
  areaId?: string
  equipmentId?: string
  responsibleEmployeeId?: string
  technicianId?: string
  equipmentType?: string
  support?: string
  startedFrom?: string
  startedTo?: string
  sortBy?: "startedAt" | "code" | "uniCode" | "responsible" | "area" | "technician" | "supportPerformed"
  sortDirection?: "asc" | "desc"
  page?: number
  pageSize?: number
}

export function listDiagnoses(query: DiagnosisListQuery = {}, signal?: AbortSignal) {
  return apiGet<PagedResponse<TechnicalDiagnosis>>(`/diagnoses${buildQuery(query)}`, signal)
}

export function findDiagnosisById(diagnosisId: string, signal?: AbortSignal) {
  return apiGet<TechnicalDiagnosis>(`/diagnoses/${diagnosisId}`, signal)
}

export function createDiagnosis(values: DiagnosisFormValues) {
  return apiPost<TechnicalDiagnosis>("/diagnoses", toRequest(values))
}

export function updateDiagnosis(diagnosisId: string, values: DiagnosisFormValues) {
  return apiPut<TechnicalDiagnosis>(`/diagnoses/${diagnosisId}`, toRequest(values))
}

export function deleteDiagnosis(diagnosisId: string) {
  return apiDelete(`/diagnoses/${diagnosisId}`)
}

export function listEquipmentHistory(
  equipmentId: string,
  page = 1,
  pageSize = 20,
  signal?: AbortSignal,
) {
  return apiGet<PagedResponse<TechnicalDiagnosis>>(
    `/equipment/${equipmentId}/diagnoses${buildQuery({ page, pageSize })}`,
    signal,
  )
}

function toRequest(values: DiagnosisFormValues) {
  return {
    ...values,
    startedAt: new Date(values.startedAt).toISOString(),
    finishedAt: new Date(values.finishedAt).toISOString(),
  }
}
