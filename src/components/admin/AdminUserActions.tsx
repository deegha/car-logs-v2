"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
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

interface AdminUserActionsProps {
  seller: Seller;
}

export function AdminUserActions({ seller: initial }: AdminUserActionsProps) {
  const router = useRouter();
  const [seller, setSeller] = useState(initial);

  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [confirming, setConfirming] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<EditForm>({
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
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");

  // ── Edit ────────────────────────────────────────────────────────────

  function openEdit() {
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
    setEditOpen(true);
  }

  function updatePhone(index: number, patch: Partial<PhoneEdit>) {
    setEditForm((f) => ({
      ...f,
      phones: f.phones.map((p, i) => (i === index ? { ...p, ...patch } : p)),
    }));
  }

  function setPrimary(index: number, checked: boolean) {
    setEditForm((f) => ({
      ...f,
      phones: f.phones.map((p, i) => ({
        ...p,
        isPrimary: i === index ? checked : checked ? false : p.isPrimary,
      })),
    }));
  }

  function removePhone(index: number) {
    setEditForm((f) => ({ ...f, phones: f.phones.filter((_, i) => i !== index) }));
  }

  function addPhone() {
    setEditForm((f) => ({
      ...f,
      phones: [...f.phones, { number: "", isPrimary: false, isWhatsApp: false }],
    }));
  }

  async function saveEdit() {
    setSaving(true);
    setEditError("");
    try {
      const res = await fetch(`/api/admin/sellers/${seller.id}`, {
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
      if (data.seller) setSeller(data.seller);
      setEditOpen(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  // ── Confirm action ──────────────────────────────────────────────────

  async function executeAction() {
    if (!confirmAction) return;
    setConfirming(true);
    try {
      if (confirmAction === "delete") {
        const res = await fetch(`/api/admin/sellers/${seller.id}`, {
          method: "DELETE",
        });
        if (res.ok) router.push("/admin/dashboard/sellers");
      } else {
        const status = confirmAction === "suspend" ? "SUSPENDED" : "ACTIVE";
        const res = await fetch(`/api/admin/sellers/${seller.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        if (res.ok) {
          const { seller: updated } = (await res.json()) as { seller: Seller };
          setSeller(updated);
          router.refresh();
        }
      }
    } finally {
      setConfirming(false);
      setConfirmAction(null);
    }
  }

  return (
    <>
      <div className="flex shrink-0 flex-wrap gap-2">
        <Button variant="secondary" size="sm" onClick={openEdit}>
          Edit
        </Button>
        {seller.status === "ACTIVE" ? (
          <Button
            variant="secondary"
            size="sm"
            className="border-amber-200 text-amber-600 hover:bg-amber-50"
            onClick={() => setConfirmAction("suspend")}
          >
            Suspend
          </Button>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            className="border-green-200 text-green-600 hover:bg-green-50"
            onClick={() => setConfirmAction("activate")}
          >
            Reactivate
          </Button>
        )}
        <Button
          variant="secondary"
          size="sm"
          className="border-red-200 text-danger hover:bg-red-50"
          onClick={() => setConfirmAction("delete")}
        >
          Delete
        </Button>
      </div>

      {/* ── Confirm modal ─────────────────────────────────────────── */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl border border-border bg-background p-6 shadow-lg">
            <h2 className="mb-1 text-lg font-semibold text-foreground">
              {confirmAction === "suspend" && "Suspend user?"}
              {confirmAction === "activate" && "Reactivate user?"}
              {confirmAction === "delete" && "Delete user?"}
            </h2>
            <p className="mb-1 text-sm font-medium text-foreground">
              {seller.firstName} {seller.lastName}
            </p>
            <p className="mb-6 text-sm text-foreground-muted">
              {confirmAction === "suspend" &&
                "This will suspend the user and hide all their active and pending listings from buyers."}
              {confirmAction === "activate" &&
                "This will reactivate the user. Their listings will be moved back to pending review."}
              {confirmAction === "delete" &&
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
                  confirmAction === "delete"
                    ? "bg-danger text-white hover:bg-red-700"
                    : confirmAction === "suspend"
                      ? "bg-amber-500 text-white hover:bg-amber-600"
                      : "bg-green-600 text-white hover:bg-green-700"
                }
              >
                {confirming
                  ? "Please wait…"
                  : confirmAction === "suspend"
                    ? "Suspend"
                    : confirmAction === "activate"
                      ? "Reactivate"
                      : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit modal ────────────────────────────────────────────── */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl border border-border bg-background p-6 shadow-lg">
            <h2 className="mb-5 text-lg font-semibold text-foreground">Edit User</h2>

            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  value={editForm.firstName}
                  onChange={(e) => setEditForm((f) => ({ ...f, firstName: e.target.value }))}
                />
                <Input
                  label="Last Name"
                  value={editForm.lastName}
                  onChange={(e) => setEditForm((f) => ({ ...f, lastName: e.target.value }))}
                />
              </div>

              <Input
                label="Email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
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
              <Button variant="secondary" onClick={() => setEditOpen(false)} disabled={saving}>
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
