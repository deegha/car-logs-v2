import { AdminSellerTable } from "@/components/admin/AdminSellerTable";
import { db } from "@/lib/db";
import { SellerStatus } from "@/generated/prisma/client";
import type { Seller } from "@/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Users",
};

const PAGE_SIZE = 20;

export default async function AdminSellersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const searchParam = String(params.search ?? "").trim();
  const statusParam = String(params.status ?? "");
  const page = Math.max(1, Number(params.page) || 1);

  const status = Object.values(SellerStatus).includes(statusParam as SellerStatus)
    ? (statusParam as SellerStatus)
    : null;

  const nameWhere = (search: string) =>
    search ? { OR: [{ firstName: { contains: search } }, { lastName: { contains: search } }] } : {};

  const where = {
    ...(status && { status }),
    ...nameWhere(searchParam),
  };

  const [sellers, total, activeCount, suspendedCount] = await Promise.all([
    db.seller.findMany({
      where,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        phones: { select: { id: true, number: true, isPrimary: true, isWhatsApp: true } },
      },
    }),
    db.seller.count({ where }),
    db.seller.count({ where: { status: SellerStatus.ACTIVE, ...nameWhere(searchParam) } }),
    db.seller.count({ where: { status: SellerStatus.SUSPENDED, ...nameWhere(searchParam) } }),
  ]);

  const pages = Math.ceil(total / PAGE_SIZE);
  const clearHref = statusParam
    ? `/admin/dashboard/sellers?status=${statusParam}`
    : "/admin/dashboard/sellers";

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Users</h1>
        <p className="text-sm text-foreground-muted">{total.toLocaleString()} total</p>
      </div>

      {/* Search form */}
      <form method="GET" action="/admin/dashboard/sellers" className="mb-4 flex gap-2">
        {statusParam && <input type="hidden" name="status" value={statusParam} />}
        <input
          type="search"
          name="search"
          defaultValue={searchParam}
          placeholder="Search by name…"
          className="h-9 min-w-48 flex-1 rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-foreground-muted focus:ring-2 focus:ring-primary-500 focus:outline-none"
        />
        <button
          type="submit"
          className="h-9 rounded-md bg-primary-600 px-4 text-sm font-medium text-white hover:bg-primary-700"
        >
          Search
        </button>
        {searchParam && (
          <a
            href={clearHref}
            className="inline-flex h-9 items-center rounded-md border border-border bg-background px-3 text-sm text-foreground hover:bg-background-subtle"
          >
            Clear
          </a>
        )}
      </form>

      <AdminSellerTable
        initialSellers={sellers as unknown as Seller[]}
        total={total}
        page={page}
        pages={pages}
        searchParam={searchParam}
        statusParam={statusParam}
        activeCount={activeCount}
        suspendedCount={suspendedCount}
      />
    </div>
  );
}
