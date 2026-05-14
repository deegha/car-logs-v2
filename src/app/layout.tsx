import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import Script from "next/script";
import "./globals.css";
import { MobileNav } from "@/components/layout/MobileNav";
import { ServiceWorkerRegistration } from "@/components/pwa/ServiceWorkerRegistration";
import { SITE_URL } from "@/config/app";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const OG_IMAGE =
  "https://res.cloudinary.com/duqpgdc9v/image/upload/c_pad,b_white,w_1200,h_630/v1778517784/car-listing/carllisting-blog-images/carlogs.lk-lgo.png";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "carlogs.lk — Buy & Sell Cars",
    template: "%s | carlogs.lk",
  },
  description: "Browse new, used and reconditioned cars from trusted sellers across Sri Lanka.",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon-57x57.png", sizes: "57x57" },
      { url: "/apple-icon-60x60.png", sizes: "60x60" },
      { url: "/apple-icon-72x72.png", sizes: "72x72" },
      { url: "/apple-icon-76x76.png", sizes: "76x76" },
      { url: "/apple-icon-114x114.png", sizes: "114x114" },
      { url: "/apple-icon-120x120.png", sizes: "120x120" },
      { url: "/apple-icon-144x144.png", sizes: "144x144" },
      { url: "/apple-icon-152x152.png", sizes: "152x152" },
      { url: "/apple-icon-180x180.png", sizes: "180x180" },
    ],
    other: [{ rel: "msapplication-TileImage", url: "/ms-icon-144x144.png" }],
  },
  other: {
    "msapplication-TileColor": "#ffffff",
    "msapplication-config": "/browserconfig.xml",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "carlogs.lk",
    locale: "en_US",
    title: "carlogs.lk — Buy & Sell Cars",
    description: "Browse new, used and reconditioned cars from trusted sellers across Sri Lanka.",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "carlogs.lk" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@carlogs_lk",
    images: [OG_IMAGE],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        {children}
        <MobileNav />
        <ServiceWorkerRegistration />
        {/* spacer so content isn't hidden behind the mobile nav */}
        <div className="h-[calc(56px+env(safe-area-inset-bottom))] md:hidden" aria-hidden />
      </body>
      <GoogleAnalytics gaId="G-CTQN7XQWY1" />
      <Script src="https://t.contentsquare.net/uxa/8cd09751ebecf.js" strategy="afterInteractive" />
    </html>
  );
}
