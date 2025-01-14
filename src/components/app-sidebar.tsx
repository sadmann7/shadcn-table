"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  LifeBuoy,
  Map,
  PieChart,
  Send,
  Settings2,
  SquareTerminal,
} from "lucide-react"

import { useSession } from "@/lib/auth-client"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { SocialsFooter } from "@/components/layout/socials-footer"
import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Cartpak",
      logo: GalleryVerticalEnd,
      // plan: "Enterprise",
    },
    // {
    //   name: "Acme Corp.",
    //   logo: AudioWaveform,
    //   plan: "Startup",
    // },
    // {
    //   name: "Evil Corp.",
    //   logo: Command,
    //   plan: "Free",
    // },
  ],
  navMain: [
    {
      title: "Замовлення",
      url: "#",
      icon: SquareTerminal,
      disabled: false,
      items: [
        {
          title: "Замовлення клієнтів",
          url: "#",
        },
        {
          title: "Завдання на закупівлю",
          url: "#",
        },
        {
          title: "Завдання на виробництво",
          url: "#",
        },
      ],
    },
    {
      title: "Виробництво",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Збірка/Розбірка",
          url: "#",
        },
        {
          title: "Специфікації",
          url: "#",
        },
      ],
    },
    {
      title: "Товари",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Залишки на складі",
          url: "#",
        },
        {
          title: "Номенклатура",
          url: "#",
        },
        {
          title: "Категорії",
          url: "#",
        },
      ],
    },
    // {
    //   title: "Проекти",
    //   url: "#",
    //   icon: Settings2,
    //   items: [
    //     {
    //       title: "General",
    //       url: "#",
    //     },
    //     {
    //       title: "Team",
    //       url: "#",
    //     },
    //     {
    //       title: "Billing",
    //       url: "#",
    //     },
    //     {
    //       title: "Limits",
    //       url: "#",
    //     },
    //   ],
    // },
  ],
  navSecondary: [
    {
      title: "FAQ",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Підтримка",
      url: "#",
      icon: Send,
    },
  ],
  projects: [
    {
      name: "Склади",
      url: "#",
      icon: Frame,
    },
    {
      name: "Проекти",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Працівники",
      url: "#",
      icon: Map,
    },
    {
      name: "Налаштування",
      url: "#",
      icon: Map,
    },
    {
      name: "Імпорт",
      url: "#",
      icon: Map,
    },
    {
      name: "Статистика",
      url: "#",
      icon: Map,
    },
    {
      name: "Архів",
      url: "#",
      icon: Map,
    },
  ],
}

// export function AppSidebar({ user, ...props }: React.ComponentProps<typeof Sidebar>) {
export function AppSidebar({ user, ...props }: any) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        {/* <SocialsFooter /> */}
        {/* @ts-ignore */}
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
