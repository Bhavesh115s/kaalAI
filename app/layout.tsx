import type { Metadata, Viewport } from "next"
import { Source_Serif_4, Inter } from "next/font/google"
import Script from "next/script"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/contexts/auth-context"
import "./globals.css"

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: "KAAL AI - Mental Wellness Companion",
  description:
    "Your safe space for emotional support, guided meditation, and mental wellness. Connect with AI-powered conversations, meditation exercises, and professional therapists.",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
}

export const viewport: Viewport = {
  themeColor: "#faf8f5",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${sourceSerif.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-VYTHNS59TF"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-VYTHNS59TF');
          `}
        </Script>
      </head>

      <body
        className="font-sans antialiased bg-background text-foreground min-h-screen"
        suppressHydrationWarning
      >
        <AuthProvider>{children}</AuthProvider>

        {/* Vercel Analytics */}
        <Analytics />
      </body>
    </html>
  )
}