import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms and conditions for using carlogs.lk.",
};

export default function TermsPage() {
  return (
    <div className="flex min-h-full flex-col">
      <Header />

      <main className="flex-1 bg-background-subtle">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-border bg-background p-8 sm:p-12">
            <h1 className="mb-2 text-3xl font-bold text-foreground">Terms &amp; Conditions</h1>
            <p className="mb-8 text-sm text-foreground-muted">Last updated: May 2025</p>

            <div className="prose">
              <p>
                Welcome to <strong>carlogs.lk</strong>. By accessing or using this website, you
                agree to be bound by these Terms &amp; Conditions. Please read them carefully before
                using the platform.
              </p>

              <h2>1. About carlogs.lk</h2>
              <p>
                carlogs.lk is an online marketplace that connects private sellers and buyers of
                pre-owned vehicles in Sri Lanka. We provide the platform and tools for sellers to
                list vehicles and for buyers to browse and contact sellers directly.
              </p>

              <h2>2. Marketplace — No Liability for Transactions</h2>
              <p>
                <strong>carlogs.lk is a marketplace platform only.</strong> We are not a party to
                any transaction between buyers and sellers. We do not buy, sell, inspect, transfer
                ownership of, or take possession of any vehicle listed on this site.
              </p>
              <p>
                We expressly disclaim all liability for:
              </p>
              <ul>
                <li>The accuracy, completeness, or truthfulness of any vehicle listing.</li>
                <li>
                  The condition, roadworthiness, legal title, or history of any vehicle advertised.
                </li>
                <li>
                  Any loss, damage, injury, or dispute arising from a transaction conducted through
                  or facilitated by this platform.
                </li>
                <li>Fraudulent listings or misrepresentation by sellers or buyers.</li>
                <li>Failure of any party to honour an agreement reached through the platform.</li>
              </ul>
              <p>
                <strong>
                  Buyers are solely responsible for conducting their own due diligence
                </strong>{" "}
                before purchasing any vehicle, including but not limited to: independent mechanical
                inspection, verification of ownership documents, checking for outstanding finance or
                encumbrances, and confirming the vehicle&apos;s emission test and registration
                status.
              </p>

              <h2>3. Seller Responsibilities</h2>
              <p>Sellers who list vehicles on carlogs.lk agree to:</p>
              <ul>
                <li>Provide accurate and truthful information in all listings.</li>
                <li>Hold legal title to or the right to sell the vehicle advertised.</li>
                <li>Not post misleading, duplicate, or fraudulent listings.</li>
                <li>Comply with all applicable laws of Sri Lanka.</li>
                <li>
                  Remove or update listings promptly when a vehicle is sold or details change.
                </li>
              </ul>
              <p>
                carlogs.lk reserves the right to remove any listing and suspend or terminate any
                account that violates these terms, without notice.
              </p>

              <h2>4. Prohibited Use</h2>
              <p>You must not use this platform to:</p>
              <ul>
                <li>Post false, misleading, or fraudulent content.</li>
                <li>Scrape, copy, or republish content without permission.</li>
                <li>Attempt to gain unauthorised access to any part of the platform.</li>
                <li>Use the platform for any unlawful purpose.</li>
              </ul>

              <h2>5. Intellectual Property</h2>
              <p>
                All content on carlogs.lk — including logos, design, and software — is the property
                of carlogs.lk and may not be reproduced without written permission. Sellers retain
                ownership of photographs and descriptions they upload, but grant carlogs.lk a
                non-exclusive licence to display that content on the platform.
              </p>

              <h2>6. Limitation of Liability</h2>
              <p>
                To the fullest extent permitted by the laws of Sri Lanka, carlogs.lk and its
                operators shall not be liable for any direct, indirect, incidental, special, or
                consequential damages arising from your use of — or inability to use — this platform
                or any transaction facilitated through it.
              </p>

              <h2>7. Changes to These Terms</h2>
              <p>
                We may update these Terms &amp; Conditions from time to time. Continued use of the
                platform after changes are posted constitutes acceptance of the revised terms.
              </p>

              <h2>8. Governing Law</h2>
              <p>
                These terms are governed by the laws of the Democratic Socialist Republic of Sri
                Lanka. Any disputes shall be subject to the exclusive jurisdiction of the courts of
                Sri Lanka.
              </p>

              <h2>9. Contact</h2>
              <p>
                If you have any questions about these Terms &amp; Conditions, please contact us at{" "}
                <a href="mailto:hello@carlogs.lk">hello@carlogs.lk</a>.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
