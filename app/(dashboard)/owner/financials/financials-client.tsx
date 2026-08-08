"use client"

import { useState } from "react"
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  PlusCircle,
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  Lock,
  Download,
} from "lucide-react"
import { RevenueLineChart, RevenuePieChart, ExpenseBudgetChart, TrainerPayChart } from "./components/charts"
import { LogExpenseDialog, SetBudgetDialog } from "./components/financial-modals"
import { closePayPeriod, approvePayPeriod } from "@/app/actions/financials"

type TabType = "revenue" | "expenses" | "deferred" | "payroll" | "pnl" | "export"

interface FinancialsClientProps {
  revenueData: {
    totalRevenue: number
    membershipRevenue: number
    ptSessionRevenue: number
    addOnRevenue: number
    level1Revenue: number
    level2Revenue: number
    offShiftPremiumTotal: number
    trendData: Array<{ date: string; membership: number; pt: number; addOn: number; total: number }>
  }
  expenseList: Array<{
    id: string
    amount: number
    category: string
    description: string | null
    date: Date
    isRecurring: boolean
  }>
  budgetVsActual: Array<{
    category: string
    budget: number
    actual: number
    variance: number
    overBudget: boolean
  }>
  deferredRevenueData: {
    totalDeferred: number
    totalRecognized: number
    utilizationRate: number
    packBreakdown: Array<{
      id: string
      memberName: string
      totalSessions: number
      usedSessions: number
      remainingSessions: number
      purchaseDate: Date
      totalValue: number
      recognizedValue: number
      deferredValue: number
      status: string
    }>
  }
  payrollData: {
    payPeriod: {
      id: string
      status: string
      startDate: Date
      endDate: Date
    }
    payrollSummary: Array<{
      trainerId: string
      trainerName: string
      level: string
      sessionsCompleted: number
      inShiftCount: number
      offShiftCount: number
      grossPay: number
    }>
  }
  pnlData: {
    revenue: { membership: number; pt: number; addOn: number; total: number }
    expenses: { byCategory: Record<string, number>; total: number }
    netProfit: number
    comparison: { revChangePct: number; profitChangePct: number; prevNetProfit: number }
  }
}

