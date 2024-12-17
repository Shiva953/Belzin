// containing friends[] <- userId(for given user)
// /conversations/chatId & /conversations both would contain this on the left side(30% Width)

import { FriendCard } from "./Friend";
import { FriendT } from "@/app/conversations/page";
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Search } from 'lucide-react'
import { useState } from "react"

export function FriendsList({friendList, userId} : {friendList: FriendT[], userId: string}){
    const [searchQuery, setSearchQuery] = useState("")
  
  const filteredFriends = friendList.filter(friend => 
    friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col h-[100vh] bg-background border-r">
      <div className="p-4 border-b">
        <h1 className="text-xl font-semibold mb-4">Conversations</h1>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search friends"
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredFriends.map((friend) => (
            <FriendCard key={friend.id} friend={friend} userId={userId}/>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}