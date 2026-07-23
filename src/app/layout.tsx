import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Anek_Malayalam } from "next/font/google";

import "./globals.css";

import { ToastProvider } from "@/components/toast-provider";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";
import { OfflineIndicator } from "@/components/offline-indicator";
import { RealtimeProvider } from "@/components/realtime-provider";
import { PublicPageWrapper } from "@/components/public-page-wrapper";
import { JsonLd } from "@/components/json-ld";

const anekMalayalam = Anek_Malayalam({
  subsets: ["latin"], // Change to ["malayalam", "latin"] if your Next.js version supports it.
  variable: "--font-anek-malayalam",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Ishal Rabeeh '26 - Showcasing Islamic Art & Culture",
    template: "%s | Ishal Rabeeh '26",
  },
  description:
    "A premier platform for students to showcase their talents and highlight the rich art forms of Islamic culture. Live scoreboard, admin controls, and jury tools for Ishal Rabeeh '26.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://funoonfiesta.noorululama.org"
  ),
  keywords: [
    "Ishal Rabeeh '26",
    "Islamic Art",
    "Culture",
    "Student Festival",
    "Live Scoreboard",
    "Arts Competition",
  ],
  authors: [{ name: "Ishal Rabeeh '26 Team" }],
  creator: "Ishal Rabeeh '26",
  publisher: "Ishal Rabeeh '26",

  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  manifest: "/manifest.json",

  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Ishal Rabeeh '26",
  },

  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      {
        url: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },

  openGraph: {
    title: "Ishal Rabeeh '26 - Showcasing Islamic Art & Culture",
    description:
      "A premier platform for students to showcase their talents and highlight the rich art forms of Islamic culture.",
    url:
      process.env.NEXT_PUBLIC_APP_URL ||
      "https://funoonfiesta.noorululama.org",
    siteName: "Ishal Rabeeh '26",
    images: [
      {
        url: "/img/assets/logo-new.png",
        width: 800,
        height: 600,
        alt: "Ishal Rabeeh '26 Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Ishal Rabeeh '26",
    description:
      "Celebrating Islamic Art & Culture through student talent.",
    images: ["/img/assets/logo-new.png"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  verification: {
    google: "KVXemRNq5bBTJadrMPQXLbSxFtPnazEmvfX6uguvd5U",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: "#3b0764",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="scroll-smooth"
      suppressHydrationWarning
    >
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} ${anekMalayalam.variable} antialiased`}
        suppressHydrationWarning
      >
        <RealtimeProvider>
          <OfflineIndicator />

          <ToastProvider>
            <PublicPageWrapper>{children}</PublicPageWrapper>
          </ToastProvider>

          <PWAInstallPrompt />
        </RealtimeProvider>

        <JsonLd />
      </body>
    </html>
  );
}
