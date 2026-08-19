import type { EquipmentFormValues } from "@/features/equipment/equipment-schema"
import {
  apiGet,
  apiPost,
  apiPut,
  buildQuery,
  fetchAllPages,
  type PagedResponse,
} from "@/lib/api-client"
import type { Equipment } from "@/types/domain"

export interface EquipmentListQuery {
  search?: string
  type?: string
  areaId?: string
  responsibleEmployeeId?: string
  isActive?: boolean
  sortBy?: "uniCode" | "brand" | "model" | "serialNumber" | "updatedAt"
  sortDirection?: "asc" | "desc"
  page?: number
  pageSize?: number
}

export function listEquipment(query: EquipmentListQuery = {}, signal?: AbortSignal) {
  return apiGet<PagedResponse<Equipment>>(`/equipment${buildQuery(query)}`, signal)
}

export function listAllEquipment(isActive?: boolean, signal?: AbortSignal) {
  return fetchAllPages(
    (page, currentSignal) => listEquipment({ isActive, page, pageSize: 100 }, currentSignal),
    signal,
  )
}

export function findEquipmentById(equipmentId: string, signal?: AbortSignal) {
  return apiGet<Equipment>(`/equipment/${equipmentId}`, signal)
}

export function createEquipment(values: EquipmentFormValues) {
  return apiPost<Equipment>("/equipment", toRequest(values))
}

export function updateEquipment(equipmentId: string, values: EquipmentFormValues) {
  return apiPut<Equipment>(`/equipment/${equipmentId}`, toRequest(values))
}

export function setEquipmentActive(equipmentId: string, isActive: boolean) {
  return apiPost<Equipment>(`/equipment/${equipmentId}/${isActive ? "activate" : "deactivate"}`)
}

function toRequest(values: EquipmentFormValues) {
  return {
    ...values,
    color: values.color || null,
    currentResponsibleEmployeeId: values.currentResponsibleEmployeeId || null,
    currentAreaId: values.currentAreaId || null,
  }
}
