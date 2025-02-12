"use client"

import { Card } from "@/components/ui/card"
import { Trophy } from "lucide-react"
import { Bettor } from "./BettorsTable"
import { ChevronRight } from "lucide-react"

export function BettorCard({ rank, address, totalResolvedBetVolume, totalBetVolume, bets, pnl }: Bettor) {
  const getTrophyColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "text-yellow-500"
      case 2:
        return "text-gray-400"
      case 3:
        return "text-amber-700"
      default:
        return "text-gray-500"
    }
  }

  return (
    <Card className="bg-[#000000] border-[#2a2a2a] p-6 rounded-xl">
      <div className="flex justify-between items-start mb-6">
        {/* <div className="font-mono text-gray-300 text-sm">{address}</div> */}
        <div className="flex flex-row items-center z-50 group-hover:text-white transition-all duration-200 cursor-pointer">
          <a href={`/bets/${address}`} className="font-mono text-sm font-semibold tracking-tight text-white/70 hover:text-white hover:underline group-hover:text-white mx-2 transition-opacity duration-200">{address.substring(0,10).concat("...")}</a>
          <ChevronRight className="h-4 w-4 transform group-hover:translate-x-4 transition-transform duration-200"/>
          </div>
        <Trophy className={`w-6 h-6 ${getTrophyColor(rank)}`} />
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            
            Total Resolved Volume
          </div>
          <div className="font-mono text-white">${totalResolvedBetVolume.toLocaleString()}</div>
        </div>
        <div>
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            
            Total Volume
          </div>
          <div className="font-mono text-white">${totalBetVolume.toLocaleString()}</div>
        </div>
        <div>
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2">
              <path d="M3 7L9 4L15 7L21 4V17L15 20L9 17L3 20V7Z" />
            </svg>
            Bets
          </div>
          <div className="font-mono text-white">{bets}</div>
        </div>
        <div>
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2">
              <path d="M3 7L9 4L15 7L21 4V17L15 20L9 17L3 20V7Z" />
            </svg>
            PnL
          </div>
          <div className="font-mono text-white">${pnl.toLocaleString()}</div>
        </div>
      </div>
    </Card>
  )
}