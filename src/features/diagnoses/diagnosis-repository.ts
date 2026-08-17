import { z } from "zod"

import { supportTypes, type SupportType } from "@/config/catalogs"
import { findAreaById } from "@/features/areas/area-repository"
import type { DiagnosisFormValues } from "@/features/diagnoses/diagnosis-schema"
import { findTechnicianByUserId } from "@/features/diagnoses/technician-options"
import { findEquipmentById } from "@/features/equipment/equipment-repository"
import { findEmployeeById } from "@/features/employees/employee-repository"
import type { DiagnosisSnapshot, TechnicalDiagnosis } from "@/types/domain"

const DIAGNOSES_STORAGE_KEY = "diagsoporte.diagnoses"
const supportTypeValues = supportTypes.map(({ value }) => value) as [SupportType, ...SupportType[]]

const diagnosisSnapshotSchema = z.object({
  responsible: z.object({ employeeNumber: z.string(), fullName: z.string() }),
  area: z.object({ name: z.string() }),
  equipment: z.object({
    type: z.enum(["LAPTOP", "DESKTOP", "PRINTER", "PROJECTOR", "MONITOR", "UPS", "SCANNER", "OTHER"]),
    brand: z.string(),
    uniCode: z.string(),
    color: z.string().optional(),
    serialNumber: z.string(),
    model: z.string(),
  }),
  assignedTechnician: z.object({ fullName: z.string() }),
})

const diagnosisEntitySchema = z.object({
  id: z.string(),
  code: z.string(),
  responsibleEmployeeId: z.string(),
  areaId: z.string(),
  equipmentId: z.string(),
  assignedTechnicianUserId: z.string(),
  createdByUserId: z.string(),
  startedAt: z.string(),
  finishedAt: z.string(),
  supportType: z.enum(supportTypeValues),
  supportTypeDetail: z.string().optional(),
  technicalObservations: z.string(),
  diagnosis: z.string(),
  snapshot: diagnosisSnapshotSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
})

const diagnosesSchema = z.array(diagnosisEntitySchema)

const seedDiagnoses: TechnicalDiagnosis[] = [
  createSeed({
    id: "diagnosis-001", code: "DG-000245", responsibleEmployeeId: "employee-001", areaId: "area-002", equipmentId: "equipment-001", assignedTechnicianUserId: "user-demo-001", startedAt: "2026-08-16T14:15:00.000Z", finishedAt: "2026-08-16T15:30:00.000Z", supportType: "DIAGNOSIS", technicalObservations: "Se verificó el funcionamiento del disco duro, memoria RAM, sistema operativo y conectividad. Se detectó lentitud durante el inicio.", diagnosis: "El equipo presenta degradación del disco duro. Se recomienda reemplazar la unidad por un dispositivo SSD.", snapshot: snapshot("000184", "Juan Carlos Pérez López", "Auditoría Interna", "LAPTOP", "Dell", "UNI-00234", "Gris", "8H2L9Q3", "Latitude 5420", "Dorian Lanuza"),
  }),
  createSeed({
    id: "diagnosis-002", code: "DG-000244", responsibleEmployeeId: "employee-002", areaId: "area-010", equipmentId: "equipment-002", assignedTechnicianUserId: "user-demo-002", startedAt: "2026-08-15T13:10:00.000Z", finishedAt: "2026-08-15T14:05:00.000Z", supportType: "PRINTER_CONFIGURATION", technicalObservations: "Se revisó conectividad de red, cola de impresión y configuración del controlador institucional.", diagnosis: "La impresora funciona correctamente después de reinstalar el controlador y actualizar la dirección de red.", snapshot: snapshot("000237", "María Elena González Ruiz", "Registro Académico", "PRINTER", "HP", "UNI-00128", "Blanco", "VNC3K92184", "LaserJet Pro M404dn", "Carlos Mendoza"),
  }),
  createSeed({
    id: "diagnosis-003", code: "DG-000243", responsibleEmployeeId: "employee-004", areaId: "area-004", equipmentId: "equipment-004", assignedTechnicianUserId: "user-demo-001", startedAt: "2026-07-10T14:00:00.000Z", finishedAt: "2026-07-10T15:20:00.000Z", supportType: "HARDWARE_REVIEW", technicalObservations: "El equipo enciende, pero no completa correctamente el proceso de inicio. Durante el encendido se muestra un mensaje relacionado con el sistema de iris automático.", diagnosis: "El proyector presenta una falla en el mecanismo de iris automático que impide su funcionamiento normal. Actualmente no se encuentra en condiciones óptimas para su uso.", snapshot: snapshot("000428", "Ana Lucía Hernández", "Dirección", "PROJECTOR", "Epson", "UNI-00412", "Blanco", "X8LM220394", "PowerLite X49", "Dorian Lanuza"),
  }),
  createSeed({
    id: "diagnosis-004", code: "DG-000242", responsibleEmployeeId: "employee-003", areaId: "area-011", equipmentId: "equipment-003", assignedTechnicianUserId: "user-demo-001", startedAt: "2026-07-02T15:00:00.000Z", finishedAt: "2026-07-02T16:10:00.000Z", supportType: "PREVENTIVE_MAINTENANCE", technicalObservations: "Se realizó limpieza interna, revisión de ventiladores, memoria y almacenamiento, además de actualización del sistema.", diagnosis: "El equipo queda operativo y sin alertas de hardware después del mantenimiento preventivo.", snapshot: snapshot("000312", "Carlos Alberto Mendoza", "Recursos Humanos", "DESKTOP", "Dell", "UNI-00387", "Negro", "4K8P2M1", "OptiPlex 7090", "Dorian Lanuza"),
  }),
]

