/* eslint-disable @typescript-eslint/no-unused-vars */
import { BetCard } from "./BetCard"
import { ScrollArea } from "../ui/scroll-area"
import type { Bet } from "@/types"
import { ArrowRight, DollarSign, Percent, Trophy } from "lucide-react"
import { ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { shortenPublicKey } from "@/app/lib/utils"

export function BetsPlaced({ bets, userAddress }: { bets: Bet[]; userAddress: string }) {
  const totalBetVolume = bets.reduce((total, bet) => total + bet.betAmount, 0)
  const winningBets = bets.filter((bet) => bet.finalOutcome === true).length
  const totalPnL = bets.reduce((total, bet) => {
    if(bet.isResolved){
        if (bet.finalOutcome === true && bet.side=="YES" || bet.finalOutcome === false && bet.side=="NO") {
            return total + bet.betAmount
        } else {
            return total - bet.betAmount
        }
    }
    return 0
  }, 0)

  return (
    <div className="min-h-screen w-full p-4 sm:p-6 md:p-8 border-white rounded-2xl transition-all duration-300 ease-in-out">
      <div className="w-full max-w-[1920px] mx-auto transition-all duration-300">
        <div className="flex w-full items-center gap-2 sm:gap-3 mb-4 sm:mb-6 md:mb-8 transition-all duration-300">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white transition-all duration-300">Bets</h1>
          <ChevronRight className="text-white w-4 h-4 transition-transform group-hover:translate-x-1" />
          <h3 className="group text-xs sm:text-sm tracking-wider transition-all duration-300 ease-in-out z-40 text-gray-100 cursor-pointer hover:text-white hover:glow-effect-text hover:underline font-mono truncate max-w-[150px] sm:max-w-[200px] md:max-w-none">
            {userAddress}
          </h3>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-4 transition-all duration-500 ease-in-out scrollbar-hide">
          <div className="flex-grow lg:max-w-[calc(100%-26rem)] transition-all duration-300 scrollbar-hide">
            <ScrollArea className="h-[calc(100vh-20rem)] sm:h-[calc(100vh-18rem)] lg:h-[calc(100vh-8rem)] transition-all duration-300 scrollbar-hide">
              <div className="pr-2 sm:pr-4 transition-all duration-300 scrollbar-hide">
                <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2 transition-all duration-300 scrollbar-hide">
                  {bets.map((bet, index) => (
                    <BetCard key={index} bet={bet} />
                  ))}
                </div>
              </div>
            </ScrollArea>
          </div>
          
          <div className="flex flex-col gap-3 sm:gap-4 w-full lg:w-96 transition-all duration-300 ease-in-out">
            {[
              {
                title: "Total Bet Volume",
                value: totalBetVolume.toFixed(2),
                icon: <DollarSign className="w-5 sm:w-6 h-5 sm:h-6 mr-2 text-green-400 transition-all duration-300" />
              },
              {
                title: "Bets Won",
                value: `${winningBets}/${bets.length}`,
                icon: <Trophy className="w-5 sm:w-6 h-5 sm:h-6 mr-2 sm:mr-4 text-yellow-400 transition-all duration-300" />
              },
              {
                title: "PnL",
                value: `${totalPnL >= 0 ? "+" : "-"}$${Math.abs(totalPnL).toFixed(2)}`,
                icon: <Percent className="w-5 sm:w-6 h-5 sm:h-6 mr-2 transition-all duration-300" />,
                valueClass: totalPnL >= 0 ? "text-green-400" : "text-red-400"
              }
            ].map((item, index) => (
              <Card 
                key={index} 
                className="border-gray-700 w-full h-24 sm:h-28 md:h-32 bg-[rgb(13,13,13,0.3)] rounded-xl transition-all duration-300 ease-in-out"
              >
                <CardHeader className="pb-1 sm:pb-2 transition-all duration-300">
                  <CardTitle className="text-xs sm:text-sm font-mono font-medium text-gray-400 transition-all duration-300">
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl sm:text-3xl md:text-4xl font-mono font-bold flex items-center transition-all duration-300 ${item.valueClass || 'text-white glow-effect-text'}`}>
                    {item.icon}
                    {item.value}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoadingText() {

  return (
    <div className="bg-[#1C1C1C] p-8 min-h-[100px] flex items-center">
      <button className="group flex items-center gap-4 relative">
        <div className="flex items-center">
          <span className="font-mono text-white text-2xl">
            BmdoHjjMcJyF
            <span className="inline-block"><span className="loading-dots">...</span></span>
          </span>
        </div>
        <ChevronRight className="text-white w-8 h-8 transition-transform group-hover:translate-x-1" />
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white" />
      </button>
    </div>
  )
}