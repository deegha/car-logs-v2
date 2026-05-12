import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CarCardSkeleton } from "@/components/cars/CarCardSkeleton";
import { Skeleton } from "@/components/ui/Skeleton";

export default function CarsLoading() {
  return (
    <div className="flex min-h-full flex-col">
      <Header />

      <main className="flex-1 bg-background-subtle">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
            {/* Filter sidebar skeleton */}
            <aside className="w-full rounded-lg border border-border bg-background p-5 lg:w-64 lg:shrink-0">
              <Skeleton className="mb-4 h-5 w-24" />
              <div className="flex flex-col gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex flex-col gap-1.5">
                    <Skeleton className="h-3.5 w-16" />
                    <Skeleton className="h-9 w-full rounded-md" />
                  </div>
                ))}
              </div>
            </aside>

            {/* Grid skeleton */}
            <div className="flex flex-1 flex-col gap-4">
              <Skeleton className="h-4 w-32" />
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <CarCardSkeleton key={i} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
