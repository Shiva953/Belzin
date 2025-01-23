import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Bet } from "@/types"

export function BetCard({ bet }: {bet: Bet}) {
    const status = bet.isResolved == false ? "ACTIVE" : (bet.finalOutcome == true ? "WON" : "LOST");
    const question = bet.betTitle || 'InvalidBet';
    const stake = bet.betAmount || 0;
    const side = bet.side;
    const participantCount = 6;

    const statusStyles = {
      ACTIVE: {
        background: "bg-[rgb(244,113,181,0.8)]",
        glow: "shadow-[0_0_8px_rgba(244,113,181,0.5)]"
      },
      WON: {
        background: "bg-blue-600",
        glow: "shadow-[0_0_8px_rgba(37,99,235,0.5)]"
      },
      LOST: {
        background: "bg-red-900",
        glow: "shadow-[0_0_8px_rgba(185,28,28,0.5)]"
      }
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
      <Card 
        className={cn(
          "w-[40rem] bg-[rgb(13,13,13,0.5)] border border-gray-800 p-4 md:p-6 space-y-1 rounded-xl",
          "transition-all duration-300 ease-in-out",
          "hover:border-gray-400 hover:cursor-pointer",
          "hover:shadow-[0_0_15px_rgba(156,163,175,0.4)]",
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4">
            {status !== "ACTIVE" && (
              <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-emerald-400/20 flex items-center justify-center">
                <div className="w-3 h-3 md:w-4 md:h-4 text-emerald-400">✓</div>
              </div>
            )}
            <span className={cn(
              "px-3 md:px-4 py-1 rounded-full text-xs md:text-sm font-medium",
              "transition-all duration-300",
              statusStyles[status].background,
              statusStyles[status].glow
            )}>
              {status}
            </span>
          </div>
        </div>
  
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-3 md:space-y-4">
            <h3 className="text-lg md:text-xl glow-effect-text font-bold text-white">{question}</h3>
            <a className="font-medium text-sm text-opacity-80 text-[rgb(242,201,255)] hover:text-opacity-100 hover:underline hover:cursor-pointer transition-opacity duration-200">View Bet</a>
          </div>
          <div className="text-left md:text-right">
            <div className="text-2xl md:text-4xl tracking-tighter font-bold text-white">${stake}</div>
            <div className={cn(
              "text-2xl md:text-4xl font-bold transition-all duration-300",
              sideStyles[side].text,
              sideStyles[side].glow
            )}>
              {side}
            </div>
          </div>
        </div>
  
        <div className="flex -space-x-2 overflow-hidden">
          {Array.from({ length: participantCount }).map((_, i) => (
            <div
              key={i}
              className="w-6 h-6 md:w-8 md:h-8 rounded-full border border-gray-800"
              style={{
                background: `hsl(${(i * 360) / participantCount}, 70%, 80%)`,
                zIndex: participantCount - i,
              }}
            >
              {i === participantCount - 1 && (
                <div className="w-full h-full flex items-center justify-center text-xs font-medium">
                  +{participantCount}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    )
}