export function FinancialsClient({
  revenueData,
  expenseList,
  budgetVsActual,
  deferredRevenueData,
  payrollData,
  pnlData,
}: FinancialsClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>("revenue")
  const [isLogExpenseOpen, setIsLogExpenseOpen] = useState(false)
  const [isSetBudgetOpen, setIsSetBudgetOpen] = useState(false)
  const [payrollLoading, setPayrollLoading] = useState(false)

  async function handleClosePayPeriod() {
    if (!confirm("Are you sure you want to close this pay period? This will lock all completed session pay calculations.")) return
    setPayrollLoading(true)
    await closePayPeriod(payrollData.payPeriod.id)
    setPayrollLoading(false)
  }

  async function handleApprovePayPeriod() {
    if (!confirm("Approve payroll for payout?")) return
    setPayrollLoading(true)
    await approvePayPeriod(payrollData.payPeriod.id)
    setPayrollLoading(false)
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Financial Management</h1>
          <p className="text-sm text-gray-500">Real-time revenue, expense tracking, payroll close & P&L statements</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsLogExpenseOpen(true)}
            className="flex items-center gap-2 bg-[#007A35] hover:bg-[#005c28] text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            Log Expense
          </button>
          <a
            href="/api/export/csv?type=financials"
            download
            className="flex items-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            <Download className="w-4 h-4" />
            Export Financials
          </a>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-gray-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab("revenue")}
          className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition ${
            activeTab === "revenue"
              ? "border-[#007A35] text-[#007A35]"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Revenue Overview
        </button>
        <button
          onClick={() => setActiveTab("expenses")}
          className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition ${
            activeTab === "expenses"
              ? "border-[#007A35] text-[#007A35]"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Expense Management
        </button>
        <button
          onClick={() => setActiveTab("deferred")}
          className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition ${
            activeTab === "deferred"
              ? "border-[#007A35] text-[#007A35]"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Deferred Revenue
        </button>
        <button
          onClick={() => setActiveTab("payroll")}
          className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition ${
            activeTab === "payroll"
              ? "border-[#007A35] text-[#007A35]"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Trainer Payroll
        </button>
        <button
          onClick={() => setActiveTab("pnl")}
          className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition ${
            activeTab === "pnl"
              ? "border-[#007A35] text-[#007A35]"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          P&L Report
        </button>
        <button
          onClick={() => setActiveTab("export")}
          className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition ${
            activeTab === "export"
              ? "border-[#007A35] text-[#007A35]"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Export Data
        </button>
      </div>

      {/* 1. REVENUE OVERVIEW TAB */}
      {activeTab === "revenue" && (
        <div className="space-y-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm space-y-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Revenue</span>
              <div className="text-3xl font-extrabold text-[#007A35]">
                ${revenueData.totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-gray-500">Gross recorded income this period</p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm space-y-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Membership Sales</span>
              <div className="text-2xl font-bold text-gray-900">
                ${revenueData.membershipRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-gray-500">Recurring membership plan payments</p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm space-y-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">PT Session Revenue</span>
              <div className="text-2xl font-bold text-gray-900">
                ${revenueData.ptSessionRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-gray-500">Prepaid PT Session Pack purchases</p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm space-y-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Add-On & Retail</span>
              <div className="text-2xl font-bold text-gray-900">
                ${revenueData.addOnRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-gray-500">Supplements, towels, merchandise</p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-gray-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-gray-900">Revenue Trend Over Time</h3>
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                  Daily Breakdown
                </span>
              </div>
              <RevenueLineChart data={revenueData.trendData} />
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-gray-900">Revenue Split</h3>
              <RevenuePieChart
                membership={revenueData.membershipRevenue}
                pt={revenueData.ptSessionRevenue}
                addOn={revenueData.addOnRevenue}
              />
            </div>
          </div>

          {/* Trainer Level Revenue Split */}
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-gray-900">PT Session Revenue Breakdown by Trainer Level</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                <span className="text-xs font-semibold text-emerald-800 uppercase">Level 1 Trainer Revenue</span>
                <div className="text-2xl font-bold text-emerald-900 mt-1">
                  ${revenueData.level1Revenue.toFixed(2)}
                </div>
                <p className="text-xs text-emerald-700 mt-1">40% Base payout tier sessions</p>
              </div>

              <div className="p-4 bg-teal-50 rounded-lg border border-teal-100">
                <span className="text-xs font-semibold text-teal-800 uppercase">Level 2 Trainer Revenue</span>
                <div className="text-2xl font-bold text-teal-900 mt-1">
                  ${revenueData.level2Revenue.toFixed(2)}
                </div>
                <p className="text-xs text-teal-700 mt-1">50% Base payout tier sessions</p>
              </div>

              <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                <span className="text-xs font-semibold text-amber-800 uppercase">Off-Shift Premium Additions</span>
                <div className="text-2xl font-bold text-amber-900 mt-1">
                  ${revenueData.offShiftPremiumTotal.toFixed(2)}
                </div>
                <p className="text-xs text-amber-700 mt-1">10% Premium for out-of-shift sessions</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. EXPENSE MANAGEMENT TAB */}
      {activeTab === "expenses" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Facility Expenses & Monthly Budgets</h2>
              <p className="text-xs text-gray-500">Track actual operational spend against targets (BR-065)</p>
            </div>
            <button
              onClick={() => setIsSetBudgetOpen(true)}
              className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-3.5 py-1.5 rounded-lg text-sm font-medium transition"
            >
              Set Monthly Budgets
            </button>
          </div>

          {/* Budget vs Actual Chart */}
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-gray-900">Budget vs Actual Spend by Category</h3>
            <ExpenseBudgetChart data={budgetVsActual} />
          </div>

          {/* Category Budget Breakdown Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-gray-50 font-bold text-sm text-gray-800">
              Monthly Category Budget & Variance Tracking
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                  <tr>
                    <th className="p-4">Category</th>
                    <th className="p-4 text-right">Budget Limit</th>
                    <th className="p-4 text-right">Actual Spend</th>
                    <th className="p-4 text-right">Variance</th>
                    <th className="p-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {budgetVsActual.map((item) => (
                    <tr key={item.category} className={item.overBudget ? "bg-red-50/50" : "hover:bg-gray-50"}>
                      <td className="p-4 font-semibold text-gray-900">{item.category}</td>
                      <td className="p-4 text-right">${item.budget.toFixed(2)}</td>
                      <td className="p-4 text-right font-bold">${item.actual.toFixed(2)}</td>
                      <td
                        className={`p-4 text-right font-semibold ${
                          item.variance > 0 ? "text-red-600" : "text-emerald-600"
                        }`}
                      >
                        {item.variance > 0 ? `+$${item.variance.toFixed(2)}` : `-$${Math.abs(item.variance).toFixed(2)}`}
                      </td>
                      <td className="p-4 text-center">
                        {item.overBudget ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-red-100 px-2.5 py-1 rounded-full">
                            <AlertTriangle className="w-3 h-3" /> Over Budget
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                            <CheckCircle className="w-3 h-3" /> Within Limit
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Expense History Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-gray-50 font-bold text-sm text-gray-800">
              Logged Expense Transaction History
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                  <tr>
                    <th className="p-4">Date</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Description</th>
                    <th className="p-4">Recurring</th>
                    <th className="p-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {expenseList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-gray-500">
                        No expenses logged yet. Click "Log Expense" to add one.
                      </td>
                    </tr>
                  ) : (
                    expenseList.map((exp) => (
                      <tr key={exp.id} className="hover:bg-gray-50">
                        <td className="p-4 text-gray-600">
                          {new Date(exp.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                        <td className="p-4 font-semibold text-gray-900">{exp.category}</td>
                        <td className="p-4 text-gray-600">{exp.description || "—"}</td>
                        <td className="p-4">
                          {exp.isRecurring ? (
                            <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                              Monthly Recurring
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">One-off</span>
                          )}
                        </td>
                        <td className="p-4 text-right font-bold text-gray-900">${exp.amount.toFixed(2)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. DEFERRED REVENUE TAB */}
      {activeTab === "deferred" && (
        <div className="space-y-6">
          {/* Deferred Revenue Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm space-y-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Total Deferred Revenue
              </span>
              <div className="text-3xl font-extrabold text-amber-600">
                ${deferredRevenueData.totalDeferred.toFixed(2)}
              </div>
              <p className="text-xs text-gray-500">Unearned cash for unused sessions (BR-064)</p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm space-y-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Recognized Revenue
              </span>
              <div className="text-3xl font-extrabold text-[#007A35]">
                ${deferredRevenueData.totalRecognized.toFixed(2)}
              </div>
              <p className="text-xs text-gray-500">Earned revenue from completed PT sessions</p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm space-y-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Session Pack Utilization Rate
              </span>
              <div className="text-3xl font-extrabold text-indigo-600">
                {deferredRevenueData.utilizationRate}%
              </div>
              <p className="text-xs text-gray-500">Percentage of purchased sessions already used</p>
            </div>
          </div>

          {/* Active Session Packs Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-gray-50 font-bold text-sm text-gray-800">
              Active Member Session Packs & Deferred Ledger
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                  <tr>
                    <th className="p-4">Pack ID</th>
                    <th className="p-4">Member Name</th>
                    <th className="p-4 text-center">Total Sessions</th>
                    <th className="p-4 text-center">Used</th>
                    <th className="p-4 text-center">Remaining</th>
                    <th className="p-4 text-right">Pack Value</th>
                    <th className="p-4 text-right">Recognized</th>
                    <th className="p-4 text-right">Outstanding Deferred</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {deferredRevenueData.packBreakdown.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-6 text-center text-gray-500">
                        No session packs purchased yet.
                      </td>
                    </tr>
                  ) : (
                    deferredRevenueData.packBreakdown.map((pack) => (
                      <tr key={pack.id} className="hover:bg-gray-50">
                        <td className="p-4 text-xs font-mono text-gray-500">{pack.id.slice(-8)}</td>
                        <td className="p-4 font-semibold text-gray-900">{pack.memberName}</td>
                        <td className="p-4 text-center font-bold">{pack.totalSessions}</td>
                        <td className="p-4 text-center text-emerald-600 font-semibold">{pack.usedSessions}</td>
                        <td className="p-4 text-center text-amber-600 font-semibold">{pack.remainingSessions}</td>
                        <td className="p-4 text-right font-semibold">${pack.totalValue.toFixed(2)}</td>
                        <td className="p-4 text-right text-emerald-700">${pack.recognizedValue.toFixed(2)}</td>
                        <td className="p-4 text-right font-bold text-amber-700">
                          ${pack.deferredValue.toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. TRAINER PAYROLL TAB */}
      {activeTab === "payroll" && (
        <div className="space-y-6">
          {/* Pay Period Info Header Banner */}
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900">Current Pay Period</h2>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    payrollData.payPeriod.status === "OPEN"
                      ? "bg-emerald-100 text-emerald-800"
                      : payrollData.payPeriod.status === "CLOSED"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {payrollData.payPeriod.status}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(payrollData.payPeriod.startDate).toLocaleDateString()} —{" "}
                {new Date(payrollData.payPeriod.endDate).toLocaleDateString()}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {payrollData.payPeriod.status === "OPEN" && (
                <button
                  onClick={handleClosePayPeriod}
                  disabled={payrollLoading}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm disabled:opacity-50"
                >
                  Close Pay Period
                </button>
              )}

              {payrollData.payPeriod.status === "CLOSED" && (
                <button
                  onClick={handleApprovePayPeriod}
                  disabled={payrollLoading}
                  className="bg-[#007A35] hover:bg-[#005c28] text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm disabled:opacity-50"
                >
                  Approve Payroll
                </button>
              )}

              <a
                href="/api/export/csv?type=payroll"
                download
                className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Payroll CSV
              </a>
            </div>
          </div>

          {/* Trainer Payroll Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-gray-50 font-bold text-sm text-gray-800">
              Trainer Payout Calculations & Shift Breakdown (BR-041 to BR-048)
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                  <tr>
                    <th className="p-4">Trainer Name</th>
                    <th className="p-4">Trainer Level</th>
                    <th className="p-4 text-center">Completed Sessions</th>
                    <th className="p-4 text-center">In-Shift Sessions</th>
                    <th className="p-4 text-center">Off-Shift Sessions</th>
                    <th className="p-4 text-right">Gross Pay ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {payrollData.payrollSummary.map((tr) => (
                    <tr key={tr.trainerId} className="hover:bg-gray-50">
                      <td className="p-4 font-semibold text-gray-900">{tr.trainerName}</td>
                      <td className="p-4">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded ${
                            tr.level === "LEVEL_2" ? "bg-teal-100 text-teal-800" : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {tr.level === "LEVEL_2" ? "Level 2 (50%)" : "Level 1 (40%)"}
                        </span>
                      </td>
                      <td className="p-4 text-center font-bold">{tr.sessionsCompleted}</td>
                      <td className="p-4 text-center text-gray-600">{tr.inShiftCount}</td>
                      <td className="p-4 text-center text-amber-600 font-semibold">{tr.offShiftCount}</td>
                      <td className="p-4 text-right font-extrabold text-[#007A35]">${tr.grossPay.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. P&L REPORT TAB */}
      {activeTab === "pnl" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm space-y-6 max-w-4xl mx-auto">
            <div className="border-b pb-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Profit & Loss Statement (P&L)</h2>
                <p className="text-xs text-gray-500">Auto-generated operating report (BR-068)</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-400 uppercase">Period-Over-Period Change</span>
                <div
                  className={`text-sm font-bold flex items-center gap-1 justify-end ${
                    pnlData.comparison.profitChangePct >= 0 ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  {pnlData.comparison.profitChangePct >= 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />)}
                  {pnlData.comparison.profitChangePct >= 0 ? "+" : ""}
                  {pnlData.comparison.profitChangePct}%
                </div>
              </div>
            </div>

            {/* REVENUE SECTION */}
            <div className="space-y-3">
              <div className="font-bold text-xs uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded">
                Operating Revenue
              </div>
              <div className="space-y-2 text-sm pl-2">
                <div className="flex justify-between text-gray-600">
                  <span>Membership Plan Sales</span>
                  <span>${pnlData.revenue.membership.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>PT Session Pack Sales</span>
                  <span>${pnlData.revenue.pt.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Add-on & Retail Revenue</span>
                  <span>${pnlData.revenue.addOn.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 border-t pt-2 text-base">
                  <span>Total Operating Revenue</span>
                  <span className="text-[#007A35]">${pnlData.revenue.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* EXPENSES SECTION */}
            <div className="space-y-3 pt-4">
              <div className="font-bold text-xs uppercase tracking-wider text-gray-800 bg-gray-100 px-3 py-1.5 rounded">
                Operating Expenses
              </div>
              <div className="space-y-2 text-sm pl-2">
                {Object.entries(pnlData.expenses.byCategory).map(([cat, amount]) => (
                  <div key={cat} className="flex justify-between text-gray-600">
                    <span>{cat}</span>
                    <span>${amount.toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold text-gray-900 border-t pt-2 text-base">
                  <span>Total Operating Expenses</span>
                  <span className="text-red-600">${pnlData.expenses.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* NET PROFIT SECTION */}
            <div className="border-t-2 border-gray-900 pt-4 flex justify-between items-center text-lg font-black">
              <span>NET PROFIT / (LOSS)</span>
              <span className={pnlData.netProfit >= 0 ? "text-[#007A35]" : "text-red-600"}>
                ${pnlData.netProfit.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 6. EXPORT DATA TAB */}
      {activeTab === "export" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm space-y-4">
              <FileSpreadsheet className="w-8 h-8 text-[#007A35]" />
              <h3 className="text-base font-bold text-gray-900">Financial CSV Report</h3>
              <p className="text-xs text-gray-500">Download complete transaction history including revenue and expenses.</p>
              <a
                href="/api/export/csv?type=financials"
                download
                className="block text-center w-full bg-[#007A35] hover:bg-[#005c28] text-white py-2 rounded-lg text-sm font-medium transition"
              >
                Download Financials CSV
              </a>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm space-y-4">
              <FileSpreadsheet className="w-8 h-8 text-amber-600" />
              <h3 className="text-base font-bold text-gray-900">Payroll CSV Report</h3>
              <p className="text-xs text-gray-500">Download detailed trainer payouts, session counts, and shift bonuses.</p>
              <a
                href="/api/export/csv?type=payroll"
                download
                className="block text-center w-full bg-amber-600 hover:bg-amber-700 text-white py-2 rounded-lg text-sm font-medium transition"
              >
                Download Payroll CSV
              </a>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm space-y-4 opacity-75">
              <div className="flex justify-between items-center">
                <Lock className="w-8 h-8 text-gray-400" />
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">Coming Soon</span>
              </div>
              <h3 className="text-base font-bold text-gray-900">Xero / QuickBooks Sync</h3>
              <p className="text-xs text-gray-500">Push P&L accounts directly to your external accounting software.</p>
              <button disabled className="w-full border border-gray-300 text-gray-400 py-2 rounded-lg text-sm font-medium cursor-not-allowed">
                Sync Accounting (Coming Soon)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog Modals */}
      <LogExpenseDialog isOpen={isLogExpenseOpen} onClose={() => setIsLogExpenseOpen(false)} />
      <SetBudgetDialog isOpen={isSetBudgetOpen} onClose={() => setIsSetBudgetOpen(false)} />
    </div>
  )
}
