'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Users, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export function VerticalNavbar() {
  const pathname = usePathname()

  return (

    <nav className="fixed flex flex-col w-16 h-[100vh] bg-secondary z-20">
      <div className="flex-1 flex flex-col items-center justify-center space-y-4">
        <Link href="/">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'hover:bg-primary/10',
              pathname === '/' && 'bg-primary/10'
            )}
          >
            <Users className="h-5 w-5" />
            <span className="sr-only">Public Group Chat</span>
          </Button>
        </Link>
        <Link href="/conversations">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'hover:bg-primary/10',
              pathname === '/conversations' && 'bg-primary/10'
            )}
          >
            <MessageSquare className="h-5 w-5" />
            <span className="sr-only">Private Chats</span>
          </Button>
        </Link>
        <Link href="/agent">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'hover:bg-primary/10',
              pathname === '/agent' && 'bg-primary/10'
            )}
          >
            <MessageSquare className="h-5 w-5" />
            <span className="sr-only">Chat With Agent</span>
          </Button>
        </Link>
      </div>
    </nav>
  )
}