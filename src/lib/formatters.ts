const dateFormatter = new Intl.DateTimeFormat("es-NI", {
  day: "2-digit",
  month: "short",
  year: "numeric",
})

const longDateFormatter = new Intl.DateTimeFormat("es-NI", {
  day: "numeric",
  month: "long",
  year: "numeric",
})

const dateTimeFormatter = new Intl.DateTimeFormat("es-NI", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

export function formatShortDate(value: string) {
  return dateFormatter.format(new Date(value)).replace(".", "")
}

export function formatLongDate(value: string) {
  return longDateFormatter.format(new Date(value))
}

export function formatDateTime(value: string) {
  return dateTimeFormatter.format(new Date(value))
}

export function toDateTimeLocal(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value
  const pad = (part: number) => String(part).padStart(2, "0")

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}
