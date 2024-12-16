import { FriendT } from "@/app/conversations/page";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// each friend card shown in friends list(onclicking which you navigate to /conversation/[userId-friendId])
export function FriendCard({ friend }: { friend: FriendT }) {
    return (
      <button
        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors duration-200"
        onClick={() => console.log('Selected friend:', friend.username)}
      >
        <Avatar>
          <AvatarImage src={friend.imageUrl} alt={friend.username} />
          <AvatarFallback>{friend.username.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1 text-left">
          <div className="font-medium">{friend.username}</div>
          {friend.walletPublicKey && (
            <div className="text-xs text-muted-foreground truncate">
              {friend.walletPublicKey.slice(0, 8)}...{friend.walletPublicKey.slice(-6)}
            </div>
          )}
        </div>
      </button>
    )
  }