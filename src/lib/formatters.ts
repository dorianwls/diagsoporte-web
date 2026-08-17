const dateFormatter = new Intl.DateTimeFormat("es-NI", {
  day: "2-digit",
  month: "short",
  year: "numeric",
})

export function formatShortDate(value: string) {
  return dateFormatter.format(new Date(value)).replace(".", "")
}
