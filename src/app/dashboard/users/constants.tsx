"use client";

import { cn } from "@/lib/utils";
import { type ColumnSchema } from "./schema";
import type {
  DataTableFilterField,
  Option,
} from "@/components/data-table/types";
import { subDays, subHours, subMinutes } from "date-fns";
import { TAGS } from "@/constants/tag";
import { REGIONS } from "@/constants/region";

export const tagsColor = {
  api: {
    badge:
      "text-[#10b981] bg-[#10b981]/10 border-[#10b981]/20 hover:bg-[#10b981]/10",
    dot: "bg-[#10b981]",
  },
  web: {
    badge:
      "text-[#0ea5e9] bg-[#0ea5e9]/10 border-[#0ea5e9]/20 hover:bg-[#0ea5e9]/10",
    dot: "bg-[#0ea5e9]",
  },
  enterprise: {
    badge:
      "text-[#ec4899] bg-[#ec4899]/10 border-[#ec4899]/20 hover:bg-[#ec4899]/10",
    dot: "bg-[#ec4899]",
  },
  app: {
    badge:
      "text-[#f97316] bg-[#f97316]/10 border-[#f97316]/20 hover:bg-[#f97316]/10",
    dot: "bg-[#f97316]",
  },
} as Record<string, Record<"badge" | "dot", string>>;

export const data = [
  {
    name: "Edge Api",
    url: "edge-api.acme.com/health",
    p95: 140,
    public: true,
    active: true,
    regions: ["ams", "gru", "syd"],
    tags: ["api", "enterprise"],
    date: subHours(new Date(), 1),
  },
  {
    name: "Lambda Api",
    url: "lambda-api.acme.com/health",
    p95: 203,
    public: true,
    active: true,
    regions: ["ams", "gru", "syd"],
    tags: ["api"],
    date: subHours(new Date(), 10),
  },
  {
    name: "Storybook",
    url: "storybook.acme.com",
    p95: 1252,
    public: false,
    active: true,
    regions: ["iad"],
    tags: ["web"],
    date: subMinutes(new Date(), 10),
  },
  {
    name: "Marketing",
    url: "acme.com",
    p95: 659,
    public: true,
    active: true,
    regions: ["hkg", "fra", "iad"],
    tags: ["web"],
    date: subDays(new Date(), 1),
  },
  {
    name: "App",
    url: "app.acme.com",
    p95: 1301,
    public: false,
    active: true,
    regions: ["iad", "fra"],
    tags: ["app"],
    date: subHours(new Date(), 13),
  },
  {
    name: "Demo",
    url: "demo.acme.com",
    p95: 2420,
    public: true,
    active: true,
    regions: ["iad"],
    tags: ["web", "enterprise"],
    date: subDays(new Date(), 4),
  },
  {
    name: "Documentation",
    url: "docs.acme.com",
    p95: 943,
    public: true,
    active: true,
    regions: ["ams"],
    tags: ["api", "web"],
    date: subDays(new Date(), 6),
  },
  {
    name: "Boilerplate",
    url: "boilerplate.acme.com",
    p95: undefined,
    public: true,
    active: false,
    regions: ["gru", "fra"],
    tags: ["web"],
    date: subDays(new Date(), 10),
  },
  {
    name: "Dashboard",
    url: "app.acme.com/dashboard",
    p95: 967,
    public: false,
    active: true,
    regions: ["iad", "fra"],
    tags: ["web"],
    date: subHours(new Date(), 28),
  },
  {
    name: "E2E Testing",
    url: "staging-cypress-e2e.acme.com",
    p95: 1954,
    public: false,
    active: true,
    regions: ["iad"],
    tags: ["web"],
    date: subDays(new Date(), 12),
  },
  {
    name: "Web App",
    url: "web-app.acme.com",
    p95: 1043,
    public: true,
    active: true,
    regions: ["iad"],
    tags: ["web"],
    date: subDays(new Date(), 15),
  },
  {
    name: "Admin Panel",
    url: "admin.acme.com",
    p95: 1342,
    public: false,
    active: true,
    regions: ["gru", "syd"],
    tags: ["web"],
    date: subHours(new Date(), 5),
  },
  {
    name: "API Gateway",
    url: "api-gateway.acme.com/health",
    p95: 190,
    public: true,
    active: true,
    regions: ["ams", "hkg"],
    tags: ["api", "enterprise"],
    date: subHours(new Date(), 3),
  },
  {
    name: "Analytics Service",
    url: "analytics.acme.com",
    p95: 810,
    public: true,
    active: true,
    regions: ["iad", "fra", "hkg"],
    tags: ["app", "enterprise"],
    date: subDays(new Date(), 2),
  },
  {
    name: "Support Portal",
    url: "support.acme.com",
    p95: 752,
    public: true,
    active: true,
    regions: ["gru", "iad"],
    tags: ["web"],
    date: subMinutes(new Date(), 30),
  },
  {
    name: "User Management",
    url: "user-mgmt.acme.com",
    p95: 980,
    public: false,
    active: true,
    regions: ["gru", "syd", "fra"],
    tags: ["app"],
    date: subDays(new Date(), 7),
  },
  {
    name: "Payment Gateway",
    url: "payments.acme.com",
    p95: 156,
    public: true,
    active: true,
    regions: ["ams", "hkg", "syd"],
    tags: ["api", "enterprise"],
    date: subHours(new Date(), 8),
  },
  {
    name: "yication Service",
    url: "notify.acme.com",
    p95: 345,
    public: false,
    active: true,
    regions: ["iad"],
    tags: ["api"],
    date: subDays(new Date(), 11),
  },
  {
    name: "File Storage",
    url: "storage.acme.com",
    p95: 1220,
    public: true,
    active: true,
    regions: ["gru", "hkg"],
    tags: ["web", "enterprise"],
    date: subDays(new Date(), 3),
  },
  {
    name: "CDN",
    url: "cdn.acme.com",
    p95: 89,
    public: true,
    active: true,
    regions: ["ams", "iad", "hkg"],
    tags: ["web"],
    date: subDays(new Date(), 2),
  },
  {
    name: "Auth Service",
    url: "auth.acme.com",
    p95: 542,
    public: false,
    active: true,
    regions: ["gru", "syd"],
    tags: ["api"],
    date: subHours(new Date(), 16),
  },
] satisfies ColumnSchema[];

