import { ThemeProvider } from "@/providers/providers"

import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
// import { SiteHeader } from "@/components/layouts/site-header"
import { TailwindIndicator } from "@/components/tailwind-indicator"

import "@/styles/globals.css"

import type { Metadata, Viewport } from "next"
import { headers } from "next/headers"
import { ReactQueryProvider } from "@/providers/react-query"
import NextTopLoader from "nextjs-toploader"
import { NuqsAdapter } from "nuqs/adapters/next/app"

import { auth } from "@/lib/auth"
import { fontMono, fontSans } from "@/lib/fonts"
import { Toaster } from "@/components/ui/sonner"
import Providers from "@/components/layout/providers"

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "nextjs",
    "react",
    "react server components",
    "table",
    "react-table",
    "tanstack-table",
    "shadcn-table",
  ],
  authors: [
    {
      name: "sadmann7",
      url: "https://www.sadmn.com",
    },
  ],
  creator: "sadmann7",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [`${siteConfig.url}/og.jpg`],
    creator: "@sadmann17",
  },
  icons: {
    icon: "/icon.png",
  },
  manifest: `${siteConfig.url}/site.webmanifest`,
}

export const viewport: Viewport = {
  colorScheme: "dark light",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
}

export default async function RootLayout({
  children,
}: React.PropsWithChildren) {
  // const session = await auth.api.getSession({
  //   headers: await headers(),
  // })

  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      {/* <ReactQueryProvider> */}
      <body
        className={cn(
          "bg-background font-sans antialiased",
          fontSans.variable,
          fontMono.variable,
          "overflow-hidden"
        )}
      >
        <NextTopLoader showSpinner={false} />
        <NuqsAdapter>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {/* <div className="relative flex min-h-screen flex-col">
              <main className="flex-1">{children}</main>
            </div> */}
            <TailwindIndicator />
            <Toaster />
            {children}
          </ThemeProvider>
        </NuqsAdapter>
      </body>
      {/* </ReactQueryProvider> */}
    </html>
  )
}
