import type { EquipmentType, UserRole } from "@/config/catalogs"

export type EntityId = string
export type IsoDateTime = string

interface AuditableEntity {
  id: EntityId
  createdAt: IsoDateTime
  updatedAt: IsoDateTime
}

export interface Area extends AuditableEntity {
  name: string
  isActive: boolean
  employeeCount: number
  equipmentCount: number
}

export interface Employee extends AuditableEntity {
  employeeNumber: string
  fullName: string
  nationalId: string
  areaId: EntityId
  areaName: string
  isActive: boolean
  equipmentCount: number
  hasUserAccount: boolean
}

export interface User {
  id: EntityId
  employeeId: EntityId
  employeeNumber: string
  fullName: string
  userName: string
  email: string
  role: UserRole
  isActive: boolean
  createdAt: IsoDateTime
}

export interface Equipment extends AuditableEntity {
  type: EquipmentType
  brand: string
  uniCode: string
  color?: string
  serialNumber: string
  model: string
  currentResponsibleEmployeeId?: EntityId
  currentResponsibleName?: string
  currentAreaId?: EntityId
  currentAreaName?: string
  isActive: boolean
  diagnosisCount: number
}

export interface DiagnosisSnapshot {
  responsible: {
    employeeNumber: string
    fullName: string
  }
  area: {
    name: string
  }
  equipment: Pick<
    Equipment,
    "type" | "brand" | "uniCode" | "color" | "serialNumber" | "model"
  >
  assignedTechnician: {
    fullName: string
  }
}

export interface TechnicalDiagnosis extends AuditableEntity {
  sequenceNumber: number
  code: string
  responsibleEmployeeId: EntityId
  areaId: EntityId
  equipmentId: EntityId
  assignedTechnicianUserId: EntityId
  createdByUserId: EntityId
  startedAt: IsoDateTime
  finishedAt: IsoDateTime
  supportPerformed: string
  technicalObservations: string
  diagnosis: string
  snapshot: DiagnosisSnapshot
}

export interface TechnicianOption {
  id: EntityId
  fullName: string
}