export function listDiagnoses(): TechnicalDiagnosis[] {
  const storedDiagnoses = localStorage.getItem(DIAGNOSES_STORAGE_KEY)
  if (!storedDiagnoses) {
    writeDiagnoses(seedDiagnoses)
    return seedDiagnoses
  }

  try {
    const result = diagnosesSchema.safeParse(JSON.parse(storedDiagnoses))
    if (result.success) return result.data
  } catch {
    // Los datos demostrativos dañados se restauran desde la semilla.
  }

  writeDiagnoses(seedDiagnoses)
  return seedDiagnoses
}

export function findDiagnosisById(diagnosisId: string): TechnicalDiagnosis | undefined {
  return listDiagnoses().find((diagnosis) => diagnosis.id === diagnosisId)
}

export function listDiagnosesByEquipmentId(equipmentId: string): TechnicalDiagnosis[] {
  return listDiagnoses()
    .filter((diagnosis) => diagnosis.equipmentId === equipmentId)
    .sort((left, right) => right.startedAt.localeCompare(left.startedAt))
}

export async function createDiagnosis(values: DiagnosisFormValues): Promise<TechnicalDiagnosis> {
  await simulateRequest()
  const diagnoses = listDiagnoses()
  const timestamp = new Date().toISOString()
  const diagnosis: TechnicalDiagnosis = {
    id: crypto.randomUUID(),
    code: nextDiagnosisCode(diagnoses),
    ...toEntityValues(values),
    createdByUserId: "user-demo-001",
    snapshot: buildSnapshot(values),
    createdAt: timestamp,
    updatedAt: timestamp,
  }

  writeDiagnoses([diagnosis, ...diagnoses])
  return diagnosis
}

export async function updateDiagnosis(
  diagnosisId: string,
  values: DiagnosisFormValues,
): Promise<TechnicalDiagnosis> {
  await simulateRequest()
  const diagnoses = listDiagnoses()
  const currentDiagnosis = diagnoses.find((diagnosis) => diagnosis.id === diagnosisId)
  if (!currentDiagnosis) throw new Error("Diagnóstico no encontrado")

  const updatedDiagnosis: TechnicalDiagnosis = {
    ...currentDiagnosis,
    ...toEntityValues(values),
    snapshot: buildSnapshot(values),
    updatedAt: new Date().toISOString(),
  }
  writeDiagnoses(diagnoses.map((diagnosis) => diagnosis.id === diagnosisId ? updatedDiagnosis : diagnosis))
  return updatedDiagnosis
}

function buildSnapshot(values: DiagnosisFormValues): DiagnosisSnapshot {
  const responsible = findEmployeeById(values.responsibleEmployeeId)
  const area = findAreaById(values.areaId)
  const equipment = findEquipmentById(values.equipmentId)
  const technician = findTechnicianByUserId(values.assignedTechnicianUserId)

  if (!responsible || !area || !equipment || !technician) {
    throw new Error("No fue posible resolver los datos relacionados")
  }

  return {
    responsible: { employeeNumber: responsible.employeeNumber, fullName: responsible.fullName },
    area: { name: area.name },
    equipment: {
      type: equipment.type,
      brand: equipment.brand,
      uniCode: equipment.uniCode,
      color: equipment.color,
      serialNumber: equipment.serialNumber,
      model: equipment.model,
    },
    assignedTechnician: { fullName: technician.fullName },
  }
}

function toEntityValues(values: DiagnosisFormValues) {
  return {
    ...values,
    startedAt: new Date(values.startedAt).toISOString(),
    finishedAt: new Date(values.finishedAt).toISOString(),
    supportTypeDetail: values.supportType === "OTHER" ? values.supportTypeDetail : undefined,
  }
}

function nextDiagnosisCode(diagnoses: TechnicalDiagnosis[]) {
  const greatestNumber = diagnoses.reduce((greatest, diagnosis) => {
    const numericCode = Number(diagnosis.code.replace(/\D/g, ""))
    return Number.isFinite(numericCode) ? Math.max(greatest, numericCode) : greatest
  }, 0)
  return `DG-${String(greatestNumber + 1).padStart(6, "0")}`
}

function writeDiagnoses(diagnoses: TechnicalDiagnosis[]) {
  localStorage.setItem(DIAGNOSES_STORAGE_KEY, JSON.stringify(diagnoses))
}

function simulateRequest() {
  return new Promise((resolve) => setTimeout(resolve, 550))
}

interface SeedValues extends Omit<TechnicalDiagnosis, "createdByUserId" | "createdAt" | "updatedAt" | "supportTypeDetail"> {
  supportTypeDetail?: string
}

function createSeed(values: SeedValues): TechnicalDiagnosis {
  return {
    ...values,
    createdByUserId: "user-demo-001",
    createdAt: values.startedAt,
    updatedAt: values.finishedAt,
  }
}

function snapshot(
  employeeNumber: string,
  fullName: string,
  areaName: string,
  type: DiagnosisSnapshot["equipment"]["type"],
  brand: string,
  uniCode: string,
  color: string,
  serialNumber: string,
  model: string,
  technicianName: string,
): DiagnosisSnapshot {
  return {
    responsible: { employeeNumber, fullName },
    area: { name: areaName },
    equipment: { type, brand, uniCode, color, serialNumber, model },
    assignedTechnician: { fullName: technicianName },
  }
}
