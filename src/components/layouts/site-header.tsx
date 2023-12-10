"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { GitHubLogoIcon, VercelLogoIcon } from "@radix-ui/react-icons"

import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { ModeToggle } from "@/components/layouts/mode-toggle"

export function SiteHeader() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center space-x-4">
        <Link href="/" className="mr-2 flex items-center md:mr-6 md:space-x-2">
          <VercelLogoIcon className="h-4 w-4" aria-hidden="true" />
          <span className="hidden font-bold md:inline-block">
            {siteConfig.name}
          </span>
        </Link>
        <nav className="flex flex-1 items-center space-x-6 text-sm font-medium">
          {siteConfig.mainNav.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={cn(
                "flex items-center text-sm font-medium transition-colors hover:text-foreground/80",
                pathname === item.href
                  ? "text-foreground"
                  : "text-foreground/60"
              )}
            >
              {item.title}
            </Link>
          ))}
        </nav>
        <div className="flex items-center">
          <Link
            aria-label="GitHub repo"
            href={siteConfig.links.github}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({
                variant: "ghost",
                size: "icon",
              })
            )}
          >
            <GitHubLogoIcon className="h-4 w-4" aria-hidden="true" />
          </Link>
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
