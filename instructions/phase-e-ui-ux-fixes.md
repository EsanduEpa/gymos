# Phase E: UI/UX & Accessibility Fixes

## Objective
Implement mobile-responsive navigation, enhance form accessibility with ARIA labels, and polish the overall UX of the GymOS application.

## Prerequisites
- The previous phases setting up the dashboard and authentication should be complete.
- Ensure `lucide-react` is installed (it should be, given the current imports).

---

## Step 1: Mobile-Responsive Sidebar

We need to make the sidebar collapsible on mobile devices (screens smaller than `lg`, 1024px).

**File**: `components/layout/sidebar.tsx`
**Action**: Modify existing file

**Current code**:
```tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  Calendar,
  DollarSign,
  Settings,
  Shield,
  CreditCard,
  ClipboardList,
  Wallet,
  LogOut,
  UserCheck,
} from "lucide-react"
import { signOut } from "next-auth/react"

interface SidebarProps {
  role: "SUPER_ADMIN" | "GYM_OWNER" | "PERSONAL_TRAINER" | "GYM_MEMBER"
  fullName: string
}

export function Sidebar({ role, fullName }: SidebarProps) {
  const pathname = usePathname()

  const ownerNav = [
    { name: "Dashboard", href: "/owner", icon: LayoutDashboard },
    { name: "Members", href: "/owner/members", icon: Users },
    { name: "Trainers", href: "/owner/trainers", icon: Dumbbell },
    { name: "Sessions", href: "/owner/sessions", icon: Calendar },
    { name: "Financials", href: "/owner/financials", icon: DollarSign },
    { name: "Gym Config", href: "/owner/gym-config", icon: Settings },
    { name: "Audit Log", href: "/owner/audit-log", icon: Shield },
    { name: "Subscription", href: "/owner/subscription", icon: CreditCard },
  ]

  const trainerNav = [
    { name: "Schedule", href: "/trainer/schedule", icon: Calendar },
    { name: "Clients", href: "/trainer/clients", icon: Users },
    { name: "Hire Requests", href: "/trainer/hire-requests", icon: UserCheck },
    { name: "Earnings", href: "/trainer/earnings", icon: Wallet },
  ]

  const superAdminNav = [
    { name: "All Gyms", href: "/admin", icon: LayoutDashboard },
    { name: "Owner View", href: "/owner", icon: Settings },
  ]

  const navItems =
    role === "PERSONAL_TRAINER"
      ? trainerNav
      : role === "SUPER_ADMIN"
      ? superAdminNav
      : ownerNav

  return (
    <aside className="w-56 shrink-0 bg-[#171B28] text-[#777B87] min-h-screen flex flex-col justify-between select-none">
      <div>
        {/* Logo Section */}
        <div className="p-5 border-b border-[#232736]">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-[#007A35] flex items-center justify-center text-white shrink-0">
              <Dumbbell className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-none text-white">GymOS</h1>
              <p className="text-[10px] font-semibold text-[#8B8E98] tracking-wider uppercase mt-1">
                Management System
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive =
              pathname === item.href ||
              (item.href !== "/owner" && item.href !== "/trainer" && pathname.startsWith(item.href))

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-150 ${
                  isActive
                    ? "bg-[#007A35] text-white shadow-sm"
                    : "text-[#777B87] hover:bg-[#202534] hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Footer / User Profile & Logout */}
      <div className="p-3 border-t border-[#232736]">
        <div className="px-3 py-2 text-xs font-medium text-[#8B8E98] truncate">
          {fullName} ({role.replace("_", " ")})
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-[#777B87] hover:bg-[#202534] hover:text-red-400 transition-colors duration-150 cursor-pointer"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
```

