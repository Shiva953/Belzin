"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronRight } from "lucide-react"

export interface Bettor {
  rank: number
  address: string
  totalResolvedBetVolume: number
  totalBetVolume: number
  bets: number
  pnl: number
}

interface BettorsTableProps {
  bettors: Bettor[]
}

export function BettorsTable({ bettors }: BettorsTableProps) {
  return (
    <div className="border border-[#2a2a2a] bg-[#00000] rounded-xl">
      <Table>
        <TableHeader>
          <TableRow className="border-[#2a2a2a] hover:bg-[#1a1a1a]">
            <TableHead className="text-gray-400 font-normal">Rank</TableHead>
            <TableHead className="text-gray-400 font-normal">Bettor</TableHead>
            <TableHead className="text-gray-400 font-normal text-right">Total Resolved Volume</TableHead>
            <TableHead className="text-gray-400 font-normal text-right">Total Volume</TableHead>
            <TableHead className="text-gray-400 font-normal text-right">Bets</TableHead>
            <TableHead className="text-gray-400 font-normal text-right">PnL</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bettors.map((bettor) => (
            <TableRow key={bettor.rank} className="border-[#2a2a2a] hover:bg-[#1a1a1a]">
              <TableCell className="font-mono text-gray-500">{bettor.rank}</TableCell>
              <TableCell className="font-mono text-gray-300">
              <div className="flex flex-row items-center z-50 group-hover:text-white transition-all duration-200 cursor-pointer" onClick={() => window.open(`https://solscan.io/account/${bettor.address}`)}>
              <span className="font-mono text-sm font-semibold tracking-tight text-white/70 hover:text-white hover:underline group-hover:text-white mx-2 transition-opacity duration-200">{bettor.address.substring(0,10).concat("...")}</span>
              <ChevronRight className="h-4 w-4 transform group-hover:translate-x-4 transition-transform duration-200"/>
              </div>
                </TableCell>
              <TableCell className="font-mono text-gray-300 text-right">
                ${bettor.totalResolvedBetVolume.toLocaleString()}
              </TableCell>
              <TableCell className="font-mono text-gray-300 text-right">
                ${bettor.totalBetVolume.toLocaleString()}
              </TableCell>
              <TableCell className="font-mono text-gray-300 text-right">{bettor.bets}</TableCell>
              <TableCell className="font-mono text-gray-300 text-right">${bettor.pnl.toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}