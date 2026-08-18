export const equipmentTypes = [
  { value: "LAPTOP", label: "Laptop" },
  { value: "DESKTOP", label: "Desktop" },
  { value: "PRINTER", label: "Impresora" },
  { value: "PROJECTOR", label: "DataShow / Proyector" },
  { value: "MONITOR", label: "Monitor" },
  { value: "UPS", label: "UPS" },
  { value: "SCANNER", label: "Scanner" },
  { value: "OTHER", label: "Otro" },
] as const

export type EquipmentType = (typeof equipmentTypes)[number]["value"]

export const userRoles = [
  { value: "ADMINISTRATOR", label: "Administrador" },
  { value: "TECHNICIAN", label: "Técnico" },
] as const

export type UserRole = (typeof userRoles)[number]["value"]
