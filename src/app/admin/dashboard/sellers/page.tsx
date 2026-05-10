import { AdminSellerTable } from "@/components/admin/AdminSellerTable"
import { db } from "@/lib/db"
import type { Seller } from "@/types"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "All Sellers",
}

export default async function AdminSellersPage() {
  const sellers = await db.seller.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Sellers</h1>
        <p className="text-sm text-foreground-muted">
          {sellers.length.toLocaleString()} total
        </p>
      </div>
      <AdminSellerTable initialSellers={sellers as unknown as Seller[]} />
    </div>
  )
}
