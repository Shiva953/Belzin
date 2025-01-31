// /* eslint-disable @typescript-eslint/no-unused-vars */
// "use client";
// import {
//   User,
//   Users, 
//   MessageSquare, 
//   Bot, 
//   TrendingUp, 
//   Wallet,
// } from "lucide-react";
// import Link from "next/link";
// import React from "react";
// import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
// import { usePathname } from "next/navigation";
// import { cn } from "@/lib/utils";
// import { useWallet } from "@solana/wallet-adapter-react";
// import { UserProfile } from "../UserProfile";
// import { UserT } from "@/types";

// const Sidebar = ({ 
//   onSignOut, 
//   userProfile 
// }: { 
//   onSignOut?: () => Promise<void>, 
//   userProfile?: UserT | null 
// }) => {
//   const { publicKey } = useWallet();
//   const user = publicKey?.toBase58() || '';
//   const [isExpanded, setIsExpanded] = React.useState(false)
//   const pathname = usePathname();

//   const isActive = (linkPath: string) => pathname.includes(linkPath);

//   return (
//     <div className="flex justify-between">
//       <div
//         className={cn(
//           "w-20 pt-8 pb-4 group",
//           "min-h-screen overflow-hidden flex flex-col items-start gap-8 px-4 relative",
//           "z-50 transition-all duration-300 ease-in-out",
//           isExpanded && "w-64",
//         )}
//         onMouseEnter={() => setIsExpanded(true)}
//         onMouseLeave={() => setIsExpanded(false)}
//       >
//         {userProfile && onSignOut && (
//           <div className="w-full mb-8">
//             <UserProfile user={userProfile} onSignOut={onSignOut} />
//           </div>
//         )}
//         {[
//           { href: `/profile/${user}`, icon: User, label: "Profile", activeCheck: "/profile/" },
//           { href: "/", icon: Users, label: "Public Chat", activeCheck: "/" },
//           { href: "/conversations", icon: MessageSquare, label: "Private Chats", activeCheck: "/conversations" },
//           { href: "/agent", icon: Bot, label: "Chat With Agent", activeCheck: "/agent" },
//           { href: `/bets/${user}`, icon: TrendingUp, label: "View Bets", activeCheck: `/bets/${user}` },
//         ].map(({ href, icon: Icon, label, activeCheck }) => (
//           <Tooltip key={href}>
//             <TooltipTrigger>
//               <Link
//                 href={href}
//                 className={cn(
//                   "flex items-center gap-4 w-full p-2 rounded-md transition-colors duration-200",
//                   isActive(activeCheck)
//                     ? "text-cyan-50"
//                     : "text-gray-400 hover:text-[#45bd95]",
//                 )}
//               >
//                 <Icon
//                   size={24}
//                   color={isActive(activeCheck) ? "cyan" : "currentColor"}
//                 />
//                 <span
//                   className={`hidden group-hover:inline-block transition-all duration-300 ease-in-out ${
//                     isActive(activeCheck) && "text-cyan-500"
//                   }`}
//                 >
//                   {label}
//                 </span>
//               </Link>
//             </TooltipTrigger>
//             <TooltipContent className="bg-black" sideOffset={10}>
//               <p>{label}</p>
//             </TooltipContent>
//           </Tooltip>
//         ))}
//       </div>

//       <div className="rotate-180 h-screen w-px">
//         <div className="w-full h-full bg-gradient-to-b from-transparent via-[#39628b] to-transparent"></div>
//       </div>
//     </div>
//   );
// };

// export default Sidebar;
"use client"

import { User, Users, MessageSquare, Bot, TrendingUp, HelpCircle } from "lucide-react"
import Link from "next/link"
import React from "react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useWallet } from "@solana/wallet-adapter-react"
import { UserProfile } from "../UserProfile"
import type { UserT } from "@/types"

const Sidebar = ({
  onSignOut,
  userProfile,
}: {
  onSignOut?: () => Promise<void>
  userProfile?: UserT | null
}) => {
  const { publicKey } = useWallet()
  const user = publicKey?.toBase58() || ""
  // const [isExpanded, setIsExpanded] = React.useState(false)
  const pathname = usePathname()

  const isActive = (linkPath: string) => pathname.includes(linkPath)

  return (
    <div className="flex justify-between">
      <div
        className={cn(
          "w-16 pt-8 pb-4 group bg-black/95",
          "min-h-screen overflow-hidden flex flex-col items-center gap-8 px-2 relative",
          "z-50 transition-all duration-300 ease-in-out",
          // isExpanded && "w-64",
        )}
        // onMouseEnter={() => setIsExpanded(true)}
        // onMouseLeave={() => setIsExpanded(false)}
      >
        {userProfile && onSignOut && (
          <div className="w-full mb-8 ml-4">
            <UserProfile user={userProfile} onSignOut={onSignOut} />
          </div>
        )}
        <div className="flex flex-col items-center gap-6 flex-1">
          {[
            { href: `/profile/${user}`, icon: User, label: "Profile", activeCheck: "/profile/", color: "#ff4444" },
            { href: "/", icon: Users, label: "Public Chat", activeCheck: "/" },
            { href: "/conversations", icon: MessageSquare, label: "Private Chats", activeCheck: "/conversations" },
            { href: "/agent", icon: Bot, label: "Chat With Agent", activeCheck: "/agent" },
            { href: `/bets/${user}`, icon: TrendingUp, label: "View Bets", activeCheck: `/bets/${user}` },
          ].map(({ href, icon: Icon, label, activeCheck, color }) => (
            <Tooltip key={href}>
              <TooltipTrigger asChild>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center justify-center w-10 h-10 relative",
                    "before:absolute before:left-0 before:w-[3px] before:h-full before:bg-white before:opacity-0 before:transition-opacity",
                    isActive(activeCheck) && "before:opacity-100",
                  )}
                >
                  <Icon
                    size={20}
                    className={cn(
                      "transition-colors",
                      isActive(activeCheck) ? (color ? `text-[${color}]` : "text-white") : "text-white/60",
                    )}
                    strokeWidth={isActive(activeCheck) ? 2.5 : 2}
                  />
                  <span className="sr-only">{label}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-black/90 text-white border-none px-3 py-1.5">
                <p className="text-sm">{label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <button className="flex items-center justify-center w-10 h-10">
              <HelpCircle size={20} className="text-white/60" />
              <span className="sr-only">Help</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-black/90 text-white border-none px-3 py-1.5">
            <p className="text-sm">Help</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="rotate-180 h-screen w-px">
        <div className="w-full h-full bg-gradient-to-b from-transparent via-[#39628b] to-transparent"></div>
      </div>
    </div>
  )
}

export default Sidebar