import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

import {Toaster} from 'sonner'


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover', // Para PWA/notch devices
};

export const metadata: Metadata = {
  title: {
    default: "tckt_ - Tus eventos, tus entradas",
    template: "%s | tckt_"
  },
  description: "Plataforma de venta de entradas para eventos. Comprá tus tickets de forma rápida y segura.",
  keywords: ["tickets", "eventos", "entradas", "boletería", "espectáculos", "conciertos"],
  authors: [{ name: "tckt_" }],
  creator: "tckt_",
  publisher: "tckt_",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'tckt_',
  },
  openGraph: {
    title: "tckt_ - Tus eventos, tus entradas",
    description: "Plataforma de venta de entradas para eventos. Comprá tus tickets de forma rápida y segura.",
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    siteName: "tckt_",
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "tckt_ - Tus eventos, tus entradas",
    description: "Plataforma de venta de entradas para eventos. Comprá tus tickets de forma rápida y segura.",
    creator: "@tckt_",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    apple: '/isotipo.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="es">
      <head>
        <script defer src="https://cloud.umami.is/script.js" data-website-id="352eab6a-a921-4d6b-b73c-3282f2a38d2f"></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div id="__next">
            {/* <UserProvider> */}
              {children}
            {/* </UserProvider> */}
          </div>
          <Toaster theme="dark" position="top-center" />
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
