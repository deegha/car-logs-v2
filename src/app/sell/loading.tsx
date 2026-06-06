import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Skeleton } from "@/components/ui/Skeleton";

export default function SellLoading() {
  return (
    <div className="flex min-h-full flex-col">
      <Header />

      <main className="flex-1 bg-background-subtle sm:py-10">
        <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
          <div className="bg-background px-4 py-6 sm:rounded-xl sm:border sm:border-border sm:p-8 sm:shadow-sm">
            <Skeleton className="mb-2 h-8 w-40" />
            <Skeleton className="mb-6 h-4 w-3/4" />

            {/* Form field skeletons */}
            <div className="flex flex-col gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-1.5">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex flex-col gap-1.5">
                    <Skeleton className="h-3.5 w-16" />
                    <Skeleton className="h-10 w-full rounded-md" />
                  </div>
                ))}
              </div>
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
