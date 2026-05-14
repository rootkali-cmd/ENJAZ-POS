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
  description: "ENJAZ منصة عربية لإدارة المتاجر تشمل نقطة بيع، مخزون، موظفين، فواتير، تقارير، وAI Agent للرؤى التشغيلية.",
  keywords: ["نظام إدارة متجر", "نقطة بيع", "برنامج كاشير", "إدارة مخزون", "POS عربي", "فواتير", "ENJAZ", "محل"],
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "ENJAZ - نظام إدارة المتاجر ونقطة البيع",
    description: "منصة عربية لإدارة المتاجر — نقطة بيع، مخزون، موظفين، فواتير، تقارير، وAI Agent.",
    images: ["/logo.png"],
    url: "https://enjaz.one",
    type: "website",
    locale: "ar_SA",
    siteName: "ENJAZ",
  },
  twitter: {
    card: "summary_large_image",
    title: "ENJAZ - نظام إدارة المتاجر ونقطة البيع",
    description: "منصة عربية لإدارة المتاجر — نقطة بيع، مخزون، موظفين، فواتير، تقارير، وAI Agent.",
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "https://enjaz.one" },
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
