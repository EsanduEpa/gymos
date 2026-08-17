"use client"

import { useState } from "react"
import { createExpense, setCategoryBudget, recordManualPayment } from "@/app/actions/financials"

export function LogExpenseDialog({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const res = await createExpense(formData)

    setLoading(false)
    if (res.error) {
      setError(res.error)
    } else {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl border border-gray-200">
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-lg font-bold text-gray-900">Log New Expense</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Amount ($)</label>
            <input
              name="amount"
              type="number"
              step="0.01"
              required
              placeholder="e.g. 450.00"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#007A35] outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Category</label>
            <select
              name="category"
              required
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#007A35] outline-none text-sm"
            >
              <option value="RENT">Rent</option>
              <option value="UTILITIES">Utilities</option>
              <option value="EQUIPMENT">Equipment</option>
              <option value="MARKETING">Marketing</option>
              <option value="SALARIES">Salaries</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Date</label>
            <input
              name="date"
              type="date"
              required
              defaultValue={new Date().toISOString().split("T")[0]}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#007A35] outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Description</label>
            <input
              name="description"
              type="text"
              placeholder="e.g. Electricity bill for main floor"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#007A35] outline-none text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isRecurring"
              name="isRecurring"
              value="true"
              className="rounded text-[#007A35] focus:ring-[#007A35]"
            />
            <label htmlFor="isRecurring" className="text-sm text-gray-700">Recurring Monthly Expense</label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-[#007A35] hover:bg-[#005c28] rounded-lg disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function SetBudgetDialog({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const res = await setCategoryBudget(formData)

    setLoading(false)
    if (res.error) {
      setError(res.error)
    } else {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl border border-gray-200">
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-lg font-bold text-gray-900">Set Category Budget</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Category</label>
            <select
              name="category"
              required
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#007A35] outline-none text-sm"
            >
              <option value="RENT">Rent</option>
              <option value="UTILITIES">Utilities</option>
              <option value="EQUIPMENT">Equipment</option>
              <option value="MARKETING">Marketing</option>
              <option value="SALARIES">Salaries</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Monthly Budget Limit ($)</label>
            <input
              name="amount"
              type="number"
              step="0.01"
              required
              placeholder="e.g. 500.00"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#007A35] outline-none text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-[#007A35] hover:bg-[#005c28] rounded-lg disabled:opacity-50"
            >
              {loading ? "Updating..." : "Set Budget"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function RecordDeskPaymentDialog({
  isOpen,
  onClose,
  members,
}: {
  isOpen: boolean
  onClose: () => void
  members: Array<{ id: string; fullName: string }>
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const res = await recordManualPayment(formData)

    setLoading(false)
    if (res.error) {
      setError(res.error)
    } else {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl border border-gray-200">
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-lg font-bold text-gray-900">Record Desk / Cash Payment</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Select Member</label>
            <select
              name="memberId"
              required
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#007A35] outline-none text-sm"
            >
              <option value="">-- Choose Member --</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.fullName}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Payment Type</label>
            <select
              name="type"
              required
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#007A35] outline-none text-sm"
            >
              <option value="MEMBERSHIP">Membership Fee</option>
              <option value="ADD_ON">Add-on / Retail Goods</option>
            </select>
            <p className="text-xs text-gray-500 mt-1.5">
              Selling a PT session pack? Issue it from the member&apos;s profile instead —
              that records the sale and gives them the sessions.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Amount ($)</label>
            <input
              name="amount"
              type="number"
              step="0.01"
              required
              placeholder="e.g. 450.00"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#007A35] outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Description / Receipt Note</label>
            <input
              name="description"
              type="text"
              placeholder="Cash payment at front desk"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#007A35] outline-none text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-[#007A35] hover:bg-[#005c28] rounded-lg disabled:opacity-50"
            >
              {loading ? "Processing..." : "Record Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
