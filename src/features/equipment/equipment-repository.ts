import { z } from "zod"

import { equipmentTypes, type EquipmentType } from "@/config/catalogs"
import type { EquipmentFormValues } from "@/features/equipment/equipment-schema"
import type { Equipment } from "@/types/domain"

const EQUIPMENT_STORAGE_KEY = "diagsoporte.equipment"
const equipmentTypeValues = equipmentTypes.map(({ value }) => value) as [
  EquipmentType,
  ...EquipmentType[],
]

const equipmentEntitySchema = z.object({
  id: z.string(),
  type: z.enum(equipmentTypeValues),
  brand: z.string(),
  uniCode: z.string(),
  color: z.string().optional(),
  serialNumber: z.string(),
  model: z.string(),
  currentResponsibleEmployeeId: z.string().optional(),
  currentAreaId: z.string().optional(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

const equipmentListSchema = z.array(equipmentEntitySchema)

const seedEquipment: Equipment[] = [
  createSeed("equipment-001", "LAPTOP", "Dell", "UNI-00234", "Gris", "8H2L9Q3", "Latitude 5420", "employee-001", "area-002", true),
  createSeed("equipment-002", "PRINTER", "HP", "UNI-00128", "Blanco", "VNC3K92184", "LaserJet Pro M404dn", "employee-002", "area-010", true),
  createSeed("equipment-003", "DESKTOP", "Dell", "UNI-00387", "Negro", "4K8P2M1", "OptiPlex 7090", "employee-003", "area-011", true),
  createSeed("equipment-004", "PROJECTOR", "Epson", "UNI-00412", "Blanco", "X8LM220394", "PowerLite X49", "employee-004", "area-004", true),
  createSeed("equipment-005", "MONITOR", "Lenovo", "UNI-00453", "Negro", "VNA5J28391", "ThinkVision T24i", "employee-005", "area-009", true),
  createSeed("equipment-006", "UPS", "APC", "UNI-00506", "Negro", "AS2217139482", "Back-UPS 900VA", "employee-006", "area-003", true),
  createSeed("equipment-007", "SCANNER", "Canon", "UNI-00568", "Negro", "KJX1048572", "imageFORMULA R40", "employee-007", "area-008", true),
  createSeed("equipment-008", "LAPTOP", "Lenovo", "UNI-00614", "Negro", "PF3K91XT", "ThinkPad E14", "employee-008", "area-001", true),
  createSeed("equipment-009", "DESKTOP", "HP", "UNI-00672", "Negro", "MXL2193K7P", "ProDesk 400 G7", "employee-009", "area-006", true),
  createSeed("equipment-010", "PRINTER", "Epson", "UNI-00735", "Negro", "X8QK021837", "EcoTank L6270", "employee-010", "area-015", true),
  createSeed("equipment-011", "LAPTOP", "Acer", "UNI-00791", "Plata", "NXA1AL0092", "TravelMate P2", "employee-011", "area-007", true),
  createSeed("equipment-012", "MONITOR", "Samsung", "UNI-00846", "Negro", "ZZM4H9N200", "S24R350", "employee-012", "area-012", false),
  createSeed("equipment-013", "OTHER", "Logitech", "UNI-00892", "Negro", "2019LZ8392", "MeetUp", undefined, "area-013", true),
]

export class DuplicateUniCodeError extends Error {
  constructor() {
    super("Ya existe un equipo con este Código UNI")
    this.name = "DuplicateUniCodeError"
  }
}

export class DuplicateSerialNumberError extends Error {
  constructor() {
    super("Ya existe un equipo con este número de serie")
    this.name = "DuplicateSerialNumberError"
  }
}

export function listEquipment(): Equipment[] {
  const storedEquipment = localStorage.getItem(EQUIPMENT_STORAGE_KEY)

  if (!storedEquipment) {
    writeEquipment(seedEquipment)
    return seedEquipment
  }

  try {
    const result = equipmentListSchema.safeParse(JSON.parse(storedEquipment))
    if (result.success) return result.data
  } catch {
    // Los datos demostrativos dañados se restauran desde la semilla.
  }

  writeEquipment(seedEquipment)
  return seedEquipment
}

export function findEquipmentById(equipmentId: string): Equipment | undefined {
  return listEquipment().find((equipment) => equipment.id === equipmentId)
}

export async function createEquipment(values: EquipmentFormValues): Promise<Equipment> {
  await simulateRequest()
  const equipmentList = listEquipment()
  assertUniqueIdentifiers(equipmentList, values)
  const timestamp = new Date().toISOString()
  const equipment: Equipment = {
    id: crypto.randomUUID(),
    ...toEntityValues(values),
    createdAt: timestamp,
    updatedAt: timestamp,
  }

  writeEquipment([equipment, ...equipmentList])
  return equipment
}

export async function updateEquipment(
  equipmentId: string,
  values: EquipmentFormValues,
): Promise<Equipment> {
  await simulateRequest()
  const equipmentList = listEquipment()
  const currentEquipment = equipmentList.find((equipment) => equipment.id === equipmentId)

  if (!currentEquipment) throw new Error("Equipo no encontrado")
  assertUniqueIdentifiers(equipmentList, values, equipmentId)

  const updatedEquipment: Equipment = {
    ...currentEquipment,
    ...toEntityValues(values),
    updatedAt: new Date().toISOString(),
  }

  writeEquipment(
    equipmentList.map((equipment) =>
      equipment.id === equipmentId ? updatedEquipment : equipment,
    ),
  )
  return updatedEquipment
}

export async function setEquipmentActive(
  equipmentId: string,
  isActive: boolean,
): Promise<Equipment> {
  const equipment = findEquipmentById(equipmentId)
  if (!equipment) throw new Error("Equipo no encontrado")

  return updateEquipment(equipmentId, {
    type: equipment.type,
    brand: equipment.brand,
    uniCode: equipment.uniCode,
    color: equipment.color ?? "",
    serialNumber: equipment.serialNumber,
    model: equipment.model,
    currentResponsibleEmployeeId: equipment.currentResponsibleEmployeeId ?? "",
    currentAreaId: equipment.currentAreaId ?? "",
    isActive,
  })
}

function toEntityValues(values: EquipmentFormValues) {
  return {
    ...values,
    color: values.color || undefined,
    currentResponsibleEmployeeId: values.currentResponsibleEmployeeId || undefined,
    currentAreaId: values.currentAreaId || undefined,
  }
}

function assertUniqueIdentifiers(
  equipmentList: Equipment[],
  values: Pick<EquipmentFormValues, "uniCode" | "serialNumber">,
  ignoredEquipmentId?: string,
) {
  const comparableEquipment = equipmentList.filter(
    (equipment) => equipment.id !== ignoredEquipmentId,
  )

  if (
    comparableEquipment.some(
      (equipment) => normalizeIdentifier(equipment.uniCode) === normalizeIdentifier(values.uniCode),
    )
  ) {
    throw new DuplicateUniCodeError()
  }

  if (
    comparableEquipment.some(
      (equipment) =>
        normalizeIdentifier(equipment.serialNumber) === normalizeIdentifier(values.serialNumber),
    )
  ) {
    throw new DuplicateSerialNumberError()
  }
}

function normalizeIdentifier(value: string) {
  return value.trim().replaceAll(" ", "").toLocaleUpperCase("es")
}

function writeEquipment(equipmentList: Equipment[]) {
  localStorage.setItem(EQUIPMENT_STORAGE_KEY, JSON.stringify(equipmentList))
}

function simulateRequest() {
  return new Promise((resolve) => setTimeout(resolve, 450))
}

function createSeed(
  id: string,
  type: EquipmentType,
  brand: string,
  uniCode: string,
  color: string,
  serialNumber: string,
  model: string,
  currentResponsibleEmployeeId: string | undefined,
  currentAreaId: string | undefined,
  isActive: boolean,
): Equipment {
  return {
    id,
    type,
    brand,
    uniCode,
    color,
    serialNumber,
    model,
    currentResponsibleEmployeeId,
    currentAreaId,
    isActive,
    createdAt: "2026-01-08T14:00:00.000Z",
    updatedAt: "2026-08-12T14:00:00.000Z",
  }
}
