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
}

export interface Employee extends AuditableEntity {
  employeeNumber: string
  fullName: string
  nationalId: string
  areaId: EntityId
  isActive: boolean
}

export interface User extends AuditableEntity {
  employeeId: EntityId
  username: string
  role: UserRole
  isActive: boolean
}

export interface Equipment extends AuditableEntity {
  type: EquipmentType
  brand: string
  uniCode: string
  color?: string
  serialNumber: string
  model: string
  currentResponsibleEmployeeId?: EntityId
  currentAreaId?: EntityId
  isActive: boolean
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
