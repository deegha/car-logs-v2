import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getSellerSession } from "@/lib/auth";
import type { ReactNode } from "react";

export default async function SellerLayout({ children }: { children: ReactNode }) {
  const session = await getSellerSession();
  if (!session) {
    redirect("/auth/login");
  }

  return (
    <div className="flex min-h-full flex-col">
      <Header />
      <main className="flex-1 bg-background-subtle py-10">{children}</main>
      <Footer />
    </div>
  );
}
