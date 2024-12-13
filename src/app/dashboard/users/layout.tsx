import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Link } from "@/components/custom/link"
import { SocialsFooter } from "@/components/layout/socials-footer"
import { TopBanner } from "@/components/layout/top-banner"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* <TopBanner /> */}
      <main className="container mx-auto flex min-h-screen flex-col gap-4 sm:p-16">
        <div className="relative mx-auto flex h-full min-h-full w-full max-w-7xl flex-col gap-4 rounded-lg border border-border/50 bg-background/50 p-4 backdrop-blur-[2px] sm:gap-8 sm:p-8">
          {/* <div className="grid gap-1">
            <h1 className="text-3xl font-semibold text-foreground">
              Data-Table Filters
            </h1>
            <h2 className="text-lg text-muted-foreground">
              Powered by{" "}
              <Link href="https://tanstack.com/table">tanstack table</Link> and{" "}
              <Link href="https://ui.shadcn.com">shadcn ui</Link> with controls
              and <Link href="http://cmdk.paco.me/">cmdk</Link> using search
              params via <Link href="https://nuqs.47ng.com">nuqs</Link>.
            </h2>
            <p className="text-muted-foreground">
              Code available on{" "}
              <Link href="https://github.com/openstatusHQ/data-table-filters">
                GitHub
              </Link>
              .
            </p>
          </div> */}
          {/* <Separator /> */}
          {children}
          {/* <Badge
            variant="outline"
            className="absolute -top-2.5 left-4 bg-background sm:left-8"
          >
            Work in progress
          </Badge> */}
        </div>
        <SocialsFooter />
      </main>
    </>
  )
}
