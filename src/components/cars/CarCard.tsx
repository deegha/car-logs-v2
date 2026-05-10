import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { formatPrice, formatMileage } from "@/lib/utils";
import type { Car } from "@/types";

interface CarCardProps {
  car: Car;
}

export function CarCard({ car }: CarCardProps) {
  const coverImage = car.images?.find((img) => img.isPrimary) ?? car.images?.[0];

  return (
    <Link
      href={`/cars/${car.slug ?? car.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-background shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-background-subtle">
        {coverImage ? (
          <Image
            src={coverImage.url}
            alt={coverImage.alt ?? car.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-foreground-muted">
            <svg
              className="h-10 w-10 opacity-30"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M3 9l2-2h14l2 2v8a1 1 0 01-1 1H4a1 1 0 01-1-1V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M7 14h.01M17 14h.01"
              />
            </svg>
          </div>
        )}
        {car.featured && (
          <span className="absolute top-2 left-2 rounded-full bg-accent-500 px-2 py-0.5 text-xs font-semibold text-white">
            Featured
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3 sm:gap-2 sm:p-4">
        <h3 className="line-clamp-2 text-xs font-semibold text-foreground group-hover:text-primary-600 sm:text-sm">
          {car.title}
        </h3>

        <p className="text-base font-bold text-primary-600 sm:text-lg">{formatPrice(car.price)}</p>

        <div className="flex flex-wrap gap-1">
          <Badge variant="secondary">{car.year}</Badge>
          <Badge variant="secondary">{formatMileage(car.mileage)}</Badge>
        </div>
      </div>
    </Link>
  );
}
