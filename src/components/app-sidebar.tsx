import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton
  } from "@/components/ui/sidebar"
  import { Users, MessageSquare, BotIcon as Robot } from 'lucide-react'
  
  export function AppSidebar() {
    return (
      <Sidebar className="z-20">
        {/* <SidebarHeader className="mt-16">
            AzenticChat
        </SidebarHeader> */}
        <SidebarContent className="bg-[rgb(9,10,10)]">
        <span className="absolute inset-0 z--20 overflow-hidden">
        <span className="absolute inset-0 z--20 bg-[image:radial-gradient(100%_75%_at_0%_50%,rgba(56,189,248,0.3)_0%,rgba(56,189,248,0)_75%)] transition-opacity duration-500"></span>
        </span>
          <SidebarGroup>
          <SidebarGroupLabel className="mt-16">Application</SidebarGroupLabel>
          <SidebarMenu>
                <SidebarMenuItem className="my-2">
                  <SidebarMenuButton asChild>
                    <a href={'/'}>
                    <Users className="h-5 w-5 mr-2" />
                      <span className="text-xl font-bold">Public Chat</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem className="my-2">
                  <SidebarMenuButton asChild>
                    <a href={'/conversations'}>
                    <MessageSquare className="h-5 w-5 mr-2" />
                      <span className="text-xl font-bold">Private Chats</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem className="my-2">
                  <SidebarMenuButton asChild>
                    <a href={'/agent'}>
                    <Robot className="h-5 w-5 mr-2" />
                      <span className="text-xl font-bold">Chat with Agent</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
          <SidebarGroup />
        </SidebarContent>
        <SidebarFooter />
      </Sidebar>
    )
  }  