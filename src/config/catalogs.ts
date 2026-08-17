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

export const supportTypes = [
  { value: "DIAGNOSIS", label: "Diagnóstico" },
  { value: "PREVENTIVE_MAINTENANCE", label: "Mantenimiento preventivo" },
  { value: "CORRECTIVE_MAINTENANCE", label: "Mantenimiento correctivo" },
  { value: "SOFTWARE_INSTALLATION", label: "Instalación de software" },
  { value: "CONFIGURATION", label: "Configuración" },
  { value: "REPAIR", label: "Reparación" },
  { value: "CLEANING", label: "Limpieza" },
  { value: "UPDATE", label: "Actualización" },
  { value: "HARDWARE_REVIEW", label: "Revisión de hardware" },
  { value: "SOFTWARE_REVIEW", label: "Revisión de software" },
  { value: "PRINTER_CONFIGURATION", label: "Configuración de impresora" },
  { value: "OTHER", label: "Otro" },
] as const

export type SupportType = (typeof supportTypes)[number]["value"]

export const userRoles = [
  { value: "ADMINISTRATOR", label: "Administrador" },
  { value: "TECHNICIAN", label: "Técnico" },
] as const

export type UserRole = (typeof userRoles)[number]["value"]
