import { z } from "zod"

import type { AreaFormValues } from "@/features/areas/area-schema"
import type { Area } from "@/types/domain"

const AREAS_STORAGE_KEY = "diagsoporte.areas"

const areaEntitySchema = z.object({
  id: z.string(),
  name: z.string(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

const areasSchema = z.array(areaEntitySchema)

const seedAreas: Area[] = [
  createSeed("area-001", "Administración", true, "2026-08-14T15:10:00.000Z"),
  createSeed("area-002", "Auditoría Interna", true, "2026-08-13T14:22:00.000Z"),
  createSeed("area-003", "Biblioteca", true, "2026-07-25T10:30:00.000Z"),
  createSeed("area-004", "Dirección", true, "2026-08-10T16:45:00.000Z"),
  createSeed("area-005", "Facultad de Arquitectura", true, "2026-06-18T13:00:00.000Z"),
  createSeed("area-006", "Facultad de Electrotecnia", true, "2026-06-19T13:00:00.000Z"),
  createSeed("area-007", "Facultad de Tecnología", true, "2026-06-20T13:00:00.000Z"),
  createSeed("area-008", "Jurídica", true, "2026-08-02T09:18:00.000Z"),
  createSeed("area-009", "Laboratorio de Computación", true, "2026-07-11T11:50:00.000Z"),
  createSeed("area-010", "Registro Académico", true, "2026-08-16T17:05:00.000Z"),
  createSeed("area-011", "Recursos Humanos", true, "2026-08-12T08:15:00.000Z"),
  createSeed("area-012", "Secretaría General", true, "2026-07-05T14:40:00.000Z"),
  createSeed("area-013", "Servicios Generales", true, "2026-06-28T12:25:00.000Z"),
  createSeed("area-014", "Tesorería", false, "2026-05-21T10:00:00.000Z"),
  createSeed("area-015", "Vicerrectoría Académica", true, "2026-07-30T09:35:00.000Z"),
]

export class DuplicateAreaNameError extends Error {
  constructor() {
    super("Ya existe un área registrada con este nombre")
    this.name = "DuplicateAreaNameError"
  }
}

export function listAreas(): Area[] {
  const storedAreas = localStorage.getItem(AREAS_STORAGE_KEY)

  if (!storedAreas) {
    writeAreas(seedAreas)
    return seedAreas
  }

  try {
    const result = areasSchema.safeParse(JSON.parse(storedAreas))

    if (result.success) return result.data
  } catch {
    // Los datos demostrativos dañados se restauran desde la semilla.
  }

  writeAreas(seedAreas)
  return seedAreas
}

export function findAreaById(areaId: string): Area | undefined {
  return listAreas().find((area) => area.id === areaId)
}

export async function createArea(values: AreaFormValues): Promise<Area> {
  await simulateRequest()
  const areas = listAreas()
  assertUniqueName(areas, values.name)

  const timestamp = new Date().toISOString()
  const area: Area = {
    id: crypto.randomUUID(),
    name: values.name,
    isActive: values.isActive,
    createdAt: timestamp,
    updatedAt: timestamp,
  }

  writeAreas([area, ...areas])
  return area
}

export async function updateArea(areaId: string, values: AreaFormValues): Promise<Area> {
  await simulateRequest()
  const areas = listAreas()
  const currentArea = areas.find((area) => area.id === areaId)

  if (!currentArea) throw new Error("Área no encontrada")

  assertUniqueName(areas, values.name, areaId)

  const updatedArea: Area = {
    ...currentArea,
    ...values,
    updatedAt: new Date().toISOString(),
  }

  writeAreas(areas.map((area) => (area.id === areaId ? updatedArea : area)))
  return updatedArea
}

export async function setAreaActive(areaId: string, isActive: boolean): Promise<Area> {
  const area = findAreaById(areaId)

  if (!area) throw new Error("Área no encontrada")

  return updateArea(areaId, { name: area.name, isActive })
}

function assertUniqueName(areas: Area[], name: string, ignoredAreaId?: string) {
  const normalizedName = normalizeName(name)
  const alreadyExists = areas.some(
    (area) => area.id !== ignoredAreaId && normalizeName(area.name) === normalizedName,
  )

  if (alreadyExists) throw new DuplicateAreaNameError()
}

function normalizeName(value: string) {
  return value.trim().toLocaleLowerCase("es")
}

function writeAreas(areas: Area[]) {
  localStorage.setItem(AREAS_STORAGE_KEY, JSON.stringify(areas))
}

function simulateRequest() {
  return new Promise((resolve) => setTimeout(resolve, 450))
}

function createSeed(id: string, name: string, isActive: boolean, updatedAt: string): Area {
  return {
    id,
    name,
    isActive,
    createdAt: "2026-01-08T14:00:00.000Z",
    updatedAt,
  }
}
