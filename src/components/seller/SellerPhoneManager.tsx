"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { SellerPhone } from "@/types";

interface SellerPhoneManagerProps {
  initialPhones: SellerPhone[];
}

export function SellerPhoneManager({ initialPhones }: SellerPhoneManagerProps) {
  const [phones, setPhones] = useState(initialPhones);
  const [newNumber, setNewNumber] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<number | null>(null);

  async function addPhone() {
    setError("");
    if (!/^\d{9}$/.test(newNumber)) {
      setError("Enter a 9-digit local number (e.g. 712345678)");
      return;
    }
    setAdding(true);
    try {
      const res = await fetch("/api/seller/phones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number: newNumber }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to add");
        return;
      }
      setPhones((prev) => [...prev, data.phone]);
      setNewNumber("");
    } catch {
      setError("Something went wrong");
    } finally {
      setAdding(false);
    }
  }

  async function patch(id: number, update: { isPrimary?: boolean; isWhatsApp?: boolean }) {
    setBusy(id);
    try {
      const res = await fetch(`/api/seller/phones/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(update),
      });
      if (!res.ok) return;
      const { phone } = await res.json();
      setPhones((prev) =>
        prev.map((p) => {
          if (update.isPrimary) return p.id === id ? phone : { ...p, isPrimary: false };
          return p.id === id ? phone : p;
        })
      );
    } finally {
      setBusy(null);
    }
  }

  async function remove(id: number) {
    setError("");
    setBusy(id);
    try {
      const res = await fetch(`/api/seller/phones/${id}`, { method: "DELETE" });
      if (res.status === 422) {
        const data = await res.json();
        setError(data.error);
        return;
      }
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        setPhones((prev) => {
          const filtered = prev.filter((p) => p.id !== id);
          if (data.promotedId) {
            return filtered.map((p) => (p.id === data.promotedId ? { ...p, isPrimary: true } : p));
          }
          return filtered;
        });
      }
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {phones.length === 0 && (
        <p className="text-sm text-foreground-muted">No phone numbers added yet.</p>
      )}

      <ul className="flex flex-col divide-y divide-border overflow-hidden rounded-lg border border-border bg-background">
        {phones.map((p) => (
          <li key={p.id} className="flex items-center gap-2 px-4 py-3">
            <span className="font-medium text-foreground">+94 {p.number}</span>

            <div className="ml-1 flex flex-wrap items-center gap-1.5">
              {p.isPrimary ? (
                <span className="rounded-full border border-primary-200 bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700">
                  Primary
                </span>
              ) : (
                <button
                  onClick={() => patch(p.id, { isPrimary: true })}
                  disabled={busy === p.id}
                  className="cursor-pointer rounded-full border border-border px-2 py-0.5 text-xs text-foreground-muted transition-colors hover:border-primary-300 hover:text-primary-600 disabled:opacity-40"
                >
                  Set primary
                </button>
              )}
              <button
                onClick={() => patch(p.id, { isWhatsApp: !p.isWhatsApp })}
                disabled={busy === p.id}
                className={`cursor-pointer rounded-full border px-2 py-0.5 text-xs transition-colors disabled:opacity-40 ${
                  p.isWhatsApp
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-border text-foreground-muted hover:border-green-200 hover:text-green-600"
                }`}
              >
                WhatsApp
              </button>
            </div>

            {phones.length > 1 && (
              <button
                onClick={() => remove(p.id)}
                disabled={busy === p.id}
                className="ml-auto text-foreground-muted transition-colors hover:text-danger disabled:opacity-40"
                title="Remove"
              >
                {busy === p.id ? (
                  <span className="text-xs">…</span>
                ) : (
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            )}
          </li>
        ))}
      </ul>

      {error && <p className="text-sm text-danger">{error}</p>}

      {phones.length < 5 && (
        <div className="flex gap-2">
          <div className="flex flex-1">
            <span className="flex h-10 items-center rounded-l-md border border-r-0 border-border bg-background-subtle px-3 text-sm text-foreground-muted select-none">
              +94
            </span>
            <input
              type="tel"
              value={newNumber}
              onChange={(e) => setNewNumber(e.target.value.replace(/\D/g, "").slice(0, 9))}
              placeholder="712345678"
              maxLength={9}
              className="h-10 w-full rounded-r-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-foreground-muted/50 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
            />
          </div>
          <Button type="button" variant="secondary" onClick={addPhone} disabled={adding}>
            {adding ? "Adding…" : "Add"}
          </Button>
        </div>
      )}
    </div>
  );
}
