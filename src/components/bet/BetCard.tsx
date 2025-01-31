'use client'
/* eslint-disable @typescript-eslint/no-unused-vars */

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Bet } from "@/types"
import { useState } from "react"
import { BarChart3, Timer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { GeistMono } from "geist/font/mono"

export function BetCard({ bet }: { bet: Bet }) {
  const question = bet.betTitle || "InvalidBet"
  const totalYes = bet.totalYes/(10**9);
  const totalNo = bet.totalNo/(10**9);
  const resolved = bet.isResolved;
  const finalOutcome = bet.finalOutcome;
  const side = bet.side
  const status = bet.isResolved == false ? "ACTIVE" : bet.finalOutcome == true ? "WON" : "LOST"
  const participantCount = 6
  const betResolutionDate = bet.betResolutionDateInEpochTime;
  const currentTime = Math.floor(Date.now()/1000);
  const timeRemainingInSeconds = (betResolutionDate - currentTime) > 0 ? betResolutionDate - currentTime : 0;
  const timeRemainingInDays = Math.floor(timeRemainingInSeconds / (24 * 60 * 60));
  const remainingHours = Math.floor((timeRemainingInSeconds % (24 * 60 * 60))/(60*60));
  const remainingMinutes = Math.floor((timeRemainingInSeconds % (60 * 60)) / 60);
const remainingSeconds = timeRemainingInSeconds % 60;

  const statusStyles = {
    ACTIVE: {
      background: "bg-[rgb(244,113,181,0.8)]",
      glow: "shadow-[0_0_8px_rgba(244,113,181,0.5)]",
    },
    WON: {
      background: "bg-blue-600",
      glow: "shadow-[0_0_8px_rgba(37,99,235,0.5)]",
    },
    LOST: {
      background: "bg-red-900",
      glow: "shadow-[0_0_8px_rgba(185,28,28,0.5)]",
    },
  }

  const sideStyles = {
    YES: {
      text: "text-green-400",
      glow: "drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]",
    },
    NO: {
      text: "text-red-500",
      glow: "drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]",
    },
  }

  return (
    <Card className="w-full cursor-pointer bg-black bg-opacity-50 border-[0.7px] border-opacity-20 hover:border-opacity-40 border-white text-white rounded-3xl p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 md:space-y-6 transition-all duration-300 ease-in-out">
      <div className="flex items-center gap-2 transition-all duration-300">
        {status !== "ACTIVE" && (
          <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 rounded-full bg-emerald-400/20 flex items-center justify-center transition-all duration-300">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 text-emerald-400 transition-all duration-300">✓</div>
          </div>
        )}
        <span className={cn(
          "px-2 sm:px-3 md:px-4 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium",
          "transition-all duration-300",
          statusStyles[status].background,
          statusStyles[status].glow,
        )}>
          {status}
        </span>
      </div>
      
      <h2 className="text-lg sm:text-xl md:text-2xl font-bold glow-effect-text mt-16 sm:mt-20 md:mt-24 line-clamp-2 transition-all duration-300">
        {question}
      </h2>

      <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4 text-[0.65rem] sm:text-[0.7rem] font-bold transition-all duration-300">
        <Button variant="ghost" className="bg-[#252a29] h-5 sm:h-6 rounded-[0.5rem] hover:bg-[#252a29] text-white transition-all duration-300">
          BET
        </Button>
        {[
          { icon: <BarChart3 className="w-3 sm:w-4 h-3 sm:h-4 text-gray-400" />, value: "8.6K", label: "volume" },
          { icon: <BarChart3 className="w-3 sm:w-4 h-3 sm:h-4 text-gray-400" />, value: participantCount, label: "bets" }
        ].map((item, index) => (
          <div key={index} className="flex items-center gap-1 sm:gap-2 h-5 sm:h-6 bg-[#101010] px-2 py-1 rounded-[0.5rem] border-[1px] border-white border-opacity-20 hover:border-opacity-50 transition-all duration-300">
            {item.icon}
            <span className={`font-mono text-xs sm:text-sm transition-all duration-300 ${GeistMono.className}`}>{item.value}</span>
            <span className="text-gray-400 text-xs sm:text-sm transition-all duration-300">{item.label}</span>
          </div>
        ))}
      </div>

      <div className="space-y-3 sm:space-y-4 transition-all duration-300">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="relative w-10 sm:w-12 md:w-16 h-10 sm:h-12 md:h-16 flex-shrink-0 transition-all duration-300">
            <div className="absolute inset-0 flex items-center justify-center transition-all duration-300">
              <Timer className="w-5 sm:w-6 md:w-8 h-5 sm:h-6 md:h-8 transition-all duration-300" />
            </div>
            <svg className="w-full h-full rotate-[-90deg] transition-all duration-300">
              <circle
                cx="50%"
                cy="50%"
                r="45%"
                stroke="#363636"
                strokeWidth="6"
                fill="none"
                className="rounded-full z--50 transition-all duration-300"
                strokeDasharray={175}
                strokeDashoffset={0}
                strokeLinecap="round"
              />
              <circle
                cx="50%"
                cy="50%"
                r="45%"
                stroke="#ffffff"
                strokeWidth="6"
                fill="none"
                className="rounded-full transition-all duration-300"
                strokeDasharray={175}
                strokeDashoffset={44}
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="transition-all duration-300">
            <div className={`text-[#9fa3a1] text-xs sm:text-sm transition-all duration-300 ${GeistMono.className}`}>
              Time Remaining
            </div>
            <div className="text-sm sm:text-base md:text-lg font-mono transition-all duration-300">
              {[`${timeRemainingInDays}D`, `${remainingHours}H`, `${remainingMinutes}M`, `${remainingSeconds}S`].map((time, index) => (
                <span key={index} className="transition-all duration-300">
                  <span>{time.slice(0, -1)}</span>
                  <span className="text-[#818181] mx-1">{time.slice(-1)}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4 transition-all duration-300">
        <div className="flex items-center justify-between transition-all duration-300">
          <div className="flex items-baseline gap-2">
            <span className="text-lg sm:text-2xl md:text-4xl font-bold transition-all duration-300">$1000</span>
            <span className={cn(
              "text-lg sm:text-2xl md:text-4xl font-bold tracking-tight",
              "transition-all duration-300",
              sideStyles[side].text,
              sideStyles[side].glow,
            )}>
              {side}
            </span>
          </div>
        </div>

        <div className={`flex justify-between pt-2 sm:pt-3 md:pt-4 text-[0.65rem] sm:text-xs md:text-sm transition-all duration-300 ${GeistMono.className}`}>
          {[
            { color: "bg-[#34ff82]", label: "Total Yes", value: totalYes.toString() },
            { color: "bg-[#ff3134]", label: "Total No", value: totalNo.toString() }
          ].map((item, index) => (
            <div key={index} className="flex items-center gap-1 sm:gap-2 transition-all duration-300">
              <div className={`w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full ${item.color} transition-all duration-300`} />
              <span className="text-[#818181] transition-all tracking-tighter duration-300">{item.label}</span>
              <span className="transition-all duration-300">
                ${item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}