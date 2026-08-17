import { z } from "zod"

import type { EmployeeFormValues } from "@/features/employees/employee-schema"
import type { Employee } from "@/types/domain"

const EMPLOYEES_STORAGE_KEY = "diagsoporte.employees"

const employeeEntitySchema = z.object({
  id: z.string(),
  employeeNumber: z.string(),
  fullName: z.string(),
  nationalId: z.string(),
  areaId: z.string(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

const employeesSchema = z.array(employeeEntitySchema)

const seedEmployees: Employee[] = [
  createSeed("employee-001", "000184", "Juan Carlos Pérez López", "001-120485-0012A", "area-002", true, "2026-08-16T14:20:00.000Z"),
  createSeed("employee-002", "000237", "María Elena González Ruiz", "001-230990-0034B", "area-010", true, "2026-08-15T10:40:00.000Z"),
  createSeed("employee-003", "000312", "Carlos Alberto Mendoza", "001-070782-0061C", "area-011", true, "2026-08-14T16:12:00.000Z"),
  createSeed("employee-004", "000428", "Ana Lucía Hernández", "001-181193-0048D", "area-004", true, "2026-08-13T08:45:00.000Z"),
  createSeed("employee-005", "000519", "Roberto José Castillo", "001-020376-0079E", "area-009", true, "2026-08-12T13:30:00.000Z"),
  createSeed("employee-006", "000603", "Sofía Martínez Blandón", "001-260888-0026F", "area-003", true, "2026-08-11T09:15:00.000Z"),
  createSeed("employee-007", "000691", "Miguel Ángel López", "001-111180-0055G", "area-008", true, "2026-08-09T11:52:00.000Z"),
  createSeed("employee-008", "000745", "Claudia Patricia Reyes", "001-040592-0082H", "area-001", true, "2026-08-07T15:08:00.000Z"),
  createSeed("employee-009", "000812", "Jorge Luis Ramírez", "001-150679-0018J", "area-006", true, "2026-08-05T12:25:00.000Z"),
  createSeed("employee-010", "000874", "Gabriela Alejandra Flores", "001-291095-0037K", "area-015", true, "2026-08-03T10:18:00.000Z"),
  createSeed("employee-011", "000931", "Fernando Antonio Silva", "001-090885-0063L", "area-007", true, "2026-07-28T14:00:00.000Z"),
  createSeed("employee-012", "001024", "Patricia del Carmen Cruz", "001-170487-0091M", "area-012", true, "2026-07-22T09:35:00.000Z"),
  createSeed("employee-013", "001108", "Luis Enrique Rocha", "001-301178-0044N", "area-013", false, "2026-06-30T16:20:00.000Z"),
]

export class DuplicateEmployeeNumberError extends Error {
  constructor() {
    super("Ya existe un empleado con este número")
    this.name = "DuplicateEmployeeNumberError"
  }
}

export class DuplicateNationalIdError extends Error {
  constructor() {
    super("Ya existe un empleado con esta cédula")
    this.name = "DuplicateNationalIdError"
  }
}

export function listEmployees(): Employee[] {
  const storedEmployees = localStorage.getItem(EMPLOYEES_STORAGE_KEY)

  if (!storedEmployees) {
    writeEmployees(seedEmployees)
    return seedEmployees
  }

  try {
    const result = employeesSchema.safeParse(JSON.parse(storedEmployees))
    if (result.success) return result.data
  } catch {
    // Los datos demostrativos dañados se restauran desde la semilla.
  }

  writeEmployees(seedEmployees)
  return seedEmployees
}

export function findEmployeeById(employeeId: string): Employee | undefined {
  return listEmployees().find((employee) => employee.id === employeeId)
}

export async function createEmployee(values: EmployeeFormValues): Promise<Employee> {
  await simulateRequest()
  const employees = listEmployees()
  assertUniqueIdentifiers(employees, values)
  const timestamp = new Date().toISOString()
  const employee: Employee = {
    id: crypto.randomUUID(),
    ...values,
    createdAt: timestamp,
    updatedAt: timestamp,
  }

  writeEmployees([employee, ...employees])
  return employee
}

export async function updateEmployee(
  employeeId: string,
  values: EmployeeFormValues,
): Promise<Employee> {
  await simulateRequest()
  const employees = listEmployees()
  const currentEmployee = employees.find((employee) => employee.id === employeeId)

  if (!currentEmployee) throw new Error("Empleado no encontrado")
  assertUniqueIdentifiers(employees, values, employeeId)

  const updatedEmployee: Employee = {
    ...currentEmployee,
    ...values,
    updatedAt: new Date().toISOString(),
  }

  writeEmployees(
    employees.map((employee) => (employee.id === employeeId ? updatedEmployee : employee)),
  )
  return updatedEmployee
}

export async function setEmployeeActive(
  employeeId: string,
  isActive: boolean,
): Promise<Employee> {
  const employee = findEmployeeById(employeeId)
  if (!employee) throw new Error("Empleado no encontrado")

  return updateEmployee(employeeId, {
    employeeNumber: employee.employeeNumber,
    fullName: employee.fullName,
    nationalId: employee.nationalId,
    areaId: employee.areaId,
    isActive,
  })
}

function assertUniqueIdentifiers(
  employees: Employee[],
  values: Pick<EmployeeFormValues, "employeeNumber" | "nationalId">,
  ignoredEmployeeId?: string,
) {
  const comparableEmployees = employees.filter((employee) => employee.id !== ignoredEmployeeId)

  if (
    comparableEmployees.some(
      (employee) => normalizeIdentifier(employee.employeeNumber) === normalizeIdentifier(values.employeeNumber),
    )
  ) {
    throw new DuplicateEmployeeNumberError()
  }

  if (
    comparableEmployees.some(
      (employee) => normalizeIdentifier(employee.nationalId) === normalizeIdentifier(values.nationalId),
    )
  ) {
    throw new DuplicateNationalIdError()
  }
}

function normalizeIdentifier(value: string) {
  return value.trim().replaceAll(" ", "").toLocaleLowerCase("es")
}

function writeEmployees(employees: Employee[]) {
  localStorage.setItem(EMPLOYEES_STORAGE_KEY, JSON.stringify(employees))
}

function simulateRequest() {
  return new Promise((resolve) => setTimeout(resolve, 450))
}

function createSeed(
  id: string,
  employeeNumber: string,
  fullName: string,
  nationalId: string,
  areaId: string,
  isActive: boolean,
  updatedAt: string,
): Employee {
  return {
    id,
    employeeNumber,
    fullName,
    nationalId,
    areaId,
    isActive,
    createdAt: "2026-01-08T14:00:00.000Z",
    updatedAt,
  }
}
