import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'

export function WelcomePage({ handleSignIn, buttonText }: { handleSignIn: () => Promise<void>, buttonText: string }) {
  return (
    <main className="min-h-screen text-white overflow-hidden">
      <NavBar />
      
      <div className="max-w-7xl mx-auto px-6">
        <div className="pt-24 pb-32 flex flex-col items-center text-center">
          <h1 className="mt-24 mb-6 text-5xl md:text-7xl font-serif glow-text tracking-tight">
            Belzin
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto mb-12">
            Entering SocialFi X Agents, Starting with P2P Bets.
          </p>
          
          <Button 
            size="lg"
            onClick={handleSignIn}
            className="bg-white text-black text-[1rem] w-72 h-16 rounded-full hover:bg-gray-100 transition-colors group"
          >
            {buttonText}
            <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </div>
      </div>
    </main>
  )
}

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