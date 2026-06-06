"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { Admin, AdminRole } from "@/types";

const ROLE_LABELS: Record<AdminRole, string> = {
  SUPER_ADMIN: "Super Admin",
  MANAGER: "Manager",
  EDITOR: "Editor",
};

const ROLE_DESCRIPTIONS: Record<AdminRole, string> = {
  SUPER_ADMIN: "Full access including users and admin management",
  MANAGER: "Manage listings; no access to users or admins",
  EDITOR: "Add listings and approve / reject listings only",
};

interface Props {
  initialAdmins: Admin[];
  currentAdminId: number;
}

type ModalState =
  | { type: "add" }
  | { type: "edit"; admin: Admin }
  | { type: "delete"; admin: Admin }
  | null;

export function AdminManagement({ initialAdmins, currentAdminId }: Props) {
  const [admins, setAdmins] = useState(initialAdmins);
  const [modal, setModal] = useState<ModalState>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Add admin ────────────────────────────────────────────────────
  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const data = new FormData(e.currentTarget);
    const body = {
      email: data.get("email") as string,
      password: data.get("password") as string,
      role: data.get("role") as string,
    };
    setSaving(true);
    try {
      const res = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Failed to create admin");
        return;
      }
      setAdmins((prev) => [...prev, { ...json.admin, createdAt: new Date(json.admin.createdAt) }]);
      setModal(null);
    } finally {
      setSaving(false);
    }
  }

  // ── Edit admin ───────────────────────────────────────────────────
  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (modal?.type !== "edit") return;
    setError(null);
    const data = new FormData(e.currentTarget);
    const body: Record<string, string> = { role: data.get("role") as string };
    const pw = (data.get("password") as string).trim();
    if (pw) body.password = pw;

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/admins/${modal.admin.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Failed to update admin");
        return;
      }
      setAdmins((prev) =>
        prev.map((a) =>
          a.id === modal.admin.id
            ? { ...a, ...json.admin, createdAt: new Date(json.admin.createdAt) }
            : a
        )
      );
      setModal(null);
    } finally {
      setSaving(false);
    }
  }

  // ── Delete admin ─────────────────────────────────────────────────
  async function handleDelete() {
    if (modal?.type !== "delete") return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/admins/${modal.admin.id}`, { method: "DELETE" });
      if (res.ok) {
        setAdmins((prev) => prev.filter((a) => a.id !== modal.admin.id));
        setModal(null);
      }
    } finally {
      setSaving(false);
    }
  }

  function closeModal() {
    setModal(null);
    setError(null);
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-foreground-muted">
          {admins.length} admin{admins.length !== 1 ? "s" : ""}
        </p>
        <Button
          size="sm"
          onClick={() => {
            setError(null);
            setModal({ type: "add" });
          }}
        >
          + Add Admin
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-background">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-background-subtle text-left text-xs font-semibold tracking-wider text-foreground-muted uppercase">
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Added</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((a) => (
              <tr
                key={a.id}
                className="border-b border-border last:border-0 hover:bg-background-subtle"
              >
                <td className="px-4 py-3 font-medium text-foreground">
                  {a.email}
                  {a.id === currentAdminId && (
                    <span className="ml-2 text-xs text-foreground-muted">(you)</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <RoleBadge role={a.role} />
                </td>
                <td className="px-4 py-3 text-foreground-muted">
                  {new Date(a.createdAt).toLocaleDateString("en-AU")}
                </td>
                <td className="px-4 py-3 text-right">
                  {a.id !== currentAdminId ? (
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setError(null);
                          setModal({ type: "edit", admin: a });
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-danger"
                        onClick={() => setModal({ type: "delete", admin: a })}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <span className="text-xs text-foreground-muted">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Add Modal ─────────────────────────────────────────────── */}
      {modal?.type === "add" && (
        <Modal title="Add Admin" onClose={closeModal}>
          <form onSubmit={handleAdd} className="flex flex-col gap-4">
            {error && <p className="text-sm text-danger">{error}</p>}
            <Field label="Email">
              <input name="email" type="email" required autoFocus className={inputCls} />
            </Field>
            <Field label="Password">
              <input
                name="password"
                type="password"
                required
                minLength={8}
                className={inputCls}
                placeholder="Min 8 characters"
              />
            </Field>
            <Field label="Role">
              <RoleSelect name="role" defaultValue="EDITOR" />
            </Field>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" type="button" onClick={closeModal} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Creating…" : "Create Admin"}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Edit Modal ─────────────────────────────────────────────── */}
      {modal?.type === "edit" && (
        <Modal title={`Edit ${modal.admin.email}`} onClose={closeModal}>
          <form onSubmit={handleEdit} className="flex flex-col gap-4">
            {error && <p className="text-sm text-danger">{error}</p>}
            <Field label="Role">
              <RoleSelect name="role" defaultValue={modal.admin.role} />
            </Field>
            <Field label="New Password" hint="Leave blank to keep unchanged">
              <input
                name="password"
                type="password"
                minLength={8}
                className={inputCls}
                placeholder="Min 8 characters (optional)"
              />
            </Field>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" type="button" onClick={closeModal} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : "Save Changes"}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Delete Modal ────────────────────────────────────────────── */}
      {modal?.type === "delete" && (
        <Modal title="Remove Admin" onClose={closeModal}>
          <p className="mb-1 text-sm text-foreground">
            Remove <span className="font-semibold">{modal.admin.email}</span>?
          </p>
          <p className="mb-6 text-sm text-danger">
            This cannot be undone. They will lose all admin access.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={closeModal} disabled={saving}>
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={saving}
              className="bg-danger text-white hover:bg-red-700"
            >
              {saving ? "Removing…" : "Remove"}
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}

// ── Small helpers ──────────────────────────────────────────────────

const inputCls =
  "h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-foreground-muted focus:ring-2 focus:ring-primary-500 focus:outline-none";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      {hint && <p className="text-xs text-foreground-muted">{hint}</p>}
      {children}
    </div>
  );
}

function RoleSelect({ name, defaultValue }: { name: string; defaultValue: AdminRole }) {
  return (
    <select name={name} defaultValue={defaultValue} className={inputCls}>
      {(Object.keys(ROLE_LABELS) as AdminRole[]).map((r) => (
        <option key={r} value={r}>
          {ROLE_LABELS[r]} — {ROLE_DESCRIPTIONS[r]}
        </option>
      ))}
    </select>
  );
}

function RoleBadge({ role }: { role: AdminRole }) {
  const colors: Record<AdminRole, string> = {
    SUPER_ADMIN: "bg-primary-50 text-primary-700 border-primary-200",
    MANAGER: "bg-blue-50 text-blue-700 border-blue-200",
    EDITOR: "bg-green-50 text-green-700 border-green-200",
  };
  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${colors[role]}`}
    >
      {ROLE_LABELS[role]}
    </span>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <button
            onClick={onClose}
            className="text-foreground-muted hover:text-foreground"
            aria-label="Close"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
