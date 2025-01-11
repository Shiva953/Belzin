import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function NavBar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-white text-2xl font-semibold">
            Kino
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/product" className="text-gray-300 hover:text-white transition-colors">
              Product
            </Link>
            <Link href="/careers" className="text-gray-300 hover:text-white transition-colors">
              Careers
            </Link>
          </div>
        </div>
        <Button variant="outline" className="bg-transparent border-[0.5px] border-white/20 text-white hover:bg-white/10">
          Book A Demo
        </Button>
      </div>
    </nav>
  )
}