export const filterFields = [
  {
    label: "Time Range",
    value: "date",
    type: "timerange",
    defaultOpen: true,
    commandDisabled: true,
  },
  {
    label: "URL",
    value: "url",
    type: "input",
    options: data.map(({ url }) => ({ label: url, value: url })),
  },
  {
    label: "Public",
    value: "public",
    type: "checkbox",
    options: [true, false].map((bool) => ({ label: `${bool}`, value: bool })),
  },
  {
    label: "Active",
    value: "active",
    type: "checkbox",
    options: [true, false].map((bool) => ({ label: `${bool}`, value: bool })),
  },
  {
    label: "P95",
    value: "p95",
    type: "slider",
    min: 0,
    max: 3000,
    options: data.map(({ p95 }) => ({ label: `${p95}`, value: p95 })),
    defaultOpen: true,
  },
  {
    label: "Regions",
    value: "regions",
    type: "checkbox",
    options: REGIONS.map((region) => ({ label: region, value: region })),
  },
  {
    label: "Tags",
    value: "tags",
    type: "checkbox",
    defaultOpen: true,
    // REMINDER: "use client" needs to be declared in the file - otherwise getting serialization error from Server Component
    component: (props: Option) => {
      if (typeof props.value === "boolean") return null;
      if (typeof props.value === "undefined") return null;
      return (
        <div className="flex w-full items-center justify-between gap-2">
          <span className="truncate font-normal">{props.value}</span>
          <span
            className={cn("h-2 w-2 rounded-full", tagsColor[props.value].dot)}
          />
        </div>
      );
    },
    options: TAGS.map((tag) => ({ label: tag, value: tag })),
  },
] satisfies DataTableFilterField<ColumnSchema>[];
