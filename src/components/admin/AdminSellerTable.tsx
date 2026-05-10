"use client"

import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import type { Seller } from "@/types"

interface AdminSellerTableProps {
  initialSellers: Seller[]
}

export function AdminSellerTable({ initialSellers }: AdminSellerTableProps) {
  const [sellers, setSellers] = useState(initialSellers)

  async function toggleStatus(id: number, current: string) {
    const status = current === "ACTIVE" ? "SUSPENDED" : "ACTIVE"
    const res = await fetch(`/api/admin/sellers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      const { seller } = await res.json()
      setSellers((prev) => prev.map((s) => (s.id === id ? seller : s)))
    }
  }

  if (sellers.length === 0) {
    return <p className="py-8 text-center text-foreground-muted">No sellers found.</p>
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-background-subtle text-left text-xs font-semibold uppercase tracking-wider text-foreground-muted">
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Phone</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Joined</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sellers.map((seller) => (
            <tr key={seller.id} className="border-b border-border last:border-0 hover:bg-background-subtle">
              <td className="px-4 py-3 font-medium text-foreground">
                {seller.firstName} {seller.lastName}
              </td>
              <td className="px-4 py-3 text-foreground-muted">{seller.email}</td>
              <td className="px-4 py-3 text-foreground-muted">{seller.phone}</td>
              <td className="px-4 py-3">
                <Badge variant={seller.status === "ACTIVE" ? "success" : "danger"}>
                  {seller.status === "ACTIVE" ? "Active" : "Suspended"}
                </Badge>
              </td>
              <td className="px-4 py-3 text-foreground-muted">
                {new Date(seller.createdAt).toLocaleDateString("en-AU")}
              </td>
              <td className="px-4 py-3 text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleStatus(seller.id, seller.status)}
                  className={seller.status === "ACTIVE" ? "text-danger" : "text-success"}
                >
                  {seller.status === "ACTIVE" ? "Suspend" : "Activate"}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
