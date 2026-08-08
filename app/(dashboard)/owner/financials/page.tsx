import {
  getRevenueOverview,
  getExpenses,
  getBudgetVsActual,
  getDeferredRevenue,
  getCurrentPayPeriodInfo,
  generatePnL,
} from "@/app/actions/financials"
import { FinancialsClient } from "./financials-client"

export default async function FinancialsPage() {
  const [revenueData, expenseList, budgetVsActual, deferredRevenueData, payrollData, pnlData] = await Promise.all([
    getRevenueOverview(),
    getExpenses(),
    getBudgetVsActual(),
    getDeferredRevenue(),
    getCurrentPayPeriodInfo(),
    generatePnL(),
  ])

  return (
    <FinancialsClient
      revenueData={revenueData}
      expenseList={expenseList}
      budgetVsActual={budgetVsActual}
      deferredRevenueData={deferredRevenueData}
      payrollData={payrollData}
      pnlData={pnlData}
    />
  )
}
