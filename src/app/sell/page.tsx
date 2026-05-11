import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AddCarForm } from "@/components/seller/AddCarForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "List Your Car",
  description: "Submit your car listing for review.",
};

export default function SellPage() {
  return (
    <div className="flex min-h-full flex-col">
      <Header />

      <main className="flex-1 bg-background-subtle sm:py-10">
        <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
          {/* Mobile: full-bleed form. Desktop: card */}
          <div className="bg-background px-4 py-6 sm:rounded-xl sm:border sm:border-border sm:p-8 sm:shadow-sm">
            <h1 className="mb-2 text-2xl font-bold text-foreground">List Your Car</h1>
            <p className="mb-6 text-sm text-foreground-muted">
              Fill in the details below. Your listing will be reviewed before going live.
            </p>
            <AddCarForm />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
