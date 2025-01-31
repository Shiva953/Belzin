/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"
import { pusherClient } from "@/lib/pusher"
import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import Link from "next/link"
import { Blink, useAction } from "@dialectlabs/blinks"
import { useActionSolanaWalletAdapter } from "@dialectlabs/blinks/hooks/solana"
import type { User } from "@prisma/client"
import type { Message, ChatMessage } from "@/types"
import { cn } from "@/lib/utils"
import { getRandomGradient } from "@/app/lib/gradient"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Loader2, ExternalLink, ThumbsUp, MessageSquare } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { shortenPublicKey } from "@/app/lib/utils"
import { Button } from "./ui/button"
import { clusterApiUrl, Connection } from "@solana/web3.js"
import { WalletProvider } from "@solana/wallet-adapter-react"
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui"
import Image from "next/image"
import { formatTimestamp } from "@/app/lib/utils"
import "@dialectlabs/blinks/index.css"
import { Card } from "./ui/card"
import {DM_Sans} from "next/font/google"

const dmsans = DM_Sans({style: 'normal', subsets: ["latin"]});



export function Messages({
  initialMessages,
  currentUserId,
  channel,
  event,
}: { initialMessages: Message[] | ChatMessage[]; currentUserId: string; channel: string; event: string }) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const scrollDownRef = useRef<HTMLDivElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true)
  const { toast } = useToast()

  const scrollToBottom = () => {
    if (containerRef.current && shouldScrollToBottom) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }

  const addMessage = useCallback((message: Message) => {
    setMessages((prev) => {
      if (Number(message.id) > 0) {
        const optimisticIndex = prev.findIndex((m) => m.content === message.content && Number(m.id) < 0)
        if (optimisticIndex !== -1) {
          const newMessages = [...prev]
          newMessages[optimisticIndex] = message
          return newMessages
        }
      }
      return [message, ...prev]
    })
    setShouldScrollToBottom(true)
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
      setShouldScrollToBottom(isNearBottom)
    }

    container.addEventListener("scroll", handleScroll)
    return () => container.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    pusherClient.subscribe(channel)
    const messageHandler = (message: Message) => {
      addMessage(message)
    }
    pusherClient.bind(event, messageHandler)

    return () => {
      pusherClient.unsubscribe(channel)
      pusherClient.unbind(event, messageHandler)
    }
  }, [channel, event, addMessage])

  const handleStartDM = async (friendId: string | number) => {
    console.log("Starting DM with user:", friendId)

    const fid = typeof friendId === "string" ? Number(friendId) : friendId

    const res = await fetch(`/api/initiateDM`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        initiatorUserId: Number(currentUserId),
        friendId: fid,
      }),
    })
    const data = await res.json()
    if (data) {
      console.log(data)
    }
  }

  return (
    <WalletProvider wallets={[]} autoConnect>
      <WalletModalProvider>
        <div
          ref={containerRef}
          className="h-full overflow-y-auto bg-transparent backdrop-blur-sm"
        >
          <div className="flex flex-col-reverse gap-3 p-4 w-full mx-auto">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground/30" />
                <p className="text-lg text-muted-foreground">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message, index) => {
                const isCurrentUser = message.senderId == currentUserId
                const userN = message.sender;
                const betAmount = message.sender?.betAmount || '0';
                const hasNextMessageFromSameUser = index > 0 && messages[index - 1]?.senderId === message.senderId
                return (
                  <div
                    key={`${message.id}-${message.timestamp}`}
                    className={cn("group flex items-end gap-2 transition-opacity", {
                      "flex-row-reverse": isCurrentUser,
                      "bg-opacity-80 text-white hover:bg-opacity-100": !isCurrentUser,
                    })}
                  >
                    <Popover>
                      <PopoverTrigger>
                        <div className="mb-1">{userN && <UserAvatar user={userN} />}</div>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-0">
                        <Card className="overflow-hidden border-0 bg-black">
                          <div className="p-4 space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                {userN && <UserAvatar user={userN} size="large" />}
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium opacity-80 text-white">
                                    {message.sender?.username || "Unknown User"}
                                  </span>
                                  <div
                                    className="font-mono font-bold text-sm text-gray-400 hover:text-gray-200 cursor-pointer transition-colors hover:underline"
                                    onClick={() => window.open(`https://solscan.io/account/${userN?.walletPublicKey}`)}
                                  >
                                    {shortenPublicKey(
                                      userN?.walletPublicKey || "So11111111111111111111111111111111111111112",
                                    )}
                                  </div>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10"
                                onClick={() => window.open(`https://solscan.io/account/${userN?.walletPublicKey}`)}
                              >
                                View <ExternalLink className="ml-1 h-4 w-4" />
                              </Button>
                            </div>
                            <div className="space-y-1 bg-gray-800/50 rounded-lg p-3">
                              <div className="text-2xl font-bold text-emerald-400">${betAmount}</div>
                              <div className="text-sm text-gray-400">Total Amount Betted</div>
                            </div>
                            <Button
                              className="w-full bg-pink-500/10 text-pink-400 hover:bg-pink-500/20"
                            >
                              <Link href={`/bets/${userN?.walletPublicKey}`}>
                              View Bets
                              </Link>
                            </Button>
                          </div>
                        </Card>
                      </PopoverContent>
                    </Popover>
                    <MessageContainer
                      message={message}
                      isCurrentUser={isCurrentUser}
                      hasNextMessageFromSameUser={hasNextMessageFromSameUser}
                    />
                  </div>
                )
              })
            )}
            <div ref={scrollDownRef} />
          </div>
        </div>
      </WalletModalProvider>
    </WalletProvider>
  )
}

