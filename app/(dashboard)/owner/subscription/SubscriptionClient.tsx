"use client"

import { Check, CreditCard, ShieldCheck } from "lucide-react"

interface SubscriptionClientProps {
  subscription: any
}

const TIERS = [
  {
    name: "STARTER",
    price: "$49",
    cycle: "/month",
    features: ["Up to 100 Members", "2 Personal Trainers", "Basic Financials", "Standard Support"],
  },
  {
    name: "GROWTH",
    price: "$99",
    cycle: "/month",
    features: ["Up to 500 Members", "10 Personal Trainers", "Advanced P&L & Payroll", "In-App Messaging", "Priority Support"],
    popular: true,
  },
  {
    name: "PRO",
    price: "$199",
    cycle: "/month",
    features: ["Unlimited Members", "25 Personal Trainers", "Audit Logs & Security", "Custom Analytics", "24/7 Dedicated Support"],
  },
  {
    name: "ENTERPRISE",
    price: "Custom",
    cycle: "",
    features: ["Multi-location Gym Chains", "Unlimited Trainers", "White-label Portal", "SLA Guarantee", "Dedicated Account Manager"],
  },
]

export default function SubscriptionClient({ subscription }: SubscriptionClientProps) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#171B28]">Subscription & Billing</h1>
        <p className="text-xs text-[#8B8E98] mt-1">Manage your GymOS subscription plan, billing details, and tier limits.</p>
      </div>

      {/* 6.1 Current Plan Card */}
      <div className="bg-white p-6 rounded-xl border border-[#E1E1E4] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-[#007A35]/10 text-[#007A35] flex items-center justify-center font-bold">
            <ShieldCheck className="h-6 w-6" />
          </div>

          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-[#171B28]">{subscription.tier} Plan</h2>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  subscription.status === "ACTIVE"
                    ? "bg-emerald-100 text-[#007A35]"
                    : subscription.status === "TRIAL"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {subscription.status}
              </span>
            </div>
            <p className="text-xs text-[#8B8E98] mt-1">
              Billing Cycle: <span className="font-semibold text-[#171B28]">{subscription.billingCycle}</span> • Next Billing Date:{" "}
              <span className="font-semibold text-[#171B28]">{new Date(subscription.nextBillingDate).toLocaleDateString()}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 pt-4 md:pt-0 border-t md:border-t-0 border-[#E1E1E4]">
          {subscription.paymentMethodLast4 && (
            <div className="flex items-center gap-2 text-xs text-[#8B8E98]">
              <CreditCard className="h-4 w-4" />
              <span>•••• {subscription.paymentMethodLast4}</span>
            </div>
          )}
          <button
            onClick={() => alert("Redirecting to Billing Portal...")}
            className="px-4 py-2 bg-white border border-[#E1E1E4] text-xs font-semibold text-[#171B28] rounded-lg shadow-sm hover:bg-gray-50"
          >
            Update Payment Method
          </button>
        </div>
      </div>

      {/* 6.2 Tier Comparison Matrix */}
      <div>
        <h2 className="text-sm font-bold text-[#171B28] mb-4">Available GymOS Plans</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TIERS.map((tier) => {
            const isCurrent = subscription.tier === tier.name

            return (
              <div
                key={tier.name}
                className={`bg-white rounded-xl border p-5 flex flex-col justify-between relative shadow-sm ${
                  isCurrent ? "border-2 border-[#007A35] ring-2 ring-[#007A35]/10" : "border-[#E1E1E4]"
                }`}
              >
                {tier.popular && !isCurrent && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#007A35] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Most Popular
                  </span>
                )}

                {isCurrent && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#007A35] text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Current Plan
                  </span>
                )}

                <div>
                  <h3 className="text-sm font-bold text-[#171B28] mt-1">{tier.name}</h3>
                  <div className="mt-3 flex items-baseline">
                    <span className="text-2xl font-extrabold text-[#171B28]">{tier.price}</span>
                    <span className="text-xs text-[#8B8E98] ml-1">{tier.cycle}</span>
                  </div>

                  <ul className="mt-4 space-y-2 text-xs text-[#171B28]">
                    {tier.features.map((feat, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="h-3.5 w-3.5 text-[#007A35] flex-shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  disabled={isCurrent}
                  onClick={() => alert(`To change your plan to ${tier.name}, please contact Support.`)}
                  className={`mt-6 w-full py-2 rounded-lg text-xs font-bold transition-colors ${
                    isCurrent
                      ? "bg-gray-100 text-gray-400 cursor-default"
                      : "bg-[#007A35] text-white hover:bg-[#00632B]"
                  }`}
                >
                  {isCurrent ? "Active Plan" : "Switch Plan"}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
