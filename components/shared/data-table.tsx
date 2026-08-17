"use client"

import React, { useEffect, useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, Inbox } from "lucide-react"

export interface Column<T> {
  header: string
  accessor: keyof T | ((row: T) => React.ReactNode)
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyExtractor: (row: T) => string
  emptyMessage?: string
  /** Shown under the empty message — e.g. "Try a different search." */
  emptyHint?: string
  /** Rows per page. Pagination only appears once the data exceeds it. */
  pageSize?: number
  /** Describes the table for screen readers, e.g. "Members". */
  label?: string
}

const DEFAULT_PAGE_SIZE = 25

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = "No records found.",
  emptyHint,
  pageSize = DEFAULT_PAGE_SIZE,
  label,
}: DataTableProps<T>) {
  const [page, setPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize))

  // Filtering can shrink the data under the current page — without this, a
  // search that narrows results shows an empty table instead of the matches.
  useEffect(() => {
    setPage((current) => Math.min(current, totalPages))
  }, [totalPages])

  const visible = useMemo(
    () => data.slice((page - 1) * pageSize, page * pageSize),
    [data, page, pageSize]
  )

  const showPagination = data.length > pageSize
  const firstRow = (page - 1) * pageSize + 1
  const lastRow = Math.min(page * pageSize, data.length)

  return (
    <div className="w-full bg-white rounded-xl border border-[#E1E1E4] shadow-sm overflow-hidden">
      {/* Wide tables scroll inside their own container so the page body never
          scrolls sideways on a phone. */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse" aria-label={label}>
          <thead>
            <tr className="bg-[#F5F4F5] border-b border-[#E1E1E4] text-[#8B8E98] uppercase text-[10px] tracking-wider font-bold">
              {columns.map((col, idx) => (
                <th key={idx} scope="col" className={`py-3 px-4 whitespace-nowrap ${col.className || ""}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E1E1E4] text-[#171B28]">
            {visible.map((row) => (
              <tr
                key={keyExtractor(row)}
                className="hover:bg-[#F9FAFB] transition-colors duration-100"
              >
                {columns.map((col, idx) => {
                  const content =
                    typeof col.accessor === "function"
                      ? col.accessor(row)
                      : (row[col.accessor] as React.ReactNode)

                  return (
                    <td key={idx} className={`py-3.5 px-4 ${col.className || ""}`}>
                      {content}
                    </td>
                  )
                })}
              </tr>
            ))}

            {data.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="py-12">
                  <div className="flex flex-col items-center justify-center gap-2 text-center px-4">
                    <div className="h-10 w-10 rounded-full bg-[#F5F4F5] flex items-center justify-center text-[#8B8E98]">
                      <Inbox className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-semibold text-[#171B28]">{emptyMessage}</p>
                    {emptyHint && <p className="text-xs text-[#8B8E98] max-w-xs">{emptyHint}</p>}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showPagination && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-[#E1E1E4] bg-[#FCFCFD]">
          <p className="text-xs text-[#8B8E98]" aria-live="polite">
            Showing <span className="font-semibold text-[#4A4D58]">{firstRow}–{lastRow}</span> of{" "}
            <span className="font-semibold text-[#4A4D58]">{data.length}</span>
          </p>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              aria-label="Previous page"
              className="p-1.5 rounded-md border border-[#E1E1E4] text-[#4A4D58] hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#007A35]"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-semibold text-[#4A4D58] tabular-nums px-1">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              aria-label="Next page"
              className="p-1.5 rounded-md border border-[#E1E1E4] text-[#4A4D58] hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#007A35]"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
