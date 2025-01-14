import type { Viewport } from "next"

// import { getServerSession } from "next-auth"

// import { authOptions } from "@/lib/auth";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

import "@/styles/globals.css"

import { redirect } from "next/navigation"
import { NuqsAdapter } from "nuqs/adapters/next/app"

// import { auth } from "@/lib/auth"

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
  // const session = await auth()
  // const session = await getServerSession(authOptions)
  // const user = session?.user

  // console.log(88888, user, session)

  // if (!user) {
  //   redirect("/login")
  // }

  return (
    <NuqsAdapter>
      <SidebarProvider>
        <AppSidebar />
        <div className="relative flex min-h-screen flex-col">{children}</div>
      </SidebarProvider>
    </NuqsAdapter>
  )
}
