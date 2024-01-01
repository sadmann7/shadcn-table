import { type MetadataRoute } from "next"

import { siteConfig } from "@/config/site"

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/million"].map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date().toISOString(),
  }))

  return [...routes]
}
