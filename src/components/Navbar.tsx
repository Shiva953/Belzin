'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MessageCircle, Users } from 'lucide-react'

const Navbar = () => {
  const pathname = usePathname()

  return (
    <nav className="w-16 bg-gray-800 text-white flex flex-col items-center py-4 space-y-4">
      <Link href="/" className={`p-2 rounded-full ${pathname === '/' ? 'bg-gray-700' : ''}`}>
        <Users size={24} />
      </Link>
      <Link href="/dms" className={`p-2 rounded-full ${pathname === '/dms' ? 'bg-gray-700' : ''}`}>
        <MessageCircle size={24} />
      </Link>
    </nav>
  )
}

export default Navbar