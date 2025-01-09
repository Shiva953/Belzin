'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Users, MessageSquare, BotIcon as Robot, Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export function VerticalNavbar() {
  const pathname = usePathname()

  return (
    <nav className="w-64 bg-white h-full z-10 border-r border-border">
          <div className="flex flex-col h-full p-4 overflow-y-hidden fixed">
            <Link href="/" className="w-full mb-4">
              <Button
                variant="ghost"
                size="lg"
                className={cn(
                  'w-full justify-start hover:bg-primary/10 text-lg',
                  pathname === '/' && 'bg-primary/10'
                )}
              >
                <Users className="h-5 w-5 mr-2" />
                <span className="gradient-text">Public Chat</span>
              </Button>
            </Link>
            <Link href="/conversations" className="w-full mb-4">
              <Button
                variant="ghost"
                size="lg"
                className={cn(
                  'w-full justify-start hover:bg-primary/10 text-lg',
                  pathname === '/conversations' && 'bg-primary/10'
                )}
              >
                <MessageSquare className="h-5 w-5 mr-2" />
                <span className="gradient-text">Private Chats</span>
              </Button>
            </Link>
            <Link href="/agent" className="w-full mb-4">
              <Button
                variant="ghost"
                size="lg"
                className={cn(
                  'w-full justify-start hover:bg-primary/10 text-lg',
                  pathname === '/agent' && 'bg-primary/10'
                )}
              >
                <Robot className="h-5 w-5 mr-2" />
                <span className="gradient-text">Chat With Agent</span>
              </Button>
            </Link>
            <Link href="/wallet" className="w-full">
              <Button
                variant="ghost"
                size="lg"
                className={cn(
                  'w-full justify-start hover:bg-primary/10 text-lg',
                  pathname === '/wallet' && 'bg-primary/10'
                )}
              >
            <Wallet className="h-5 w-5 mr-2" />
            <span className="gradient-text">Wallet</span>
          </Button>
        </Link>
      </div>
    </nav>
  )
}