# GymOS Web App — Part 4: Financial Management & Reporting

**Tech Stack Context:** Next.js 16 (App Router), TypeScript, Tailwind CSS 4, Prisma, PostgreSQL (Neon), Auth.js v5, Zod, shadcn/ui, Lucide icons.

## HEADER
- **Title:** GymOS Web App — Part 4: Financial Management & Reporting
- **What this part builds:** Financial dashboard, revenue tracking, expense management, P&L reports, trainer payroll, deferred revenue, accounting exports (CSV/Xero/QuickBooks), billing views
- **Prerequisites:** Parts 1-3 completed (auth, schema, layout, gym config, member/trainer CRUD, sessions, plans, earnings)
- **Reference:** Read `GymOS-ui-design-system.md` and `GymOS-analysis.md` before starting.

---

## WHAT EXISTS FROM PARTS 1-3
The AI reading this should assume the following components and structures already exist:
- **Authentication & Layout:** Complete Auth.js v5 integration, role-based access control (RBAC), and standard dashboard layouts.
- **Database Schema (Prisma):** 
  - `RevenueRecord` model (fields: `id`, `amount`, `category` (MEMBERSHIP, PT_SESSION, ADD_ON), `date`, `memberId`, `gymId`).
  - `ExpenseRecord` model (fields: `id`, `amount`, `category`, `description`, `date`, `isRecurring`, `gymId`).
  - `PayRecord` and `PayPeriod` models tracking trainer earnings.
  - `Pack` and `Session` models managing package utilization.
- **Business Logic:** Session lifecycle with automatic revenue recording and pay calculation.
- **UI Components:** Basic trainer earnings view, generic tables, forms using react-hook-form and Zod.

---

## SECTION 1: FINANCIAL DASHBOARD (SCR-26)

Create the main financials view at `/app/(dashboard)/owner/financials/page.tsx`. This is a data-heavy page that uses a tabbed interface (using shadcn/ui `Tabs`) to separate concerns.

### 1.1 Revenue Overview Tab
**Goal:** Implement real-time revenue tracking (FR-066).

- **Period Selector:** Add a dropdown or segmented control for: Today, This Week, This Month, Custom Date Range.
- **Summary Stat Cards:** Use the existing `StatCard` component to display:
  - Total Revenue (Make the number large. Text should be green if the trend is positive compared to the previous period).
  - Membership Revenue.
  - PT Session Revenue.
  - Add-on Revenue.
- **Revenue Trend Chart:** Implement a line or area chart showing revenue over time. Use the design system's green palette (`#007A35`, `#4C956C`, `#78AA8C`).
- **Revenue Split by Trainer Level:**
  - Display a breakdown of L1 Revenue vs. L2 Revenue.
  - Show Off-shift premium totals.
- **Business Rules:** Enforce BR-062/FIN001 (Revenue recognition), BR-063/FIN002, BR-066/FIN005.

### 1.2 Expense Management Tab
**Goal:** Implement expense logging & budget tracking (FR-067).

- **Action Button:** Add a "Log Expense" button that opens a Dialog/Modal with a form.
- **Expense Form Fields (Zod validation):**
  - `amount`: required, positive number.
  - `category`: select from enum (`RENT`, `UTILITIES`, `EQUIPMENT`, `MARKETING`, `SALARIES`, `MAINTENANCE`, `OTHER`).
  - `description`: text string.
  - `date`: date picker.
  - `isRecurring`: boolean toggle.
- **Expense List Table:** Build a data table displaying: Date, Category, Description, Amount, Recurring status.
- **Budget vs Actual Section:**
  - For each expense category, allow the owner to set a monthly budget.
  - Display actual spend against the budget.
  - **Visual:** Use a progress bar showing spend vs budget.
  - **Validation:** Highlight variance in RED when actual spend exceeds budget (BR-065/FIN004).

### 1.3 Deferred Revenue Tab
**Goal:** Track deferred revenue & pack utilization (FR-068).

- **Summary Stat:** Display Total Deferred Revenue (sum of all outstanding pack value).
- **Deferred Revenue Table:** List all active packs with columns: Pack ID, Member, Total Sessions, Used Sessions, Remaining Sessions, Purchase Date, Total Value, Recognized Value, Outstanding Deferred.
- **Formulas:**
  - `Deferred Value = (remainingSessions / totalSessions) * packValue`
  - `Recognized Value = (usedSessions / totalSessions) * packValue`
- **Pack Utilization Rate:** Calculate and display `(totalUsed / totalPurchased) * 100` across all packs.
- **Business Rule:** Enforce BR-064/FIN003 (Deferred revenue calculation).

### 1.4 Trainer Payroll Tab
**Goal:** Manage pay period close & payroll reporting (FR-046).

- **Period Info:** Show current pay period status (OPEN, CLOSED, APPROVED) and the date range.
- **Trainer Breakdown Table:** Display columns for Trainer Name, Level, Sessions Completed, In-Shift Total, Off-Shift Total, Premium Amount, Gross Pay.
- **Actions:**
  - **"Close Pay Period" Button:** Triggers an action that aggregates all completed sessions within the period, calculates totals per trainer, sets period status to `CLOSED`, and prepares it for owner review.
  - **"Approve Payroll" Button:** Sets the status to `APPROVED`.
  - **Export:** Add a button to download a CSV of the payroll report.
- **Business Rules:** Enforce BR-041 to BR-048 (PAY001-008).

### 1.5 P&L Report Tab
**Goal:** Generate Profit & Loss reports (FR-069).

