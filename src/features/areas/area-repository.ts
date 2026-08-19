import type { AreaFormValues } from "@/features/areas/area-schema"
import {
  apiGet,
  apiPost,
  apiPut,
  buildQuery,
  fetchAllPages,
  type PagedResponse,
} from "@/lib/api-client"
import type { Area } from "@/types/domain"

export interface AreaListQuery {
  search?: string
  isActive?: boolean
  sortBy?: "name" | "createdAt" | "updatedAt"
  sortDirection?: "asc" | "desc"
  page?: number
  pageSize?: number
}

export function listAreas(query: AreaListQuery = {}, signal?: AbortSignal) {
  return apiGet<PagedResponse<Area>>(`/areas${buildQuery(query)}`, signal)
}

export function listAllAreas(isActive?: boolean, signal?: AbortSignal) {
  return fetchAllPages(
    (page, currentSignal) => listAreas({ isActive, page, pageSize: 100 }, currentSignal),
    signal,
  )
}

export function findAreaById(areaId: string, signal?: AbortSignal) {
  return apiGet<Area>(`/areas/${areaId}`, signal)
}

export function createArea(values: AreaFormValues) {
  return apiPost<Area>("/areas", values)
}

export function updateArea(areaId: string, values: AreaFormValues) {
  return apiPut<Area>(`/areas/${areaId}`, values)
}

export function setAreaActive(areaId: string, isActive: boolean) {
  return apiPost<Area>(`/areas/${areaId}/${isActive ? "activate" : "deactivate"}`)
}
