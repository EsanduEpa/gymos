"use client"

interface FormattedDateProps {
  date: string | Date | null | undefined
  type?: "date" | "time" | "datetime"
  className?: string
}

export function FormattedDate({ date, type = "date", className = "" }: FormattedDateProps) {
  if (!date) return <span className={className}>—</span>

  const d = new Date(date)
  let text = ""

  if (type === "time") {
    text = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  } else if (type === "datetime") {
    text = d.toLocaleString()
  } else {
    text = d.toLocaleDateString()
  }

  return <span suppressHydrationWarning className={className}>{text}</span>
}
