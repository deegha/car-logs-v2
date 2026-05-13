import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { formatPrice, formatMileage } from "@/lib/utils";
import type { Metadata } from "next";
import type { CarStatus } from "@/types";

export const metadata: Metadata = { title: "Review Listing — Admin" };

type Props = { params: Promise<{ id: string }> };

const conditionLabels: Record<string, string> = {
  NEW: "Brand New",
  USED: "Used",
  RECONDITIONED: "Reconditioned",
};

const conditionColors: Record<string, string> = {
  NEW: "bg-emerald-50 text-emerald-700 border-emerald-200",
  USED: "bg-sky-50 text-sky-700 border-sky-200",
  RECONDITIONED: "bg-violet-50 text-violet-700 border-violet-200",
};

const fuelLabels: Record<string, string> = {
  PETROL: "Petrol",
  DIESEL: "Diesel",
  HYBRID: "Hybrid",
  ELECTRIC: "Electric",
  PLUGIN_HYBRID: "Plug-in Hybrid",
};

const transmissionLabels: Record<string, string> = {
  AUTOMATIC: "Automatic",
  MANUAL: "Manual",
  CVT: "CVT",
};

const statusConfig: Record<CarStatus, { label: string; className: string; banner: string }> = {
  PENDING: {
    label: "Pending Review",
    className: "bg-amber-100 text-amber-800 border border-amber-300",
    banner: "border-amber-200 bg-amber-50 text-amber-800",
  },
  AVAILABLE: {
    label: "Available",
    className: "bg-emerald-100 text-emerald-800 border border-emerald-300",
    banner: "",
  },
  RESERVED: {
    label: "Reserved",
    className: "bg-blue-100 text-blue-800 border border-blue-300",
    banner: "",
  },
  SOLD: {
    label: "Sold",
    className: "bg-gray-100 text-gray-700 border border-gray-300",
    banner: "",
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-red-100 text-red-800 border border-red-300",
    banner: "border-red-200 bg-red-50 text-red-800",
  },
};

async function approveAction(carId: number) {
  "use server";
  const { db } = await import("@/lib/db");
  await db.car.update({ where: { id: carId }, data: { status: "AVAILABLE" } });
  const { revalidatePath } = await import("next/cache");
  revalidatePath(`/admin/dashboard/listings/${carId}`);
  revalidatePath("/admin/dashboard/listings");
}

async function rejectAction(carId: number) {
  "use server";
  const { db } = await import("@/lib/db");
  await db.car.update({ where: { id: carId }, data: { status: "REJECTED" } });
  const { revalidatePath } = await import("next/cache");
  revalidatePath(`/admin/dashboard/listings/${carId}`);
  revalidatePath("/admin/dashboard/listings");
}

