// 'use client'

// import { useState } from 'react'
// import { usePathname } from 'next/navigation'
// import Link from 'next/link'
// import {
//   Sidebar,
//   SidebarContent,
//   SidebarFooter,
//   SidebarGroup,
//   SidebarHeader,
//   SidebarMenu,
//   SidebarMenuItem,
//   SidebarMenuButton
// } from "@/components/ui/sidebar"
// import { Users, MessageSquare, Bot } from 'lucide-react'
// import { cn } from "@/lib/utils"
// // eslint-disable-next-line @typescript-eslint/no-unused-vars
// import { NavUser } from './side-user'


// const menuItems = [
//   { href: '/', icon: Users, label: 'Public Chat' },
//   { href: '/conversations', icon: MessageSquare, label: 'Private Chats' },
//   { href: '/agent', icon: Bot, label: 'Chat with Agent' },
// ]

// export function AppSidebar() {
//   const pathname = usePathname()
//   const [hoveredItem, setHoveredItem] = useState<string | null>(null)

//   return (
//     <Sidebar className="z-20 bg-gradient-to-b from-gray-900 to-gray-800 text-white border-r border-gray-800">
//       <SidebarHeader className={`p-4`}>
//         <h1 className={`text-2xl tracking-tighter font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600`}>
//           Belzin
//         </h1>
//       </SidebarHeader>
//       <SidebarContent>
//         <SidebarGroup>
//           <SidebarMenu>
//             {menuItems.map((item) => (
//               <SidebarMenuItem key={item.href}>
//                 <Link href={item.href} passHref legacyBehavior>
//                   <SidebarMenuButton
//                     asChild
//                     className={cn(
//                       "h-12 my-1 transition-all duration-200 ease-in-out",
//                       pathname === item.href
//                         ? "bg-gray-700 text-white"
//                         : "text-gray-300 hover:bg-gray-800 hover:text-white",
//                       hoveredItem === item.href && "scale-105"
//                     )}
//                     onMouseEnter={() => setHoveredItem(item.href)}
//                     onMouseLeave={() => setHoveredItem(null)}
//                   >
//                     <a className="flex items-center px-4 py-2 rounded-lg">
//                       <item.icon className={cn(
//                         "h-5 w-5 mr-3",
//                         pathname === item.href ? "text-blue-400" : "text-gray-400"
//                       )} />
//                       <span className="text-lg font-medium">{item.label}</span>
//                     </a>
//                   </SidebarMenuButton>
//                 </Link>
//               </SidebarMenuItem>
//             ))}
//           </SidebarMenu>
//         </SidebarGroup>
//       </SidebarContent>
//       <SidebarFooter className="p-4">
//         {/* <NavUser/> */}
//       </SidebarFooter>
//     </Sidebar>
//   )
// }
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
import { Users, MessageSquare, Bot, TrendingUp, Wallet } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useWallet } from '@solana/wallet-adapter-react'
import { shortenPublicKey } from '@/app/lib/utils'

const menuItems = [
  { href: '/', icon: Users, label: 'Public Chat' },
  { href: '/conversations', icon: MessageSquare, label: 'Private Chats' },
  { href: '/agent', icon: Bot, label: 'Chat with Agent' },
  { href: '/markets', icon: TrendingUp, label: 'Markets' },
]

export function AppSidebar() {
  const pathname = usePathname()
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const { publicKey } = useWallet()

  return (
    <Sidebar className="border-r border-border/10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <SidebarHeader className="p-4 space-y-4">
        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          Belzin
        </h1>
        <Button 
          variant="outline" 
          className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
        >
          <Wallet className="h-4 w-4" />
          {publicKey ? shortenPublicKey(publicKey.toString()) : 'Connect Wallet'}
        </Button>
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
                      "h-11 w-full gap-2 transition-all duration-200",
                      pathname === item.href
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                      hoveredItem === item.href && "scale-[0.98]"
                    )}
                    onMouseEnter={() => setHoveredItem(item.href)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <a className="flex items-center px-4 py-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </a>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/50">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">SOL Price</p>
            <p className="text-xs text-muted-foreground">$239.82 USDC</p>
          </div>
          <span className="text-xs text-emerald-500">+5.2%</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}