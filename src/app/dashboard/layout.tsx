import type { Viewport } from "next"

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

import "@/styles/globals.css"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { NuqsAdapter } from "nuqs/adapters/next/app"

import { auth } from "@/lib/auth"

export const metadata = {
  title: "Картпак",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#fff",
  // Also supported by less commonly used
  // interactiveWidget: 'resizes-visual',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  return (
    <NuqsAdapter>
      <SidebarProvider>
        <AppSidebar user={session?.user} />
        <div className="relative flex min-h-screen flex-col">{children}</div>
      </SidebarProvider>
    </NuqsAdapter>
  )
}
