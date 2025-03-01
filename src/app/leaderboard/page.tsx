import { BettorCard } from "@/components/leaderboard/BettorCard"
import { BettorsTable } from "@/components/leaderboard/BettorsTable"
import { Bettor } from "@/types"

async function getTopBettors() {
  try {
    // Replace with your actual API URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                   (process.env.NODE_ENV === 'development' 
                    ? 'http://localhost:3000' 
                    : 'https://www.belzin.fun');
    const res = await fetch(`${baseUrl}/api/topBettors`, {
      // next: { revalidate: 60 },
      cache: 'no-store',
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
    
    if (!res.ok) {
      throw new Error('Failed to fetch bettors');
    }
    
    const topBettors = await res.json();
    console.log("TopBettors: ",topBettors)
    return topBettors;
  } catch (error) {
    console.error('Error fetching bettors:', error);
    return [];
  }
}

//just for sample
// const topBettors = [
//     {
//       rank: 1,
//       address: "EHGUQcwaaiy7...",
//       totalResolvedBetVolume: 45590,
//       totalBetVolume: 27720,
//       bets: 832,
//       pnl: 15324,
//     },
//     {
//       rank: 2,
//       address: "5FzqLqMJ1JES...",
//       totalResolvedBetVolume: 72015,
//       totalBetVolume: 131447,
//       bets: 329,
//       pnl: 4530.7,
//     },
//     {
//       rank: 3,
//       address: "EyuaQkc2UtC4...",
//       totalResolvedBetVolume: 56807,
//       totalBetVolume: 143989,
//       bets: 307,
//       pnl: 3799.9,
//     },
//   ]
  
//   const otherBettors = [
//     {
//       rank: 4,
//       address: "8HFaZq2jvrIU...",
//       totalResolvedBetVolume: 2511.9,
//       totalBetVolume: 2511.9,
//       bets: 2,
//       pnl: 2511.9,
//     },
//     {
//       rank: 5,
//       address: "CLcXVZpCwF9Q...",
//       totalResolvedBetVolume: 4053.3,
//       totalBetVolume: 1416.8,
//       bets: 6,
//       pnl: 2143.2,
//     },
//     {
//       rank: 6,
//       address: "BmdoHjjMcJyF...",
//       totalResolvedBetVolume: 5659.7,
//       totalBetVolume: 5633.4,
//       bets: 65,
//       pnl: 1251.3,
//     },
//     {
//       rank: 7,
//       address: "GsXtnhoBLaFM...",
//       totalResolvedBetVolume: 7181.6,
//       totalBetVolume: 4569.0,
//       bets: 74,
//       pnl: 936.6,
//     },
//     {
//       rank: 8,
//       address: "4ARYaJGER7Vg...",
//       totalResolvedBetVolume: 100266,
//       totalBetVolume: 192974,
//       bets: 42,
//       pnl: 899.6,
//     },
//     {
//       rank: 9,
//       address: "2fhVRoaTnsTu...",
//       totalResolvedBetVolume: 11294,
//       totalBetVolume: 8810.7,
//       bets: 4,
//       pnl: 705.5,
//     },
//     {
//       rank: 10,
//       address: "GVPGnbtafRbs...",
//       totalResolvedBetVolume: 600.0,
//       totalBetVolume: 2293.9,
//       bets: 4,
//       pnl: 600.0,
//     },
//     {
//       rank: 11,
//       address: "Eu7qycf5roJN...",
//       totalResolvedBetVolume: 95790,
//       totalBetVolume: 78111,
//       bets: 189,
//       pnl: 552.5,
//     },
//   ]

  export default async function Leaderboard() {
    const allBettors:Bettor[] = await getTopBettors();
    
    const topBettors = allBettors.slice(0, 3);
    const otherBettors = allBettors.slice(3);

    return (
      <div className="w-full overflow-y-scroll no-scrollbar">
        <div className="min-h-screen w-full bg-black text-white p-6 mx-auto items-center">
          <h1 className="text-xl sm:text-2xl md:text-3xl mb-6 font-extrabold tracking-tight text-white transition-all duration-300">
            Top Bettors
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {topBettors.map((bettor) => (
              <BettorCard key={bettor.rank} {...bettor} />
            ))}
          </div>
          <BettorsTable bettors={otherBettors} />
        </div>
        </div>
    );
}