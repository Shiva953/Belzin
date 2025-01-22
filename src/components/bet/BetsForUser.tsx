import { BetCard } from "./BetCard"
import { ScrollArea } from "../ui/scroll-area"
import type { Bet } from "@/types"
import { ArrowRight, DollarSign, Percent, Trophy } from "lucide-react"
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
    else{
        return 0
    }
  }, 0)

  return (
    <div className="h-screen w-full mt-16 p-4 md:p-8 border-white rounded-2xl">
      <div className="w-full mx-auto">
        <div className="flex w-full items-center gap-3 mb-6 md:mb-8">
          <h1 className="text-3xl md:text-4xl font-bold glow-effect-text text-white">Bets Placed</h1>
          <ArrowRight className="w-4 h-4 text-gray-400" />
          <h3 className="text-md font-semibold z-40 text-gray-400 !cursor-pointer hover:text-gray-200 hover:!cursor-pointer hover:underline font-mono">
            {shortenPublicKey(userAddress)}
          </h3>
        </div>
        <div className="flex gap-4">
          <ScrollArea className="h-[calc(100vh-8rem)] pr-4 flex-grow">
            <div className="space-y-4">
              {bets.map((bet, index) => (
                <BetCard key={index} bet={bet} />
              ))}
            </div>
          </ScrollArea>
          <div className="ml-2 space-y-4">
            <Card className="border-gray-700 w-[25rem] h-[8rem] bg-[rgb(13,13,13,0.3)] rounded-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Bet Volume (Total)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-extrabold text-white glow-effect-text flex items-center">
                  <DollarSign className="w-6 h-6 mr-2 text-green-400" />
                  {totalBetVolume.toFixed(2)}
                </div>
              </CardContent>
            </Card>
            <Card className="border-gray-700 w-[25rem] h-[8rem] bg-[rgb(13,13,13,0.3)] rounded-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Bets Won</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-extrabold glow-effect-text text-white flex items-center">
                  <Trophy className="w-6 h-6 mr-4 text-yellow-400" />
                  {winningBets}/{bets.length}
                </div>
              </CardContent>
            </Card>
            <Card className="border-gray-700 w-[25rem] h-[8rem] bg-[rgb(13,13,13,0.3)] rounded-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">PnL (Total)</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-4xl font-extrabold flex items-center ${totalPnL >= 0 ? "text-green-400" : "text-red-400"}`}
                >
                  <Percent className="w-6 h-6 mr-2" />
                  {totalPnL >= 0 ? "+" : "-"}${Math.abs(totalPnL).toFixed(2)}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}