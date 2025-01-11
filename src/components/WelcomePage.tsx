import { NavBar } from '@/components/nav-bar'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
// import { StarsBackground } from './ui/stars-background'
// import Image from 'next/image'
// import '@/styles/glow.css'

export function WelcomePage({handleSignIn}: {handleSignIn: () => Promise<void>}) {
  return (
    <main className="min-h-screen text-white overflow-hidden">
        {/* <StarsBackground/> */}
      <NavBar />
      
      <div className="max-w-7xl mx-auto px-6">
        <div className="pt-24 pb-32 flex flex-col items-center text-center">
          {/* <Banner /> */}
          
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
            Sign In With Solana
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </div>
      </div>
    </main>
  )
}

