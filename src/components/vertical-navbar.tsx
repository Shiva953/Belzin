'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Users, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export function VerticalNavbar() {
  const pathname = usePathname()

  return (

    <nav className="flex flex-col w-16 h-full bg-secondary">
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
        <Link href="/dms">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'hover:bg-primary/10',
              pathname === '/dms' && 'bg-primary/10'
            )}
          >
            <MessageSquare className="h-5 w-5" />
            <span className="sr-only">Private DMs</span>
          </Button>
        </Link>
      </div>
      {/* <div className="p-2">
        <WalletMultiButtonDynamic className="!bg-primary hover:!bg-primary/90 text-primary-foreground" />
      </div> */}
    </nav>
  )
}