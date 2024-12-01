"use client"

import { SessionProvider } from "next-auth/react"

// import { ThemeProvider as NextThemesProvider } from 'next-themes'
// import { ThemeProviderProps } from 'next-themes/dist/types'

// https://medium.com/@rezahedi/using-nextauth-authentication-provider-in-next-js-by-app-router-f50cb23282c9

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}
