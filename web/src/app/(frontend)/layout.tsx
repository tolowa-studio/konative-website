import React from "react";
import { Analytics } from "@vercel/analytics/react";
import type { Viewport } from "next";

import ConditionalFooter from "../../components/ConditionalFooter";
import Header from "../../components/Header";
import {
  JsonLd,
  organizationSchema,
  websiteSchema,
} from "@/components/seo/JsonLd";

import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata = {
  title: "Konative | Datacenter Brokerage",
  description:
    "Konative brokers powered land to data center developers and hyperscalers. We source sites, connect investors, and manage the deal from first call to close. Own land near a substation? We want to talk.",
  metadataBase: new URL("https://konative.com"),
  openGraph: {
    siteName: "Konative",
    type: "website" as const,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image" as const,
    site: "@konative",
  },
  // Google Search Console verification — set GOOGLE_SITE_VERIFICATION on Vercel
  // (production) to emit the meta tag without redeploying code.
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Barlow Condensed — Display & Headlines | Inter — Body */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* Site-wide structured data — see web/src/components/seo/JsonLd.tsx */}
        <JsonLd data={[organizationSchema, websiteSchema]} />
      </head>
      <body>
        <Header />
        <main className="site-main">{children}</main>
        <ConditionalFooter />
        <Analytics />
      </body>
    </html>
  );
}
