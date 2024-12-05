import { Button } from '@/components/ui/button'
import { MessageSquare } from 'lucide-react'

export function UserProfile({ user, onStartDM }: { user: string; onStartDM: () => void }) {
  return (
    <div className="flex items-center justify-between p-2 hover:bg-accent rounded-md">
      <span>{user}</span>
      <Button variant="ghost" size="sm" onClick={onStartDM}>
        <MessageSquare className="h-4 w-4 mr-2" />
        Start DM
      </Button>
    </div>
  )
}