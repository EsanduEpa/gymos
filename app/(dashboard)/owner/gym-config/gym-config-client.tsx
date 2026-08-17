"use client"

import { useState } from "react"
import { PageHeader } from "@/components/shared/page-header"
import {
  updateGymProfile,
  createMembershipPlan,
  updateTrainerPayRates,
  updateSessionRates,
  updateCancellationPolicy,
} from "@/app/actions/gym-config"
import { checkMembershipExpiries } from "@/app/actions/members"
import { Settings, Tag, DollarSign, AlertCircle, CheckCircle2, ShieldAlert, Receipt } from "lucide-react"

interface GymConfigClientProps {
  gym: any
}

export function GymConfigClient({ gym }: GymConfigClientProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "plans" | "fees" | "rates" | "policy">("profile")
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [showAddPlan, setShowAddPlan] = useState(false)

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMessage(null)
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const res = await updateGymProfile(formData)
    setLoading(false)
    if (res.error) {
      setMessage({ type: "error", text: res.error })
    } else {
      setMessage({ type: "success", text: "Gym profile settings updated successfully!" })
    }
  }

  const handleAddPlanSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMessage(null)
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const res = await createMembershipPlan(formData)
    setLoading(false)
    if (res.error) {
      setMessage({ type: "error", text: res.error })
    } else {
      setMessage({ type: "success", text: "Membership plan created successfully!" })
      setShowAddPlan(false)
    }
  }

  const handleSessionRatesSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMessage(null)
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const res = await updateSessionRates(formData)
    setLoading(false)
    if (res.error) {
      setMessage({ type: "error", text: res.error })
    } else {
      setMessage({ type: "success", text: "PT session rates updated. Packs and sessions already sold keep their original price." })
    }
  }

  const handleRatesSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMessage(null)
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const res = await updateTrainerPayRates(formData)
    setLoading(false)
    if (res.error) {
      setMessage({ type: "error", text: res.error })
    } else {
      setMessage({ type: "success", text: "Trainer pay rates updated successfully!" })
    }
  }

  const handlePolicySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMessage(null)
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const res = await updateCancellationPolicy(formData)
    setLoading(false)
    if (res.error) {
      setMessage({ type: "error", text: res.error })
    } else {
      setMessage({ type: "success", text: "Cancellation policy updated successfully!" })
    }
  }

  const handleManualExpiryCheck = async () => {
    setMessage(null)
    const res = await checkMembershipExpiries()
    if (res.error) {
      setMessage({ type: "error", text: res.error })
    } else {
      setMessage({ type: "success", text: `Automated expiry check complete. ${res.count} membership(s) expired.` })
    }
  }

  return (
    <div>
      <PageHeader
        title="Gym Configuration"
        description="Manage your gym profile, membership plans, trainer pay rates, and cancellation policies."
        action={
          <button
            onClick={handleManualExpiryCheck}
            className="px-3.5 py-2 bg-[#F5F4F5] hover:bg-[#EAEAEA] border border-[#E1E1E4] text-[#171B28] text-xs font-semibold rounded-lg flex items-center gap-2 cursor-pointer"
          >
            <ShieldAlert className="h-4 w-4 text-[#F97316]" />
            Run Membership Expiry Check
          </button>
        }
      />

      {message && (
        <div
          className={`mb-6 p-4 rounded-xl border flex items-center gap-3 text-xs font-medium ${
            message.type === "success"
              ? "bg-[#DDF5E7] border-[#BBEBD0] text-[#007A35]"
              : "bg-[#FDE4E4] border-[#F8B4B4] text-[#D71920]"
          }`}
        >
          {message.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Tabs Nav */}
      <div className="flex border-b border-[#E1E1E4] gap-2 mb-6">
        <button
          onClick={() => { setActiveTab("profile"); setMessage(null); }}
          className={`pb-3 px-4 text-xs font-bold transition-colors cursor-pointer border-b-2 ${
            activeTab === "profile"
              ? "border-[#007A35] text-[#007A35]"
              : "border-transparent text-[#8B8E98] hover:text-[#171B28]"
          }`}
        >
          <span className="flex items-center gap-2">
            <Settings className="h-4 w-4" /> Gym Profile
          </span>
        </button>

        <button
          onClick={() => { setActiveTab("plans"); setMessage(null); }}
          className={`pb-3 px-4 text-xs font-bold transition-colors cursor-pointer border-b-2 ${
            activeTab === "plans"
              ? "border-[#007A35] text-[#007A35]"
              : "border-transparent text-[#8B8E98] hover:text-[#171B28]"
          }`}
        >
          <span className="flex items-center gap-2">
            <Tag className="h-4 w-4" /> Membership Plans
          </span>
        </button>

        <button
          onClick={() => { setActiveTab("fees"); setMessage(null); }}
          className={`pb-3 px-4 text-xs font-bold transition-colors cursor-pointer border-b-2 ${
            activeTab === "fees"
              ? "border-[#007A35] text-[#007A35]"
              : "border-transparent text-[#8B8E98] hover:text-[#171B28]"
          }`}
        >
          <span className="flex items-center gap-2">
            <Receipt className="h-4 w-4" /> PT Session Rates
          </span>
        </button>

        <button
          onClick={() => { setActiveTab("rates"); setMessage(null); }}
          className={`pb-3 px-4 text-xs font-bold transition-colors cursor-pointer border-b-2 ${
            activeTab === "rates"
              ? "border-[#007A35] text-[#007A35]"
              : "border-transparent text-[#8B8E98] hover:text-[#171B28]"
          }`}
        >
          <span className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" /> Trainer Pay Rates
          </span>
        </button>

        <button
          onClick={() => { setActiveTab("policy"); setMessage(null); }}
          className={`pb-3 px-4 text-xs font-bold transition-colors cursor-pointer border-b-2 ${
            activeTab === "policy"
              ? "border-[#007A35] text-[#007A35]"
              : "border-transparent text-[#8B8E98] hover:text-[#171B28]"
          }`}
        >
          <span className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" /> Cancellation Policy
          </span>
        </button>
      </div>

      {/* Tab 1: Gym Profile */}
      {activeTab === "profile" && (
        <div className="bg-white rounded-xl border border-[#E1E1E4] p-6 shadow-sm max-w-2xl">
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-xs font-semibold text-[#4A4D58] uppercase mb-1">Gym Name</label>
              <input
                type="text"
                id="name" name="name"
                defaultValue={gym.name}
                required
                className="w-full px-3.5 py-2 text-xs bg-[#F5F4F5] border border-[#E1E1E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#007A35]"
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-xs font-semibold text-[#4A4D58] uppercase mb-1">Address</label>
              <input
                type="text"
                id="address" name="address"
                defaultValue={gym.address || ""}
                className="w-full px-3.5 py-2 text-xs bg-[#F5F4F5] border border-[#E1E1E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#007A35]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="block text-xs font-semibold text-[#4A4D58] uppercase mb-1">Phone Number</label>
                <input
                  type="text"
                  id="phone" name="phone"
                  defaultValue={gym.phone || ""}
                  className="w-full px-3.5 py-2 text-xs bg-[#F5F4F5] border border-[#E1E1E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#007A35]"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-[#4A4D58] uppercase mb-1">Contact Email</label>
                <input
                  type="email"
                  id="email" name="email"
                  defaultValue={gym.email || ""}
                  className="w-full px-3.5 py-2 text-xs bg-[#F5F4F5] border border-[#E1E1E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#007A35]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="payPeriod" className="block text-xs font-semibold text-[#4A4D58] uppercase mb-1">Pay Period Calculation</label>
              <select
                id="payPeriod" name="payPeriod"
                defaultValue={gym.payPeriod}
                className="w-full px-3.5 py-2 text-xs bg-[#F5F4F5] border border-[#E1E1E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#007A35]"
              >
                <option value="MONTHLY">Monthly</option>
                <option value="WEEKLY">Weekly</option>
              </select>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-[#007A35] hover:bg-[#00622A] text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
              >
                {loading ? "Saving..." : "Save Profile Settings"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Membership Plans */}
      {activeTab === "plans" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-[#171B28]">Active Membership Plans ({gym.membershipPlans.length})</h2>
            <button
              onClick={() => setShowAddPlan(!showAddPlan)}
              className="px-4 py-2 bg-[#007A35] hover:bg-[#00622A] text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
            >
              {showAddPlan ? "Cancel" : "+ Add New Plan"}
            </button>
          </div>

          {showAddPlan && (
            <div className="bg-white rounded-xl border border-[#E1E1E4] p-6 shadow-sm max-w-lg animate-in fade-in duration-150">
              <h3 className="text-xs font-bold uppercase text-[#8B8E98] mb-4">Create Membership Plan</h3>
              <form onSubmit={handleAddPlanSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-xs font-semibold text-[#4A4D58] mb-1">Plan Name</label>
                  <input
                    type="text"
                    id="name" name="name"
                    required
                    placeholder="e.g. Monthly Standard"
                    className="w-full px-3.5 py-2 text-xs bg-[#F5F4F5] border border-[#E1E1E4] rounded-lg focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-xs font-semibold text-[#4A4D58] mb-1">Description</label>
                  <input
                    type="text"
                    id="description" name="description"
                    placeholder="Standard access..."
                    className="w-full px-3.5 py-2 text-xs bg-[#F5F4F5] border border-[#E1E1E4] rounded-lg focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="price" className="block text-xs font-semibold text-[#4A4D58] mb-1">Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      id="price" name="price"
                      required
                      placeholder="49.99"
                      className="w-full px-3.5 py-2 text-xs bg-[#F5F4F5] border border-[#E1E1E4] rounded-lg focus:outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="durationDays" className="block text-xs font-semibold text-[#4A4D58] mb-1">Duration (Days)</label>
                    <input
                      type="number"
                      id="durationDays" name="durationDays"
                      required
                      placeholder="30"
                      className="w-full px-3.5 py-2 text-xs bg-[#F5F4F5] border border-[#E1E1E4] rounded-lg focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-[#007A35] text-white font-bold text-xs rounded-lg cursor-pointer"
                >
                  Create Plan
                </button>
              </form>
            </div>
          )}

          <div className="bg-white rounded-xl border border-[#E1E1E4] shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F5F4F5] border-b border-[#E1E1E4] text-[#8B8E98] uppercase text-[10px] tracking-wider font-bold">
                  <th className="py-3 px-4">Plan Name</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E1E1E4]">
                {gym.membershipPlans.map((plan: any) => (
                  <tr key={plan.id} className="hover:bg-[#F9FAFB]">
                    <td className="py-3.5 px-4 font-semibold text-[#171B28]">{plan.name}</td>
                    <td className="py-3.5 px-4 text-[#4A4D58]">{plan.durationDays} days</td>
                    <td className="py-3.5 px-4 font-bold text-[#007A35]">${plan.price.toFixed(2)}</td>
                    <td className="py-3.5 px-4 text-[#8B8E98]">{plan.description || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: PT Session Rates */}
      {activeTab === "fees" && (
        <div className="bg-white rounded-xl border border-[#E1E1E4] p-6 shadow-sm max-w-2xl space-y-6">
          <div className="p-4 rounded-xl bg-[#F5F4F5] border border-[#E1E1E4] text-[#4A4D58] text-xs flex items-start gap-3">
            <Receipt className="h-5 w-5 shrink-0 mt-0.5 text-[#007A35]" />
            <div>
              <p className="font-bold text-[#171B28] mb-1">What a PT session costs at your gym</p>
              <p>
                These prices apply to sessions not covered by a session pack, and set the
                suggested price when you issue a new pack. Changing them never re-prices a
                pack already sold or a session already booked — those keep the price the
                member actually paid.
              </p>
            </div>
          </div>

          <form onSubmit={handleSessionRatesSubmit} className="space-y-4">
            <div>
              <label htmlFor="defaultSessionFee" className="block text-xs font-semibold text-[#4A4D58] uppercase tracking-wider mb-2">
                Standard session rate ($) *
              </label>
              <input
                id="defaultSessionFee"
                name="defaultSessionFee"
                type="number"
                step="0.01"
                min="0"
                required
                defaultValue={gym.defaultSessionFee}
                className="w-full px-3 py-2.5 text-sm bg-[#F5F4F5] border border-[#E1E1E4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007A35] focus:bg-white transition-all"
              />
              <p className="text-xs text-[#8B8E98] mt-1.5">Charged for a one-hour session with a Level 1 trainer.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="level2SessionFee" className="block text-xs font-semibold text-[#4A4D58] uppercase tracking-wider mb-2">
                  Level 2 trainer rate ($)
                </label>
                <input
                  id="level2SessionFee"
                  name="level2SessionFee"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={gym.level2SessionFee ?? ""}
                  placeholder="Same as standard"
                  className="w-full px-3 py-2.5 text-sm bg-[#F5F4F5] border border-[#E1E1E4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007A35] focus:bg-white transition-all"
                />
                <p className="text-xs text-[#8B8E98] mt-1.5">Leave blank to charge the standard rate.</p>
              </div>

              <div>
                <label htmlFor="introSessionFee" className="block text-xs font-semibold text-[#4A4D58] uppercase tracking-wider mb-2">
                  Introductory session ($)
                </label>
                <input
                  id="introSessionFee"
                  name="introSessionFee"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={gym.introSessionFee ?? ""}
                  placeholder="Same as standard"
                  className="w-full px-3 py-2.5 text-sm bg-[#F5F4F5] border border-[#E1E1E4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007A35] focus:bg-white transition-all"
                />
                <p className="text-xs text-[#8B8E98] mt-1.5">Enter 0 for a free first session.</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="py-2.5 px-5 bg-[#007A35] hover:bg-[#00622A] text-white font-medium text-sm rounded-lg shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Saving..." : "Save session rates"}
            </button>
          </form>
        </div>
      )}

      {/* Tab 4: Trainer Pay Rates */}
      {activeTab === "rates" && (
        <div className="bg-white rounded-xl border border-[#E1E1E4] p-6 shadow-sm max-w-2xl space-y-6">
          <div className="p-4 rounded-xl bg-[#FFF8E6] border border-[#FFE7B3] text-[#B45309] text-xs flex items-start gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Business Rule BR-083 Notice:</p>
              <p className="mt-0.5 text-[11px] leading-relaxed">
                Changes to trainer pay rates apply to <strong>future sessions only</strong>. Completed or in-progress sessions retain the rate at the time of session start.
              </p>
            </div>
          </div>

          <form onSubmit={handleRatesSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="level1BaseRate" className="block text-xs font-semibold text-[#4A4D58] uppercase mb-1">
                  Level 1 Base Rate (%)
                </label>
                <input
                  type="number"
                  step="1"
                  id="level1BaseRate" name="level1BaseRate"
                  defaultValue={gym.level1BaseRate * 100}
                  required
                  className="w-full px-3.5 py-2 text-xs bg-[#F5F4F5] border border-[#E1E1E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#007A35]"
                />
              </div>

              <div>
                <label htmlFor="level2BaseRate" className="block text-xs font-semibold text-[#4A4D58] uppercase mb-1">
                  Level 2 Base Rate (%)
                </label>
                <input
                  type="number"
                  step="1"
                  id="level2BaseRate" name="level2BaseRate"
                  defaultValue={gym.level2BaseRate * 100}
                  required
                  className="w-full px-3.5 py-2 text-xs bg-[#F5F4F5] border border-[#E1E1E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#007A35]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="offShiftPremium" className="block text-xs font-semibold text-[#4A4D58] uppercase mb-1">
                Off-Shift Premium (%)
              </label>
              <input
                type="number"
                step="1"
                id="offShiftPremium" name="offShiftPremium"
                defaultValue={gym.offShiftPremium * 100}
                required
                className="w-full px-3.5 py-2 text-xs bg-[#F5F4F5] border border-[#E1E1E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#007A35]"
              />
              <p className="text-[10px] text-[#8B8E98] mt-1">
                Added to trainer base rate when session falls outside configured shift hours.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-[#007A35] hover:bg-[#00622A] text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
              >
                {loading ? "Updating..." : "Update Pay Rates"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 4: Cancellation Policy */}
      {activeTab === "policy" && (
        <div className="bg-white rounded-xl border border-[#E1E1E4] p-6 shadow-sm max-w-2xl space-y-6">
          <form onSubmit={handlePolicySubmit} className="space-y-4">
            <div>
              <label htmlFor="cancellationWindowHours" className="block text-xs font-semibold text-[#4A4D58] uppercase mb-1">
                Cancellation Window (Hours)
              </label>
              <input
                type="number"
                id="cancellationWindowHours" name="cancellationWindowHours"
                defaultValue={gym.cancellationWindowHours}
                required
                className="w-full px-3.5 py-2 text-xs bg-[#F5F4F5] border border-[#E1E1E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#007A35]"
              />
              <p className="text-[10px] text-[#8B8E98] mt-1">
                Cancellations inside this window deduct 1 session from member session pack (BR-012/PT005).
              </p>
            </div>

            <div>
              <label htmlFor="minSessionDuration" className="block text-xs font-semibold text-[#4A4D58] uppercase mb-1">
                Minimum Session Duration (Minutes)
              </label>
              <input
                type="number"
                id="minSessionDuration" name="minSessionDuration"
                defaultValue={gym.minSessionDuration}
                required
                className="w-full px-3.5 py-2 text-xs bg-[#F5F4F5] border border-[#E1E1E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#007A35]"
              />
              <p className="text-[10px] text-[#8B8E98] mt-1">
                Minimum time elapsed before QR end-scan is accepted (default 20 min per BR-010).
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <label htmlFor="noShowDeduction" className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  id="noShowDeduction" name="noShowDeduction"
                  defaultChecked={gym.noShowDeduction}
                  className="rounded border-[#E1E1E4] text-[#007A35] focus:ring-[#007A35]"
                />
                <span className="text-xs font-semibold text-[#171B28]">
                  Enable No-Show Pack Deduction (BR-013)
                </span>
              </label>

              <label htmlFor="lateCancelDeduction" className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  id="lateCancelDeduction" name="lateCancelDeduction"
                  defaultChecked={gym.lateCancelDeduction}
                  className="rounded border-[#E1E1E4] text-[#007A35] focus:ring-[#007A35]"
                />
                <span className="text-xs font-semibold text-[#171B28]">
                  Enable Late Cancellation Pack Deduction (BR-012)
                </span>
              </label>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-[#007A35] hover:bg-[#00622A] text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
              >
                {loading ? "Saving..." : "Save Cancellation Policy"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
