export interface TechnicianOption {
  userId: string
  employeeId: string
  fullName: string
}

export const technicianOptions: TechnicianOption[] = [
  {
    userId: "user-demo-001",
    employeeId: "employee-technician-001",
    fullName: "Dorian Lanuza",
  },
  {
    userId: "user-demo-002",
    employeeId: "employee-technician-002",
    fullName: "Carlos Mendoza",
  },
]

export function findTechnicianByUserId(userId: string) {
  return technicianOptions.find((technician) => technician.userId === userId)
}
