import { Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Skeleton } from "@/components/ui/Skeleton";
import { CarDetailContent } from "./CarDetailContent";
import { db } from "@/lib/db";
import { CarStatus } from "@/generated/prisma/client";
import { cloudinaryOgUrl } from "@/lib/cloudinaryUrl";
import { SITE_URL } from "@/config/app";
import type { Metadata } from "next";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const car = await db.car.findFirst({
    where: { slug, status: CarStatus.AVAILABLE },
    select: {
      title: true,
      description: true,
      images: { where: { isPrimary: true }, take: 1, select: { url: true } },
    },
  });
  if (!car) return {};

  // Strip HTML tags from rich-text description for plain-text meta fields
  const plainDescription = car.description
    ? car.description.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 200)
    : undefined;

  const pageUrl = `${SITE_URL}/cars/${slug}`;
  const ogImage = car.images[0]?.url ? cloudinaryOgUrl(car.images[0].url) : undefined;

  return {
    title: car.title,
    description: plainDescription,
    alternates: { canonical: pageUrl },
    openGraph: {
      type: "article",
      url: pageUrl,
      title: car.title,
      description: plainDescription,
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: car.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: car.title,
      description: plainDescription,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

function CarDetailSkeleton() {
  return (
    <main className="flex-1 bg-background-subtle">
      {/* Mobile: edge-to-edge gallery placeholder */}
      <div className="lg:hidden">
        <Skeleton className="aspect-[4/3] w-full rounded-none" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 lg:py-8">
        {/* Breadcrumb — desktop */}
        <div className="mb-4 hidden lg:block">
          <Skeleton className="h-4 w-40" />
        </div>

        <div className="grid gap-8 lg:grid-cols-[3fr_2fr]">
          {/* Gallery — desktop left column */}
          <div className="hidden flex-col gap-2 lg:flex">
            <Skeleton className="aspect-video w-full rounded-xl" />
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-24 rounded-lg" />
              ))}
            </div>
          </div>

          {/* Info panel */}
          <div className="flex flex-col gap-6">
            {/* Mobile breadcrumb */}
            <div className="pt-3 lg:hidden">
              <Skeleton className="h-4 w-20" />
            </div>

            {/* Title + price */}
            <div className="flex flex-col gap-3">
              <Skeleton className="h-7 w-3/4" />
              <Skeleton className="h-9 w-1/3" />
            </div>

            {/* Specs table */}
            <div className="flex flex-col gap-2.5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-4 w-24 shrink-0" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>

            {/* Contact card */}
            <div className="flex flex-col gap-3 rounded-lg border border-border bg-background p-4">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default async function CarDetailPage({ params }: { params: Params }) {
  const { slug } = await params;

  return (
    <div className="flex min-h-full flex-col">
      <Header />
      <Suspense fallback={<CarDetailSkeleton />}>
        <CarDetailContent slug={slug} />
      </Suspense>
      <Footer />
    </div>
  );
}