export function UserAvatar({ user, size = "default" }: { user: User; size?: "default" | "large" }) {
  const gradient = getRandomGradient(user?.id)
  const sizeClasses = size === "large" ? "w-12 h-12" : "w-8 h-8"

  return (
    <Avatar
      className={cn(
        sizeClasses,
        "ring-2 ring-offset-2 ring-offset-background transition-all",
        gradient.normal,
        "hover:scale-105 hover:ring-accent",
      )}
    >
      <AvatarImage src={user?.imageUrl || ""} alt={user?.username || "User"} />
      <AvatarFallback className="bg-gradient-to-br from-gray-800 to-gray-900">
        {user?.username?.[0]?.toUpperCase()}
      </AvatarFallback>
    </Avatar>
  )
}

const MessageContainer = ({
  message,
  isCurrentUser,
  hasNextMessageFromSameUser,
}: { message: Message; isCurrentUser: boolean; hasNextMessageFromSameUser: boolean }) => {
  const betUrlRegex = /https?:\/\/belzin\.vercel\.app\/api\/actions\/bet\?betId=[a-zA-Z0-9_-]+/
  const content = message.content || ""
  const match = content.match(betUrlRegex)

  if (match) {
    const actionUrl = match[0]
    return (
      <div
        className={cn(
          "max-w-[40%] w-full rounded-xl p-3 bg-transparent border-none relative group transition-all",
          isCurrentUser
            ? "from-[rgb(1,255,255,0.2)] to-[rgb(1,255,255,0.3)] text-emerald-50"
            : "from-gray-800/90 to-gray-900/90 text-gray-100",
          "hover:shadow-lg",
        )}
      >
        <div className="w-full overflow-hidden rounded-lg">
          <BlinkComponent actionApiUrl={actionUrl}/>
        </div>
        <div className="text-xs text-gray-400 mt-2 text-right">{formatTimestamp(Number(message.timestamp))}</div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "max-w-[70%] rounded-3xl px-4 py-2 relative group transition-all",
        isCurrentUser
          ? "bg-gradient-to-r from-[rgba(255,10,96,0.6)] to-[rgba(255,1,145,0.6)] text-white" //from-[rgb(28,155,239,0.7)]
          : "bg-[rgb(10,10,10)] text-gray-100",
        "hover:shadow-lg",
      )}
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2 py-2">
          {!isCurrentUser && <span className="text-sm font-bold opacity-80">{message.sender?.username || "Unknown User"}</span>}
        </div>
        <div className={`font-medium tracking-tight break-words whitespace-pre-wrap ${dmsans.className}`}>
          {formatMessageContent(content)}
        </div>
      </div>
      <div className="text-xs text-white/50 mt-1 text-right">{formatTimestamp(Number(message.timestamp))}</div>
    </div>
  )
}

const BlinkComponent = ({ actionApiUrl }: { actionApiUrl: string }) => {
  const { adapter } = useActionSolanaWalletAdapter(new Connection(clusterApiUrl("devnet"), "confirmed"))
  const { action, isLoading } = useAction({ url: actionApiUrl })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 h-24 bg-gray-800/50 rounded-lg p-4">
        <Loader2 className="h-5 w-5 animate-spin text-emerald-400" />
        <span className="text-emerald-400 font-medium">Loading bet details...</span>
      </div>
    )
  }

  if (!action) {
    return (
      <div className="flex items-center justify-center h-24 bg-gray-800/50 rounded-lg p-4">
        <span className="text-gray-400">Failed to load bet details</span>
      </div>
    )
  }

  return (
    <div className="w-full overflow-hidden rounded-lg border border-emerald-500/20">
      <Blink action={action} stylePreset="x-dark" adapter={adapter} securityLevel="all" />
    </div>
  )
}

const formatMessageContent = (content: string) => {
  const parts = content.split(/(@polyagent)/g)
  return parts.map((part, index) => {
    if (part === "@polyagent") {
      return (
        <span 
          key={index} 
          className="font-bold text-white glow-text hover:cursor-pointer hover:underline"
          style={{
            textShadow: "0 0 10px rgba(16, 185, 129, 0.5)"
          }}
        >
          {part}
        </span>
      )
    }
    return part
  })
}