**Replace with**:
```tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  Calendar,
  DollarSign,
  Settings,
  Shield,
  CreditCard,
  ClipboardList,
  Wallet,
  LogOut,
  UserCheck,
  Menu,
  X
} from "lucide-react"
import { signOut } from "next-auth/react"

interface SidebarProps {
  role: "SUPER_ADMIN" | "GYM_OWNER" | "PERSONAL_TRAINER" | "GYM_MEMBER"
  fullName: string
}

export function Sidebar({ role, fullName }: SidebarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Close sidebar on path change (mobile)
    setIsOpen(false)
  }, [pathname])

  const ownerNav = [
    { name: "Dashboard", href: "/owner", icon: LayoutDashboard },
    { name: "Members", href: "/owner/members", icon: Users },
    { name: "Trainers", href: "/owner/trainers", icon: Dumbbell },
    { name: "Sessions", href: "/owner/sessions", icon: Calendar },
    { name: "Financials", href: "/owner/financials", icon: DollarSign },
    { name: "Gym Config", href: "/owner/gym-config", icon: Settings },
    { name: "Audit Log", href: "/owner/audit-log", icon: Shield },
    { name: "Subscription", href: "/owner/subscription", icon: CreditCard },
  ]

  const trainerNav = [
    { name: "Schedule", href: "/trainer/schedule", icon: Calendar },
    { name: "Clients", href: "/trainer/clients", icon: Users },
    { name: "Hire Requests", href: "/trainer/hire-requests", icon: UserCheck },
    { name: "Earnings", href: "/trainer/earnings", icon: Wallet },
  ]

  const superAdminNav = [
    { name: "All Gyms", href: "/admin", icon: LayoutDashboard },
    { name: "Owner View", href: "/owner", icon: Settings },
  ]

  const navItems =
    role === "PERSONAL_TRAINER"
      ? trainerNav
      : role === "SUPER_ADMIN"
      ? superAdminNav
      : ownerNav

  return (
    <>
      {/* Mobile Hamburger Button */}
      <div className="lg:hidden fixed top-0 left-0 z-50 p-4">
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open sidebar"
          className="p-2 rounded-md bg-[#171B28] text-white focus:outline-none focus:ring-2 focus:ring-[#007A35]"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Backdrop for Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Content */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-56 transform transition-transform duration-300 ease-in-out bg-[#171B28] text-[#777B87] flex flex-col justify-between select-none
          lg:translate-x-0 lg:static lg:shrink-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div>
          {/* Logo Section */}
          <div className="p-5 border-b border-[#232736] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-[#007A35] flex items-center justify-center text-white shrink-0">
                <Dumbbell className="h-4 w-4" />
              </div>
              <div>
                <h1 className="text-lg font-bold leading-none text-white">GymOS</h1>
                <p className="text-[10px] font-semibold text-[#8B8E98] tracking-wider uppercase mt-1">
                  Management System
                </p>
              </div>
            </div>
            {/* Close Button for Mobile */}
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close sidebar"
              className="lg:hidden text-[#777B87] hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive =
                pathname === item.href ||
                (item.href !== "/owner" && item.href !== "/trainer" && pathname.startsWith(item.href))

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-150 ${
                    isActive
                      ? "bg-[#007A35] text-white shadow-sm"
                      : "text-[#777B87] hover:bg-[#202534] hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Footer / User Profile & Logout */}
        <div className="p-3 border-t border-[#232736]">
          <div className="px-3 py-2 text-xs font-medium text-[#8B8E98] truncate">
            {fullName} ({role.replace("_", " ")})
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-[#777B87] hover:bg-[#202534] hover:text-red-400 transition-colors duration-150 cursor-pointer"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  )
}
```

---

## Step 2: Update Dashboard Layout

Because the hamburger icon is fixed at the top-left on mobile screens, we need to ensure the main content doesn't get obscured.

**File**: `app/(dashboard)/layout.tsx` (Note: adjust path if your layout file is named differently in the dashboard group)
**Action**: Modify existing file

**Current code**:
```tsx
<div className="flex min-h-screen bg-[#F4F5F7]">
  <Sidebar role={session.user.role} fullName={session.user.fullName} />
  <div className="flex-1 flex flex-col min-w-0">
```

