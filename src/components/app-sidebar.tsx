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
          disabled: true,
        },
        {
          title: "Завдання на виробництво",
          url: "#",
          disabled: true,
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
          disabled: true,
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
          disabled: true,
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
      disabled: true,
    },
    {
      title: "Підтримка",
      url: "#",
      icon: Send,
      disabled: true,
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
      disabled: true,
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
      disabled: true,
    },
    {
      name: "Статистика",
      url: "#",
      icon: Map,
      disabled: true,
    },
    {
      name: "Архів",
      url: "#",
      icon: Map,
      disabled: true,
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
