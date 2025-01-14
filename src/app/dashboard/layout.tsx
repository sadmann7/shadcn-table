import type { Viewport } from "next"

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import KBar from "@/components/kbar"
import Header from "@/components/layout/header"

import "@/styles/globals.css"

import { cookies, headers } from "next/headers"
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
  // Persisting the sidebar state in the cookie.
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true"
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar user={session?.user} />
      {/* <div className="relative flex min-h-screen flex-col">{children}</div> */}
      <SidebarInset>
        <Header user={session?.user} />
        {/* page main content */}
        {children}
        {/* page main content ends */}
      </SidebarInset>
    </SidebarProvider>
  )
}
