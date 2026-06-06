import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CarCardSkeleton } from "@/components/cars/CarCardSkeleton";
import { Skeleton } from "@/components/ui/Skeleton";

export default function HomeLoading() {
  return (
    <div className="flex min-h-full flex-col">
      <Header />

      {/* Hero skeleton */}
      <section className="bg-background-subtle px-4 py-10 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <Skeleton className="mx-auto h-9 w-3/4 sm:h-14" />
          <Skeleton className="mx-auto mt-3 h-5 w-2/3 sm:mt-4" />
          <div className="mx-auto mt-6 flex max-w-xl flex-col gap-2 sm:mt-8 sm:flex-row sm:gap-3">
            <Skeleton className="h-14 flex-1 rounded-xl" />
            <Skeleton className="h-14 w-full rounded-xl sm:w-28" />
          </div>
        </div>
      </section>

      {/* Stats skeleton */}
      <div className="border-y border-border bg-background">
        <div className="mx-auto grid max-w-7xl grid-cols-3 divide-x divide-border px-4 py-5 text-center sm:px-6 sm:py-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2 px-2 sm:px-4">
              <Skeleton className="h-7 w-16 sm:h-8 sm:w-20" />
              <Skeleton className="h-3 w-20 sm:h-4" />
            </div>
          ))}
        </div>
      </div>

      {/* Listings skeleton */}
      <section className="flex-1 bg-background-subtle px-4 py-5 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-4 flex items-center justify-between sm:mb-6">
            <Skeleton className="h-6 w-40 sm:h-8" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <CarCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
