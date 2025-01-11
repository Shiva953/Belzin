import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function NavBar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-white text-xl font-semibold">
            Belzin
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-gray-300 hover:text-white transition-colors">
              Twitter
            </Link>
            <Link href="/" className="text-gray-300 hover:text-white transition-colors">
              Github
            </Link>
          </div>
        </div>
        <Button variant="outline" className="bg-transparent border-[0.5px] border-white/20 text-white hover:bg-white/10">
         Get Started
        </Button>
      </div>
    </nav>
  )
}