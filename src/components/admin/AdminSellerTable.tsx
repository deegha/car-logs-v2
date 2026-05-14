"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import type { Seller } from "@/types";

type ConfirmAction = "suspend" | "activate" | "delete";

interface PhoneEdit {
  id?: number;
  number: string;
  isPrimary: boolean;
  isWhatsApp: boolean;
}

interface EditForm {
  firstName: string;
  lastName: string;
  email: string;
  phones: PhoneEdit[];
}

interface AdminSellerTableProps {
  initialSellers: Seller[];
  total: number;
  page: number;
  pages: number;
  searchParam: string;
  statusParam: string;
  activeCount: number;
  suspendedCount: number;
}

export function AdminSellerTable({
  initialSellers,
  total,
  page,
  pages,
  searchParam,
  statusParam,
  activeCount,
  suspendedCount,
}: AdminSellerTableProps) {
  function filterHref(status: string): string {
    const sp = new URLSearchParams();
    if (status) sp.set("status", status);
    if (searchParam) sp.set("search", searchParam);
    const qs = sp.toString();
    return `/admin/dashboard/sellers${qs ? `?${qs}` : ""}`;
  }

  function pageHref(p: number): string {
    const sp = new URLSearchParams();
    if (statusParam) sp.set("status", statusParam);
    if (searchParam) sp.set("search", searchParam);
    sp.set("page", String(p));
    return `/admin/dashboard/sellers?${sp.toString()}`;
  }
  const [sellers, setSellers] = useState(initialSellers);

  const [confirmAction, setConfirmAction] = useState<{
    action: ConfirmAction;
    seller: Seller;
  } | null>(null);
  const [confirming, setConfirming] = useState(false);

  const [editSeller, setEditSeller] = useState<Seller | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");

  function formatDate(d: string | Date): string {
    const date = new Date(d);
    return `${String(date.getUTCDate()).padStart(2, "0")}/${String(date.getUTCMonth() + 1).padStart(2, "0")}/${date.getUTCFullYear()}`;
  }

  function formatPhone(seller: Seller) {
    const primary = seller.phones?.find((p) => p.isPrimary) ?? seller.phones?.[0];
    return primary ? `+94 ${primary.number}` : "—";
  }

  // ── Edit modal ───────────────────────────────────────────────────────

  function openEdit(seller: Seller) {
    setEditSeller(seller);
    setEditForm({
      firstName: seller.firstName,
      lastName: seller.lastName,
      email: seller.email,
      phones:
        seller.phones?.map((p) => ({
          id: p.id,
          number: p.number,
          isPrimary: p.isPrimary,
          isWhatsApp: p.isWhatsApp,
        })) ?? [],
    });
    setEditError("");
  }

  function closeEdit() {
    setEditSeller(null);
    setEditForm(null);
    setEditError("");
  }

  function updatePhone(index: number, patch: Partial<PhoneEdit>) {
    setEditForm((f) => {
      if (!f) return f;
      return { ...f, phones: f.phones.map((p, i) => (i === index ? { ...p, ...patch } : p)) };
    });
  }

  function setPrimary(index: number, checked: boolean) {
    setEditForm((f) => {
      if (!f) return f;
      return {
        ...f,
        phones: f.phones.map((p, i) => ({
          ...p,
          isPrimary: i === index ? checked : checked ? false : p.isPrimary,
        })),
      };
    });
  }

  function removePhone(index: number) {
    setEditForm((f) => (f ? { ...f, phones: f.phones.filter((_, i) => i !== index) } : f));
  }

  function addPhone() {
    setEditForm((f) =>
      f
        ? {
            ...f,
            phones: [...f.phones, { number: "", isPrimary: false, isWhatsApp: false }],
          }
        : f
    );
  }

  async function saveEdit() {
    if (!editSeller || !editForm) return;
    setSaving(true);
    setEditError("");
    try {
      const res = await fetch(`/api/admin/sellers/${editSeller.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: editForm.firstName.trim(),
          lastName: editForm.lastName.trim(),
          email: editForm.email.trim(),
          phones: editForm.phones
            .filter((p) => p.number.trim())
            .map(({ id, number, isPrimary, isWhatsApp }) => ({
              id,
              number: number.trim(),
              isPrimary,
              isWhatsApp,
            })),
        }),
      });
      const data = (await res.json()) as { seller?: Seller; error?: string };
      if (!res.ok) {
        setEditError(data.error ?? "Failed to save changes.");
        return;
      }
      if (data.seller) {
        setSellers((prev) =>
          prev.map((s) => (s.id === editSeller.id ? (data.seller as Seller) : s))
        );
      }
      closeEdit();
    } finally {
      setSaving(false);
    }
  }

  // ── Confirm action ───────────────────────────────────────────────────

  async function executeAction() {
    if (!confirmAction) return;
    setConfirming(true);
    const { action, seller } = confirmAction;

    try {
      if (action === "delete") {
        const res = await fetch(`/api/admin/sellers/${seller.id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          setSellers((prev) => prev.filter((s) => s.id !== seller.id));
        }
      } else {
        const status = action === "suspend" ? "SUSPENDED" : "ACTIVE";
        const res = await fetch(`/api/admin/sellers/${seller.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        if (res.ok) {
          const { seller: updated } = (await res.json()) as { seller: Seller };
          setSellers((prev) => prev.map((s) => (s.id === seller.id ? updated : s)));
        }
      }
    } finally {
      setConfirming(false);
      setConfirmAction(null);
    }
  }

  if (sellers.length === 0) {
    return <p className="py-8 text-center text-foreground-muted">No users found.</p>;
  }

  return (
    <>
      {/* ── Status filter tabs ─────────────────────────────────────── */}
      <div className="mb-4 flex flex-wrap gap-2">
        {[
          { value: "", label: "All", count: activeCount + suspendedCount },
          { value: "ACTIVE", label: "Active", count: activeCount },
          { value: "SUSPENDED", label: "Suspended", count: suspendedCount },
        ].map(({ value, label, count }) => (
          <Link
            key={value}
            href={filterHref(value)}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              statusParam === value
                ? "bg-primary-600 text-white"
                : "border border-border text-foreground-muted hover:bg-background-subtle"
            }`}
          >
            {label}
            <span
              className={`rounded-full px-1.5 py-0.5 text-xs font-semibold ${
                statusParam === value
                  ? "bg-primary-700 text-white"
                  : "bg-background-subtle text-foreground-muted"
              }`}
            >
              {count}
            </span>
          </Link>
        ))}
      </div>

      {/* ── Table ─────────────────────────────────────────────────── */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-background-subtle text-left text-xs font-semibold tracking-wider text-foreground-muted uppercase">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sellers.map((seller) => {
              const href = `/admin/dashboard/sellers/${seller.id}`;
              const cellLink = "block px-4 py-3 group-hover:bg-background-subtle";
              return (
                <tr key={seller.id} className="group border-b border-border last:border-0">
                  <td className="p-0">
                    <Link href={href} className={`${cellLink} font-medium text-foreground`}>
                      {seller.firstName} {seller.lastName}
                    </Link>
                  </td>
                  <td className="p-0">
                    <Link href={href} className={`${cellLink} text-foreground-muted`}>
                      {seller.email}
                    </Link>
                  </td>
                  <td className="p-0">
                    <Link href={href} className={`${cellLink} text-foreground-muted`}>
                      {formatPhone(seller)}
                    </Link>
                  </td>
                  <td className="p-0">
                    <Link href={href} className={`${cellLink} flex items-center`}>
                      <Badge variant={seller.status === "ACTIVE" ? "success" : "danger"}>
                        {seller.status === "ACTIVE" ? "Active" : "Suspended"}
                      </Badge>
                    </Link>
                  </td>
                  <td className="p-0">
                    <Link href={href} className={`${cellLink} text-foreground-muted`}>
                      {formatDate(seller.createdAt)}
                    </Link>
                  </td>
                  <td className="px-4 py-3 group-hover:bg-background-subtle">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(seller)}>
                        Edit
                      </Button>
                      {seller.status === "ACTIVE" ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-amber-600"
                          onClick={() => setConfirmAction({ action: "suspend", seller })}
                        >
                          Suspend
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-green-600"
                          onClick={() => setConfirmAction({ action: "activate", seller })}
                        >
                          Activate
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-danger"
                        onClick={() => setConfirmAction({ action: "delete", seller })}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ────────────────────────────────────────────── */}
      {pages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <p className="text-foreground-muted">
            Page {page} of {pages} · {total.toLocaleString()} users
          </p>
          <div className="flex gap-2">
            {page > 1 ? (
              <Link
                href={pageHref(page - 1)}
                className="rounded-md border border-border bg-background px-3 py-1.5 text-foreground hover:bg-background-subtle"
              >
                ← Previous
              </Link>
            ) : (
              <span className="rounded-md border border-border px-3 py-1.5 text-foreground-muted opacity-40">
                ← Previous
              </span>
            )}
            {page < pages ? (
              <Link
                href={pageHref(page + 1)}
                className="rounded-md border border-border bg-background px-3 py-1.5 text-foreground hover:bg-background-subtle"
              >
                Next →
              </Link>
            ) : (
              <span className="rounded-md border border-border px-3 py-1.5 text-foreground-muted opacity-40">
                Next →
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── Confirm modal ─────────────────────────────────────────── */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl border border-border bg-background p-6 shadow-lg">
            <h2 className="mb-1 text-lg font-semibold text-foreground">
              {confirmAction.action === "suspend" && "Suspend user?"}
              {confirmAction.action === "activate" && "Reactivate user?"}
              {confirmAction.action === "delete" && "Delete user?"}
            </h2>
            <p className="mb-1 text-sm font-medium text-foreground">
              {confirmAction.seller.firstName} {confirmAction.seller.lastName}
            </p>
            <p className="mb-6 text-sm text-foreground-muted">
              {confirmAction.action === "suspend" &&
                "This will suspend the user and hide all their active and pending listings from buyers."}
              {confirmAction.action === "activate" &&
                "This will reactivate the user. Their listings will be moved back to pending review."}
              {confirmAction.action === "delete" &&
                "This cannot be undone. The user and all their listings will be permanently deleted."}
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => setConfirmAction(null)}
                disabled={confirming}
              >
                Cancel
              </Button>
              <Button
                onClick={executeAction}
                disabled={confirming}
                className={
                  confirmAction.action === "delete"
                    ? "bg-danger text-white hover:bg-red-700"
                    : confirmAction.action === "suspend"
                      ? "bg-amber-500 text-white hover:bg-amber-600"
                      : "bg-green-600 text-white hover:bg-green-700"
                }
              >
                {confirming
                  ? "Please wait…"
                  : confirmAction.action === "suspend"
                    ? "Suspend"
                    : confirmAction.action === "activate"
                      ? "Reactivate"
                      : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit modal ────────────────────────────────────────────── */}
      {editSeller && editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl border border-border bg-background p-6 shadow-lg">
            <h2 className="mb-5 text-lg font-semibold text-foreground">Edit User</h2>

            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  value={editForm.firstName}
                  onChange={(e) =>
                    setEditForm((f) => (f ? { ...f, firstName: e.target.value } : f))
                  }
                />
                <Input
                  label="Last Name"
                  value={editForm.lastName}
                  onChange={(e) => setEditForm((f) => (f ? { ...f, lastName: e.target.value } : f))}
                />
              </div>

              <Input
                label="Email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm((f) => (f ? { ...f, email: e.target.value } : f))}
              />

              <div>
                <p className="mb-2 text-sm font-medium text-foreground">Phone Numbers</p>
                <div className="flex flex-col gap-2">
                  {editForm.phones.map((phone, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="shrink-0 text-sm text-foreground-muted">+94</span>
                      <input
                        type="text"
                        value={phone.number}
                        onChange={(e) => updatePhone(i, { number: e.target.value })}
                        placeholder="771234567"
                        className="min-w-0 flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted/50 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                      />
                      <label className="flex shrink-0 cursor-pointer items-center gap-1 text-xs text-foreground-muted">
                        <input
                          type="checkbox"
                          checked={phone.isPrimary}
                          onChange={(e) => setPrimary(i, e.target.checked)}
                          className="accent-primary-600"
                        />
                        Primary
                      </label>
                      <label className="flex shrink-0 cursor-pointer items-center gap-1 text-xs text-foreground-muted">
                        <input
                          type="checkbox"
                          checked={phone.isWhatsApp}
                          onChange={(e) => updatePhone(i, { isWhatsApp: e.target.checked })}
                          className="accent-primary-600"
                        />
                        WhatsApp
                      </label>
                      <button
                        type="button"
                        onClick={() => removePhone(i)}
                        className="shrink-0 text-sm text-danger hover:text-red-700"
                        aria-label="Remove phone"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addPhone}
                    className="mt-1 text-left text-sm text-primary-600 hover:underline"
                  >
                    + Add phone number
                  </button>
                </div>
              </div>

              {editError && (
                <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-danger">{editError}</p>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="secondary" onClick={closeEdit} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={saveEdit} disabled={saving}>
                {saving ? "Saving…" : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
