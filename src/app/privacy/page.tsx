import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How carlogs.lk collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <div className="flex min-h-full flex-col">
      <Header />

      <main className="flex-1 bg-background-subtle">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-border bg-background p-8 sm:p-12">
            <h1 className="mb-2 text-3xl font-bold text-foreground">Privacy Policy</h1>
            <p className="mb-8 text-sm text-foreground-muted">Last updated: May 2025</p>

            <div className="prose">
              <p>
                carlogs.lk (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) is committed
                to protecting your privacy. This policy explains what data we collect, why we
                collect it, and how we use it.
              </p>

              <h2>1. Information We Collect</h2>

              <h3>Information you provide directly</h3>
              <ul>
                <li>
                  <strong>Account registration:</strong> name, email address, and phone number when
                  you create a seller account.
                </li>
                <li>
                  <strong>Listings:</strong> vehicle details, descriptions, and photographs you
                  upload when creating a listing.
                </li>
              </ul>

              <h3>Information collected automatically</h3>
              <ul>
                <li>
                  <strong>Usage data:</strong> pages visited, time spent on pages, search queries,
                  and interaction events.
                </li>
                <li>
                  <strong>Device &amp; browser data:</strong> IP address, browser type, operating
                  system, and referring URL.
                </li>
                <li>
                  <strong>Cookies:</strong> small files stored on your device to maintain your
                  session and enable analytics (see Section 3).
                </li>
              </ul>

              <h2>2. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul>
                <li>Operate and improve the carlogs.lk platform.</li>
                <li>Display and manage your vehicle listings.</li>
                <li>Authenticate your account and keep it secure.</li>
                <li>
                  Understand how visitors use the site so we can improve the experience
                  (analytics).
                </li>
                <li>Communicate with you about your listings or account.</li>
              </ul>
              <p>
                We do <strong>not</strong> sell, rent, or trade your personal information to third
                parties for marketing purposes.
              </p>

              <h2>3. Google Analytics</h2>
              <p>
                We use <strong>Google Analytics</strong> to collect anonymised data about how
                visitors use carlogs.lk. Google Analytics uses cookies and similar technologies to
                collect information such as:
              </p>
              <ul>
                <li>Number of visitors and page views.</li>
                <li>Which pages are most visited.</li>
                <li>General geographic location (country / city level).</li>
                <li>Device and browser type.</li>
                <li>How visitors arrived at our site (search engine, direct, referral).</li>
              </ul>
              <p>
                This data is aggregated and anonymised — we cannot identify you personally from
                Google Analytics reports. Google may process this data on servers outside Sri Lanka.
                You can learn more about how Google uses data at{" "}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  policies.google.com/privacy
                </a>
                .
              </p>
              <p>
                You can opt out of Google Analytics tracking by installing the{" "}
                <a
                  href="https://tools.google.com/dlpage/gaoptout"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Google Analytics Opt-out Browser Add-on
                </a>
                .
              </p>

              <h2>4. Cookies</h2>
              <p>We use the following types of cookies:</p>
              <ul>
                <li>
                  <strong>Session cookies:</strong> required to keep you logged in to your seller
                  account. These expire when you close your browser.
                </li>
                <li>
                  <strong>Analytics cookies:</strong> set by Google Analytics to track usage as
                  described above. These persist for up to 2 years.
                </li>
              </ul>
              <p>
                You can control cookies through your browser settings. Disabling cookies may affect
                the functionality of the site, including the ability to stay logged in.
              </p>

              <h2>5. Data Retention</h2>
              <p>
                We retain your account information and listings for as long as your account is
                active. If you close your account, we will delete your personal data within a
                reasonable period, unless we are required to retain it by law.
              </p>

              <h2>6. Third-Party Links</h2>
              <p>
                Listings on carlogs.lk may contain contact details for individual sellers. We are
                not responsible for the privacy practices of third parties you contact through the
                platform.
              </p>

              <h2>7. Security</h2>
              <p>
                We use industry-standard security measures, including encrypted connections (HTTPS)
                and hashed password storage, to protect your data. No system is completely secure,
                and we cannot guarantee absolute security.
              </p>

              <h2>8. Your Rights</h2>
              <p>You have the right to:</p>
              <ul>
                <li>Access the personal data we hold about you.</li>
                <li>Request correction of inaccurate data.</li>
                <li>Request deletion of your account and associated data.</li>
              </ul>
              <p>
                To exercise any of these rights, please contact us at{" "}
                <a href="mailto:hello@carlogs.lk">hello@carlogs.lk</a>.
              </p>

              <h2>9. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will post the updated
                version on this page with a revised date. Continued use of the platform after
                changes are posted constitutes acceptance of the updated policy.
              </p>

              <h2>10. Contact</h2>
              <p>
                If you have any questions or concerns about this Privacy Policy, please contact us
                at <a href="mailto:hello@carlogs.lk">hello@carlogs.lk</a>.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
