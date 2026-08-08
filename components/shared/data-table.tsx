import React from "react"

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
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = "No records found.",
}: DataTableProps<T>) {
  return (
    <div className="w-full bg-white rounded-xl border border-[#E1E1E4] shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#F5F4F5] border-b border-[#E1E1E4] text-[#8B8E98] uppercase text-[10px] tracking-wider font-bold">
              {columns.map((col, idx) => (
                <th key={idx} className={`py-3 px-4 ${col.className || ""}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E1E1E4] text-[#171B28]">
            {data.map((row) => (
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
                <td
                  colSpan={columns.length}
                  className="py-8 text-center text-xs text-[#8B8E98]"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
