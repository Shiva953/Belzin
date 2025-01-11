'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from "@/components/ui/sidebar"
import { Users, MessageSquare, Bot } from 'lucide-react'
import { cn } from "@/lib/utils"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { NavUser } from './side-user'


const menuItems = [
  { href: '/', icon: Users, label: 'Public Chat' },
  { href: '/conversations', icon: MessageSquare, label: 'Private Chats' },
  { href: '/agent', icon: Bot, label: 'Chat with Agent' },
]

export function AppSidebar() {
  const pathname = usePathname()
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  return (
    <Sidebar className="z-20 bg-gradient-to-b from-gray-900 to-gray-800 text-white border-r border-gray-800">
      <SidebarHeader className={`p-4`}>
        <h1 className={`text-2xl tracking-tighter font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600`}>
          Belzin
        </h1>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} passHref legacyBehavior>
                  <SidebarMenuButton
                    asChild
                    className={cn(
                      "h-12 my-1 transition-all duration-200 ease-in-out",
                      pathname === item.href
                        ? "bg-gray-700 text-white"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white",
                      hoveredItem === item.href && "scale-105"
                    )}
                    onMouseEnter={() => setHoveredItem(item.href)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <a className="flex items-center px-4 py-2 rounded-lg">
                      <item.icon className={cn(
                        "h-5 w-5 mr-3",
                        pathname === item.href ? "text-blue-400" : "text-gray-400"
                      )} />
                      <span className="text-lg font-medium">{item.label}</span>
                    </a>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        {/* <NavUser/> */}
      </SidebarFooter>
    </Sidebar>
  )
}