- **Controls:** Add a Date Range selector.
- **Auto-generated P&L View:** 
  Implement a structured textual or table layout:
  ```text
  REVENUE
    Membership Revenue:     $X,XXX
    PT Session Revenue:     $X,XXX
    Add-on Revenue:         $X,XXX
    ─────────────────────────
    Total Revenue:          $XX,XXX

  EXPENSES
    Rent:                   $X,XXX
    Utilities:              $XXX
    Equipment:              $XXX
    Marketing:              $XXX
    Trainer Payroll:        $X,XXX  (aggregated from PayPeriods)
    Maintenance:            $XXX
    Other:                  $XXX
    ─────────────────────────
    Total Expenses:         $XX,XXX

  ─────────────────────────────
  NET PROFIT:              $X,XXX
  ```
- **Comparisons:** Include period-over-period comparison (current vs. previous same-length period). Show percentage changes with green (up) and red (down) indicators.
- **Business Rule:** BR-068/FIN007.

### 1.6 Export Section
**Goal:** Facilitate financial data export (FR-070).

- **Export Buttons:**
  - **CSV Download:** Generates and downloads a CSV file for the selected period. Include all revenue records (date, category, amount, member, trainer), expense records (date, category, description, amount), and net totals.
  - **Xero Push:** UI placeholder button showing "Integration coming soon".
  - **QuickBooks Push:** UI placeholder button showing "Integration coming soon".
- **Business Rule:** BR-069/FIN008.

---

## SECTION 2: CHARTS & DATA VISUALIZATION

Use **Recharts** (`npm install recharts`) for all data visualizations. It is highly compatible with Next.js and React.

- **Chart Components to Build:**
  - `RevenueLineChart`: Displays daily/weekly/monthly revenue trends.
  - `RevenuePieChart`: Shows the split between membership, PT, and add-on revenue.
  - `ExpenseBudgetChart`: A bar chart showing category-wise budget vs actual expenses.
  - `TrainerPayChart`: A comparison of L1 vs L2 earnings.
- **Styling Rules:** 
  - Exclusively use the green palette from the design system for standard charts:
    - Primary: `#007A35`
    - Shades: `#4C956C`, `#78AA8C`, `#A9C6B4`, `#C8DDD0`
  - Chart cards must follow the card design system: white background, 1px solid border (`#E1E1E4`), 7-9px border radius.

---

## SECTION 3: SERVER ACTIONS FOR FINANCIALS

Create the following Server Actions in `app/actions/financials.ts` or split them logically. Use Zod for all input validation and Prisma for database queries.

### 3.1 Revenue Actions
- `getRevenueByPeriod(startDate, endDate, gymId)`: Returns aggregated revenue data.
- `getRevenueSplitByCategory(startDate, endDate)`: Returns membership vs PT vs add-on data.
- `getRevenueSplitByTrainerLevel(startDate, endDate)`: Returns L1 vs L2 data.

### 3.2 Expense Actions
- `createExpense(data)`: Validates via Zod and inserts a new `ExpenseRecord`.
- `getExpenses(startDate, endDate, category?)`: Returns a filtered list of expenses.
- `setCategoryBudget(category, monthlyBudget)`: Upserts a budget value for an expense category.
- `getBudgetVsActual(month)`: Returns per-category comparison data.

### 3.3 Payroll Actions
- `getCurrentPayPeriod(gymId)`: Returns the current `OPEN` period.
- `closePayPeriod(payPeriodId)`: Aggregates sessions, calculates totals, and transitions status to `CLOSED`.
- `approvePayPeriod(payPeriodId)`: Transitions a closed pay period to `APPROVED`.
- `getPayPeriodReport(payPeriodId)`: Returns detailed per-trainer breakdowns for the UI.

### 3.4 P&L Actions
- `generatePnL(startDate, endDate, gymId)`: Calculates total revenue and total expenses (including payroll) to derive Net Profit.
- `comparePeriods(period1Start, period1End, period2Start, period2End)`: Returns comparison metrics (absolute and percentage differences).

### 3.5 Export Actions
- `exportToCSV(startDate, endDate, reportType)`: Generates the raw CSV string/blob.
- Create a Route Handler at `app/api/export/csv/route.ts` to serve the CSV file download with correct `Content-Type: text/csv` headers.

---

## SECTION 4: BILLING HISTORY (Owner View of Member Billing)

Enhance the Member Profile page (`/app/(dashboard)/owner/members/[id]/page.tsx` - Payments Tab) built in Part 2.

- **Transaction List:** Show all transactions including:
  - Date
  - Type (Membership / Pack)
  - Amount
  - Status (Paid / Failed / Refunded)
- **Actions:** 
  - Add mock "Receipt" download links.
  - Implement a manual payment recording form (for cash payments at the desk).

---

## SECTION 5: TESTING CHECKLIST

Ensure the following acceptance criteria are met before completing this part:

- [ ] Revenue overview shows correct totals matching actual records in the database.
- [ ] Revenue splits correctly by category and trainer level.
- [ ] Expense logging creates records with the correct category enum.
- [ ] Budget vs actual chart shows correct variance and highlights overspend in red.
- [ ] Deferred revenue calculation accurately matches: `outstanding = remaining/total × value`.
- [ ] Pay period close successfully aggregates all completed sessions within the period.
- [ ] Payroll report shows correct in-shift vs off-shift breakdown per trainer.
- [ ] P&L formula correctly calculates: `Revenue - Expenses (incl payroll) = Net Profit`.
- [ ] Period comparison shows correct percentage changes.
- [ ] CSV export successfully downloads with the correct headers and data formatting.
- [ ] All Recharts render correctly using the specified green palette.
- [ ] All financial actions are restricted to Owner-only (RBAC successfully enforced).
- [ ] Trainers attempting to access gym financials receive a 403/Forbidden error and can only see their own earnings.
