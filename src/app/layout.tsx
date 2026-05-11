import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { MobileNav } from "@/components/layout/MobileNav";

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
  title: {
    default: "carlogs.lk — Quality Used Cars",
    template: "%s | carlogs.lk",
  },
  description: "Browse our curated selection of quality pre-owned vehicles.",
  openGraph: {
    siteName: "carlogs.lk",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "carlogs.lk" }],
  },
  twitter: {
    card: "summary_large_image",
    images: [OG_IMAGE],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
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
        {/* spacer so content isn't hidden behind the mobile nav */}
        <div className="h-[calc(56px+env(safe-area-inset-bottom))] md:hidden" aria-hidden />
      </body>
    </html>
  );
}
