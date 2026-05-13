import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { CarImageGallery } from "@/components/cars/CarImageGallery";
import { CarSpecsTable } from "@/components/cars/CarSpecsTable";
import { CarCard } from "@/components/cars/CarCard";
import { ContactButtons, StickyContactCTA } from "@/components/cars/ContactButtons";
import { db } from "@/lib/db";
import { CarStatus } from "@/generated/prisma/client";
import { formatPrice } from "@/lib/utils";
import { getSellerSession, getAdminSession } from "@/lib/auth";
import type { Car, CarImage } from "@/types";

export async function CarDetailContent({ slug }: { slug: string }) {
  // Support legacy numeric ID URLs — redirect to the slug URL
  if (/^\d+$/.test(slug)) {
    const carById = await db.car.findFirst({
      where: { id: Number(slug), status: { not: CarStatus.REJECTED } },
      select: { slug: true },
    });
    if (carById?.slug) redirect(`/cars/${carById.slug}`);
    notFound();
  }

  const car = await db.car.findFirst({
    where: { slug },
    include: {
      images: { orderBy: { order: "asc" } },
      seller: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phones: {
            select: { id: true, number: true, isPrimary: true, isWhatsApp: true },
            orderBy: { createdAt: "asc" },
          },
        },
      },
    },
  });

  if (!car) notFound();

  // REJECTED listings are fully hidden from the public (treat as 404).
  // All other statuses (PENDING, AVAILABLE, RESERVED, SOLD) are publicly accessible
  // so OG metadata is served when sellers share links on social media.
  const [sellerSession, adminSession] = await Promise.all([getSellerSession(), getAdminSession()]);
  const isOwnerView = sellerSession?.sellerId === car.sellerId;
  const isAdminView = adminSession !== null;

  if (car.status === CarStatus.REJECTED && !isOwnerView && !isAdminView) notFound();

  const related = await db.car.findMany({
    where: { status: CarStatus.AVAILABLE, make: car.make, id: { not: car.id } },
    take: 4,
    orderBy: { createdAt: "desc" },
    include: { images: { where: { isPrimary: true }, take: 1 } },
  });

  return (
    <>
      <main className="flex-1 bg-background-subtle">
        {/* ── Mobile: edge-to-edge gallery ──────────────────────────── */}
        <div className="lg:hidden">
          <CarImageGallery
            images={car.images as unknown as CarImage[]}
            title={car.title}
            edgeToEdge
          />
        </div>

        {/* ── Container ─────────────────────────────────────────────── */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 lg:py-8">
          {/* Breadcrumb — desktop only */}
          <nav className="mb-4 hidden text-sm text-foreground-muted lg:block">
            <Link href="/cars" className="hover:text-foreground">
              Browse
            </Link>
            <span className="mx-2">›</span>
            <span className="text-foreground">{car.title}</span>
          </nav>

          {/* Status banner — shown for any non-AVAILABLE listing */}
          {car.status !== CarStatus.AVAILABLE && (
            <div
              className={`mb-6 rounded-lg border px-4 py-3 text-sm font-medium ${
                car.status === "PENDING"
                  ? "border-amber-200 bg-amber-50 text-amber-800"
                  : car.status === "REJECTED"
                    ? "border-red-200 bg-red-50 text-red-800"
                    : "border-border bg-background-subtle text-foreground-muted"
              }`}
            >
              {car.status === "PENDING" &&
                isAdminView &&
                "Admin preview — this listing is pending review and not yet visible to buyers."}
              {car.status === "PENDING" &&
                isOwnerView &&
                !isAdminView &&
                "Your listing is under review and not yet visible to buyers."}
              {car.status === "PENDING" &&
                !isOwnerView &&
                !isAdminView &&
                "This listing is currently under review and not yet available for sale."}
              {car.status === "REJECTED" &&
                isOwnerView &&
                "Your listing was rejected. Please edit it and resubmit for review."}
              {car.status === "REJECTED" &&
                isAdminView &&
                !isOwnerView &&
                "Admin preview — this listing was rejected."}
              {car.status === "RESERVED" && "This listing is currently reserved."}
              {car.status === "SOLD" && "This car has been sold."}
            </div>
          )}

          {/* ── Desktop: original 2-column grid ───────────────────── */}
          <div className="grid gap-8 lg:grid-cols-[3fr_2fr]">
            {/* Gallery — desktop left column */}
            <div className="hidden lg:block">
              <CarImageGallery images={car.images as unknown as CarImage[]} title={car.title} />
            </div>

            {/* Info panel — right column on desktop, full-width on mobile */}
            <div className="flex flex-col gap-6">
              {/* Breadcrumb — mobile only */}
              <nav className="pt-3 text-sm text-foreground-muted lg:hidden">
                <Link href="/cars" className="hover:text-foreground">
                  ← Browse
                </Link>
              </nav>

              {/* Title + price */}
              <div>
                <h1 className="text-2xl font-bold text-foreground">{car.title}</h1>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <p className="text-3xl font-bold text-primary-600">
                    {formatPrice(Number(car.price))}
                  </p>
                  {car.isNegotiable && (
                    <span className="rounded-full border border-green-300 bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                      Negotiable
                    </span>
                  )}
                </div>
              </div>

              <CarSpecsTable car={car as unknown as Car} />

              {/* Emission test */}
              {car.emissionTestUrl && (
                <div>
                  <h2 className="mb-2 text-sm font-semibold tracking-wider text-foreground-muted uppercase">
                    Emission Test
                  </h2>
                  <a
                    href={car.emissionTestUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative block overflow-hidden rounded-lg border border-border"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={car.emissionTestUrl}
                      alt="Emission test certificate"
                      className="max-h-48 w-full object-cover object-top"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                      <span className="rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-foreground">
                        View Full Certificate
                      </span>
                    </div>
                  </a>
                </div>
              )}

              {car.description && (
                <div>
                  <h2 className="mb-2 text-sm font-semibold tracking-wider text-foreground-muted uppercase">
                    Description
                  </h2>
                  <div
                    className="text-sm leading-relaxed text-foreground [&_em]:italic [&_h2]:mb-1 [&_h2]:text-base [&_h2]:font-semibold [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-1 last:[&_p]:mb-0 [&_strong]:font-semibold [&_u]:underline [&_ul]:list-disc [&_ul]:pl-5"
                    dangerouslySetInnerHTML={{ __html: car.description }}
                  />
                </div>
              )}

              {/* Contact card — only for live available listings */}
              {car.seller && car.status === CarStatus.AVAILABLE && !isOwnerView && !isAdminView && (
                <div className="rounded-lg border border-border bg-background p-4">
                  <h2 className="mb-3 text-sm font-semibold tracking-wider text-foreground-muted uppercase">
                    Contact Seller
                  </h2>
                  <p className="font-medium text-foreground">
                    {car.seller.firstName} {car.seller.lastName}
                  </p>
                  <ContactButtons
                    phones={car.seller.phones}
                    carSlug={car.slug ?? String(car.id)}
                    carTitle={car.title}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Related listings */}
          {related.length > 0 && (
            <section className="mt-12">
              <h2 className="mb-4 text-xl font-semibold text-foreground">
                More {car.make} Listings
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                {(related as unknown as Car[]).map((r) => (
                  <CarCard key={r.id} car={r} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Sticky bottom CTA — mobile only, available listings only */}
      {car.status === CarStatus.AVAILABLE && !isOwnerView && !isAdminView && (
        <StickyContactCTA
          phones={car.seller.phones}
          carSlug={car.slug ?? String(car.id)}
          carTitle={car.title}
        />
      )}
    </>
  );
}
