"use client"

import { useMemo } from "react"
import { usePathname } from "next/navigation"

type BreadcrumbItem = {
  title: string
  link: string
}

// This allows to add custom title as well
const routeMapping: Record<string, BreadcrumbItem[]> = {
  "/dashboard": [{ title: "Дашборд", link: "/dashboard" }],
  "/dashboard/test": [
    { title: "Дашборд", link: "/dashboard" },
    { title: "Тест", link: "/dashboard/test" },
  ],
  "/dashboard/users": [
    { title: "Дашборд", link: "/dashboard" },
    { title: "Працівники", link: "/dashboard/users" },
  ],
  "/dashboard/product": [
    { title: "Дашборд", link: "/dashboard" },
    { title: "Product", link: "/dashboard/product" },
  ],
  // Add more custom mappings as needed
}

export function useBreadcrumbs() {
  const pathname = usePathname()

  const breadcrumbs = useMemo(() => {
    // Check if we have a custom mapping for this exact path
    if (routeMapping[pathname]) {
      return routeMapping[pathname]
    }

    // If no exact match, fall back to generating breadcrumbs from the path
    const segments = pathname.split("/").filter(Boolean)
    return segments.map((segment, index) => {
      const path = `/${segments.slice(0, index + 1).join("/")}`
      return {
        title: segment.charAt(0).toUpperCase() + segment.slice(1),
        link: path,
      }
    })
  }, [pathname])

  return breadcrumbs
}