export default async function AdminListingReviewPage({ params }: Props) {
  const { id } = await params;
  const carId = Number(id);
  if (isNaN(carId)) notFound();

  const session = await getAdminSession();
  if (!session) notFound();

  const car = await db.car.findUnique({
    where: { id: carId },
    include: {
      images: { orderBy: { order: "asc" } },
      seller: { include: { phones: true } },
    },
  });
  if (!car) notFound();

  const status = car.status as CarStatus;
  const sc = statusConfig[status] ?? statusConfig.PENDING;
  const photos = car.images.filter((img) => img.url !== car.emissionTestUrl);
  const coverPhoto = photos.find((img) => img.isPrimary) ?? photos[0];
  const otherPhotos = photos.filter((img) => img.id !== coverPhoto?.id);
  const primaryPhone = car.seller?.phones?.find((p) => p.isPrimary) ?? car.seller?.phones?.[0];
  const whatsappPhone = car.seller?.phones?.find((p) => p.isWhatsApp && !p.isPrimary);

  const approveWithId = approveAction.bind(null, carId);
  const rejectWithId = rejectAction.bind(null, carId);

  return (
    <div className="min-h-screen bg-background-subtle">
      {/* ── Sticky top bar ─────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/admin/dashboard/listings"
              className="flex shrink-0 items-center gap-1.5 text-sm text-foreground-muted hover:text-foreground"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Listings
            </Link>
            <span className="text-foreground-muted/40">/</span>
            <span className="truncate text-sm font-medium text-foreground">{car.title}</span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${sc.className}`}>
              {sc.label}
            </span>
            {status === "PENDING" && (
              <>
                <form action={approveWithId}>
                  <button
                    type="submit"
                    className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
                  >
                    Approve
                  </button>
                </form>
                <form action={rejectWithId}>
                  <button
                    type="submit"
                    className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700"
                  >
                    Reject
                  </button>
                </form>
              </>
            )}
            <Link
              href={`/admin/dashboard/listings/${car.id}/edit`}
              className="rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-background-subtle"
            >
              Edit
            </Link>
            <Link
              href={`/cars/${car.slug ?? car.id}?adminPreview=1`}
              target="_blank"
              className="rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-background-subtle"
            >
              View Live ↗
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {/* ── Pending alert banner ─────────────────────────────────── */}
        {status === "PENDING" && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5">
            <svg
              className="mt-0.5 h-5 w-5 shrink-0 text-amber-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="text-sm font-semibold text-amber-800">Awaiting your review</p>
              <p className="mt-0.5 text-sm text-amber-700">
                This listing is not yet visible to buyers. Review the details below and approve or
                reject.
              </p>
            </div>
          </div>
        )}

        {status === "REJECTED" && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5">
            <svg
              className="mt-0.5 h-5 w-5 shrink-0 text-red-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm font-medium text-red-800">This listing was rejected.</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* ── Left: photos + description ────────────────────────── */}
          <div className="flex flex-col gap-6 lg:col-span-3">
            {/* Photo gallery */}
            <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
              <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
                <h2 className="text-sm font-semibold text-foreground">
                  Photos
                  <span className="ml-1.5 text-xs font-normal text-foreground-muted">
                    ({photos.length})
                  </span>
                </h2>
                {photos.length === 0 && (
                  <span className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">
                    No photos
                  </span>
                )}
              </div>
              {photos.length === 0 ? (
                <div className="flex h-40 items-center justify-center text-sm text-foreground-muted">
                  No photos uploaded for this listing.
                </div>
              ) : (
                <div className="flex flex-col gap-2 p-3">
                  {/* Cover photo */}
                  {coverPhoto && (
                    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-background-subtle">
                      <Image
                        src={coverPhoto.url}
                        alt={coverPhoto.alt ?? "Cover photo"}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 60vw"
                        priority
                      />
                      <span className="absolute top-2.5 left-2.5 rounded-md bg-black/60 px-2 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
                        Cover
                      </span>
                    </div>
                  )}
                  {/* Thumbnails */}
                  {otherPhotos.length > 0 && (
                    <div className="grid grid-cols-4 gap-2">
                      {otherPhotos.map((img, i) => (
                        <div
                          key={img.id}
                          className="relative aspect-video overflow-hidden rounded-lg bg-background-subtle"
                        >
                          <Image
                            src={img.url}
                            alt={img.alt ?? `Photo ${i + 2}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 1024px) 25vw, 15vw"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Description */}
            {car.description && (
              <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
                <div className="border-b border-border px-5 py-3.5">
                  <h2 className="text-sm font-semibold text-foreground">Description</h2>
                </div>
                <div
                  className="px-5 py-4 text-sm leading-relaxed text-foreground [&_em]:italic [&_h2]:mb-1 [&_h2]:text-base [&_h2]:font-semibold [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-2 last:[&_p]:mb-0 [&_strong]:font-semibold [&_u]:underline [&_ul]:list-disc [&_ul]:pl-5"
                  dangerouslySetInnerHTML={{ __html: car.description }}
                />
              </div>
            )}

            {/* Emission test */}
            {car.emissionTestUrl && (
              <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
                <div className="border-b border-border px-5 py-3.5">
                  <h2 className="text-sm font-semibold text-foreground">
                    Emission Test Certificate
                  </h2>
                </div>
                <div className="p-3">
                  <a
                    href={car.emissionTestUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative block overflow-hidden rounded-xl"
                  >
                    <div className="relative aspect-[4/3] max-w-xs overflow-hidden rounded-xl bg-background-subtle">
                      <Image
                        src={car.emissionTestUrl}
                        alt="Emission test certificate"
                        fill
                        className="object-contain"
                        sizes="300px"
                      />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                      <span className="rounded-md bg-white/90 px-3 py-1.5 text-xs font-semibold text-foreground">
                        Open full size ↗
                      </span>
                    </div>
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* ── Right: specs + seller ─────────────────────────────── */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            {/* Price + condition hero */}
            <div className="rounded-2xl border border-border bg-background p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-2xl font-bold text-primary-600">
                    {formatPrice(Number(car.price))}
                  </p>
                  {car.isNegotiable && (
                    <span className="mt-1 inline-block rounded-full border border-green-300 bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                      Negotiable
                    </span>
                  )}
                </div>
                <span
                  className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${conditionColors[car.condition] ?? "border-border bg-background-subtle text-foreground"}`}
                >
                  {conditionLabels[car.condition] ?? car.condition}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-foreground-muted">
                <span>
                  {car.year} · {car.make} {car.model}
                </span>
                <span>{formatMileage(car.mileage)}</span>
              </div>
              {(car.province || car.district || car.town) && (
                <p className="mt-1 text-sm text-foreground-muted">
                  📍 {[car.town, car.district, car.province].filter(Boolean).join(", ")}
                </p>
              )}
            </div>

            {/* Vehicle specs */}
            <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
              <div className="border-b border-border px-5 py-3.5">
                <h2 className="text-sm font-semibold text-foreground">Vehicle Specs</h2>
              </div>
              <div className="divide-y divide-border">
                {[
                  { label: "Fuel Type", value: fuelLabels[car.fuelType] ?? car.fuelType },
                  {
                    label: "Transmission",
                    value: transmissionLabels[car.transmission] ?? car.transmission,
                  },
                  car.bodyType && { label: "Body Type", value: car.bodyType },
                  car.engineSize && { label: "Engine Size", value: car.engineSize },
                  car.color && { label: "Colour", value: car.color },
                  { label: "Featured", value: car.featured ? "Yes" : "No" },
                  {
                    label: "Listed",
                    value: new Date(car.createdAt).toLocaleDateString("en-AU", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }),
                  },
                  {
                    label: "Updated",
                    value: new Date(car.updatedAt).toLocaleDateString("en-AU", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }),
                  },
                ]
                  .filter(Boolean)
                  .map((row) => (
                    <div
                      key={(row as { label: string }).label}
                      className="flex items-center gap-3 px-5 py-2.5"
                    >
                      <span className="w-28 shrink-0 text-xs font-medium text-foreground-muted">
                        {(row as { label: string }).label}
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {(row as { value: string }).value}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Seller card */}
            {car.seller && (
              <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
                <div className="border-b border-border px-5 py-3.5">
                  <h2 className="text-sm font-semibold text-foreground">Seller</h2>
                </div>
                <div className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-base font-bold text-primary-700">
                      {car.seller.firstName[0]}
                      {car.seller.lastName[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {car.seller.firstName} {car.seller.lastName}
                      </p>
                      <p className="text-xs text-foreground-muted">{car.seller.email}</p>
                    </div>
                  </div>

                  {(primaryPhone || whatsappPhone) && (
                    <div className="mt-4 flex flex-col gap-2">
                      {primaryPhone && (
                        <a
                          href={`tel:${primaryPhone.number}`}
                          className="flex items-center gap-2.5 rounded-lg border border-border bg-background-subtle px-3.5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-background"
                        >
                          <svg
                            className="h-4 w-4 text-foreground-muted"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.8}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                            />
                          </svg>
                          {primaryPhone.number}
                        </a>
                      )}
                      {whatsappPhone && (
                        <a
                          href={`https://wa.me/${whatsappPhone.number.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2.5 rounded-lg border border-green-200 bg-green-50 px-3.5 py-2.5 text-sm font-medium text-green-800 transition-colors hover:bg-green-100"
                        >
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                          </svg>
                          {whatsappPhone.number}
                        </a>
                      )}
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap gap-3 border-t border-border pt-4 text-xs text-foreground-muted">
                    <span>
                      Status:{" "}
                      <span
                        className={`font-semibold ${car.seller.status === "ACTIVE" ? "text-emerald-600" : "text-red-600"}`}
                      >
                        {car.seller.status}
                      </span>
                    </span>
                    <span>
                      Member since{" "}
                      {new Date(car.seller.createdAt).toLocaleDateString("en-AU", {
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Listing meta */}
            <div className="rounded-2xl border border-border bg-background-subtle px-5 py-4 text-xs text-foreground-muted shadow-sm">
              <p>
                Listing ID:{" "}
                <span className="font-mono font-semibold text-foreground">#{car.id}</span>
              </p>
              {car.slug && (
                <p className="mt-1">
                  Slug: <span className="font-mono text-foreground">{car.slug}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
