"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CurrencyInput } from "@/components/ui/CurrencyInput";

interface Props {
  carPrice: number;
}

interface AmortizationRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

function computeSchedule(
  principal: number,
  annualRatePct: number,
  years: number
): { monthlyPayment: number; totalPayment: number; totalInterest: number; schedule: AmortizationRow[] } | null {
  if (principal <= 0 || years <= 0 || annualRatePct < 0) return null;

  const n = years * 12;
  const r = annualRatePct / 100 / 12;

  let monthlyPayment: number;
  if (r === 0) {
    monthlyPayment = principal / n;
  } else {
    const factor = Math.pow(1 + r, n);
    monthlyPayment = (principal * r * factor) / (factor - 1);
  }

  const schedule: AmortizationRow[] = [];
  let balance = principal;

  for (let month = 1; month <= n; month++) {
    const interest = balance * r;
    const principalPart = monthlyPayment - interest;
    balance = Math.max(0, balance - principalPart);
    schedule.push({ month, payment: monthlyPayment, principal: principalPart, interest, balance });
  }

  return { monthlyPayment, totalPayment: monthlyPayment * n, totalInterest: monthlyPayment * n - principal, schedule };
}

// Full LKR label — used in summary cards
function fmt(n: number) {
  return "LKR " + new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

// Compact number — used inside the table (column header says LKR)
function fmtNum(n: number) {
  return new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

export function LoanCalculatorModal({ carPrice }: Props) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(String(Math.round(carPrice * 0.7)));
  const [years, setYears] = useState("5");
  const [rate, setRate] = useState("12");

  const result = useMemo(() => {
    const p = parseFloat(amount);
    const y = parseFloat(years);
    const r = parseFloat(rate);
    if (isNaN(p) || isNaN(y) || isNaN(r)) return null;
    return computeSchedule(p, r, y);
  }, [amount, years, rate]);

  return (
    <>
      <Button variant="secondary" size="md" className="w-full" onClick={() => setOpen(true)}>
        Calculate Leasing / Loan for this vehicle
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="flex max-h-[92dvh] w-full flex-col rounded-t-2xl bg-background shadow-xl sm:max-h-[85dvh] sm:max-w-2xl sm:rounded-2xl">

            {/* Pull handle — mobile only */}
            <div className="flex justify-center pb-1 pt-3 sm:hidden">
              <div className="h-1 w-10 rounded-full bg-border" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-3 sm:px-6 sm:py-4">
              <h2 className="text-sm font-semibold text-foreground sm:text-base">Loan / Lease Calculator</h2>
              <button
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-foreground-muted hover:bg-background-subtle hover:text-foreground"
                aria-label="Close"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5">

              {/* Inputs */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="col-span-2 sm:col-span-1">
                  <CurrencyInput label="Loan Amount" value={amount} onChange={setAmount} />
                </div>
                <Input
                  label="Term (years)"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={30}
                  value={years}
                  onChange={(e) => setYears(e.target.value)}
                  helperText="1 – 30 years"
                />
                <Input
                  label="Interest Rate (%)"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={0.1}
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  helperText="Annual rate"
                />
              </div>

              {result ? (
                <>
                  {/* Summary cards
                      Mobile:  Monthly Payment full-width on top, then Total Payment + Total Interest side by side
                      Desktop: three equal columns */}
                  <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <div className="col-span-2 rounded-xl border border-primary-200 bg-primary-50 p-4 sm:col-span-1">
                      <p className="text-xs font-medium uppercase tracking-wider text-primary-600">Monthly Payment</p>
                      <p className="mt-1 text-2xl font-bold text-primary-700 sm:text-xl">{fmt(result.monthlyPayment)}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-background-subtle p-4">
                      <p className="text-xs font-medium uppercase tracking-wider text-foreground-muted">Total Payment</p>
                      <p className="mt-1 text-base font-bold text-foreground sm:text-xl">{fmt(result.totalPayment)}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-background-subtle p-4">
                      <p className="text-xs font-medium uppercase tracking-wider text-foreground-muted">Total Interest</p>
                      <p className="mt-1 text-base font-bold text-foreground sm:text-xl">{fmt(result.totalInterest)}</p>
                      <p className="mt-0.5 text-xs text-foreground-muted">extra at end of term</p>
                    </div>
                  </div>

                  {/* Amortization table */}
                  <div className="mt-5">
                    <div className="mb-2 flex items-baseline justify-between">
                      <h3 className="text-sm font-semibold text-foreground">Monthly Breakdown</h3>
                      <span className="text-xs text-foreground-muted">Amounts in LKR</span>
                    </div>
                    <div className="overflow-x-auto rounded-xl border border-border">
                      <table className="w-full min-w-[480px] text-xs sm:text-sm">
                        <thead>
                          <tr className="border-b border-border bg-background-subtle text-left text-xs font-medium uppercase tracking-wider text-foreground-muted">
                            <th className="px-3 py-2.5">Mo.</th>
                            <th className="px-3 py-2.5 text-right">Payment</th>
                            <th className="px-3 py-2.5 text-right">Principal</th>
                            <th className="px-3 py-2.5 text-right">Interest</th>
                            <th className="px-3 py-2.5 text-right">Balance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.schedule.map((row) => (
                            <tr
                              key={row.month}
                              className="border-b border-border last:border-0 odd:bg-background even:bg-background-subtle"
                            >
                              <td className="px-3 py-2 font-medium text-foreground-muted">{row.month}</td>
                              <td className="px-3 py-2 text-right font-medium text-foreground">{fmtNum(row.payment)}</td>
                              <td className="px-3 py-2 text-right text-primary-600">{fmtNum(row.principal)}</td>
                              <td className="px-3 py-2 text-right text-foreground-muted">{fmtNum(row.interest)}</td>
                              <td className="px-3 py-2 text-right text-foreground">{fmtNum(row.balance)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                <p className="mt-6 text-sm text-foreground-muted">Enter valid values above to see the calculation.</p>
              )}

              {/* Bottom safe-area spacer on mobile */}
              <div className="h-4 sm:h-0" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