**Replace with**:
```tsx
<div className="flex min-h-screen bg-[#F4F5F7]">
  <Sidebar role={session.user.role} fullName={session.user.fullName} />
  <div className="flex-1 flex flex-col min-w-0 lg:pt-0 pt-16">
```
*(Apply the exact classes to pad the top on mobile so the hamburger button has space).*

---

## Step 3: Form Accessibility in Login Page

Ensure inputs have properly associated labels via `htmlFor` and `id`.

**File**: `app/login/page.tsx`
**Action**: Modify existing file

**Current code** (Find the email field snippet):
```tsx
<label className="block text-xs font-semibold text-[#4A4D58] uppercase tracking-wider mb-2">
  Email Address
</label>
<input
  type="email"
  required
```

**Replace with**:
```tsx
<label htmlFor="login-email" className="block text-xs font-semibold text-[#4A4D58] uppercase tracking-wider mb-2">
  Email Address
</label>
<input
  id="login-email"
  type="email"
  required
```

**Current code** (Find the password field snippet):
```tsx
<label className="block text-xs font-semibold text-[#4A4D58] uppercase tracking-wider mb-2">
  Password
</label>
<input
  type="password"
  required
```

**Replace with**:
```tsx
<label htmlFor="login-password" className="block text-xs font-semibold text-[#4A4D58] uppercase tracking-wider mb-2">
  Password
</label>
<input
  id="login-password"
  type="password"
  required
```

---

## Step 4: Header Accessibility

Add ARIA labels to search inputs.

**File**: `components/layout/header.tsx`
**Action**: Modify existing file

**Current code**:
```tsx
<input
  type="text"
  placeholder="Search members, trainers, sessions..."
  className="..."
/>
```

**Replace with**:
```tsx
<input
  id="global-search"
  aria-label="Search members, trainers, sessions"
  type="text"
  placeholder="Search members, trainers, sessions..."
  className="..."
/>
```
*(Maintain whatever `className` string is already present in your file).*

---

## Step 5: Meta Tags & Favicon

**File**: `app/layout.tsx`
**Action**: Modify existing file

**Current code**:
```tsx
export const metadata: Metadata = {
  title: "GymOS — Smart Gym Management System",
  description: "Cloud-based, multi-tenant gym management platform for gym operators, members, and personal trainers.",
};
```

**Replace with**:
```tsx
export const metadata: Metadata = {
  title: {
    default: "GymOS — Smart Gym Management System",
    template: "%s | GymOS",
  },
  description: "Cloud-based, multi-tenant gym management platform for gym operators, members, and personal trainers.",
  keywords: ["gym management", "fitness", "personal training", "SaaS", "gym software"],
  authors: [{ name: "GymOS Team" }],
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "GymOS — Smart Gym Management System",
    description: "Cloud-based gym management platform for operators, trainers, and members.",
    type: "website",
  },
};
```

*(If you do not have a favicon link in the layout, ensure you place `<link rel="icon" href="/favicon.ico" />` in the `<head>` tag inside your `RootLayout` component, or utilize Next.js App Router's `favicon.ico` auto-inclusion by placing a favicon in the `app` directory).*

---

## Verification Steps
1. Run `npm run build` or `npm run dev` to ensure no syntax errors.
2. Open the application in a browser.
3. **Desktop View (>1024px)**: Verify the sidebar is visible and takes up its fixed width on the left.
4. **Mobile View (<1024px)**: Verify the sidebar hides automatically. Check that a hamburger button appears in the top-left corner.
5. Click the hamburger menu to ensure the sidebar slides in as an overlay with a dark backdrop.
6. Click a navigation link on mobile and confirm the sidebar closes automatically.
7. Inspect the login form elements using the browser dev tools to ensure the `label` has `htmlFor` and the `input` has `id`.
8. Inspect the header search input to ensure it has the `aria-label` attribute present.
