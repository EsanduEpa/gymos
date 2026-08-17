// CSV writing that survives both Excel and user-supplied text.

/**
 * Characters that make a spreadsheet treat a cell as a formula rather than
 * text. A member named `=cmd|' /c calc'!A1` is a working attack against
 * whoever opens the export, so any cell starting with one of these is prefixed
 * with a single quote — the conventional "treat as text" marker.
 */
const FORMULA_TRIGGERS = ["=", "+", "-", "@", "\t", "\r"]

export function csvCell(value: unknown): string {
  if (value === null || value === undefined) return '""'

  let text = String(value)

  if (FORMULA_TRIGGERS.some((c) => text.startsWith(c))) {
    text = `'${text}`
  }

  // RFC 4180: quotes inside a quoted field are escaped by doubling them.
  // Without this, a description containing a quote silently corrupts every
  // remaining column on the row.
  return `"${text.replace(/"/g, '""')}"`
}

/** A number formatted for a spreadsheet — unquoted so it stays numeric. */
export function csvNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return ""
  return String(value)
}

export function csvRow(cells: string[]): string {
  return cells.join(",") + "\r\n"
}

/**
 * A UTF-8 byte order mark. Without it Excel on Windows reads the file as the
 * local codepage and mangles any non-ASCII name.
 */
export const CSV_BOM = "﻿"
