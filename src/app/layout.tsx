import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Toaster } from "react-hot-toast"
import { ThemeProvider } from "@/components/layout/theme-provider"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "ENJAZ - نظام إدارة المتاجر ونقطة البيع",
  description: "ENJAZ منصة عربية سحابية لإدارة المتاجر — نقطة بيع (POS)، مخزون، موظفين، فواتير، تقارير، وAI Agent للرؤى التشغيلية. جرب مجاناً.",
  keywords: [
    "نظام إدارة متجر",
    "نقطة بيع",
    "برنامج كاشير",
    "إدارة مخزون",
    "POS عربي",
    "فواتير",
    "ENJAZ",
    "برنامج محلات",
    "إدارة مبيعات",
    "نظام POS للمطاعم",
    "برنامج سوبر ماركت",
    "إدارة صيدلية",
  ],
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "ENJAZ - نظام إدارة المتاجر ونقطة البيع",
    description: "منصة عربية سحابية لإدارة المتاجر — نقطة بيع، مخزون، موظفين، فواتير، تقارير، وAI Agent. جرب مجاناً.",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "ENJAZ",
      },
    ],
    url: "https://enjaz.one",
    type: "website",
    locale: "ar_SA",
    siteName: "ENJAZ",
  },
  twitter: {
    card: "summary_large_image",
    title: "ENJAZ - نظام إدارة المتاجر ونقطة البيع",
    description: "منصة عربية سحابية لإدارة المتاجر — نقطة بيع، مخزون، موظفين، فواتير، تقارير، وAI Agent.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    "max-snippet": -1,
    "max-image-preview": "large",
  },
  alternates: {
    canonical: "https://enjaz.one",
  },
  category: "business",
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "ENJAZ",
  url: "https://enjaz.one",
  description: "منصة عربية سحابية لإدارة المتاجر — نقطة بيع (POS)، إدارة مخزون، موظفين، فواتير، تقارير، وAI Agent.",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "EGP",
    description: "نسخة تجريبية مجانية",
  },
  author: {
    "@type": "Organization",
    name: "ENJAZ",
    url: "https://enjaz.one",
    logo: "https://enjaz.one/logo.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="manifest" href="/manifest.json" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-200">
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              fontFamily: "Cairo, sans-serif",
              direction: "rtl",
            },
          }}
        />
      </body>
    </html>
  )
}
