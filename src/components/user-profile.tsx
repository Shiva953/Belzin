'use client'

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button'
import { MessageSquare } from 'lucide-react'
import { useSession } from 'next-auth/react';

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

interface CreateUserProfileProps {
  onProfileCreated?: () => void
}

export default function CreateUserProfile({ onProfileCreated }: CreateUserProfileProps) {
  const [username, setUsername] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { data: session } = useSession()

  const handleCreateProfile = async () => {
    // Validation
    if (!username.trim()) {
      setError('Username cannot be empty')
      return
    }

    if (!session?.publicKey) {
      setError('No wallet connected')
      return
    }

    try {
      const response = await fetch('/api/userProfile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username, 
          walletPublicKey: session.publicKey 
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create profile')
      }

      // Profile created successfully
      onProfileCreated?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-96">
        <h2 className="text-xl font-bold mb-4">Create Your Profile</h2>
        <input 
          type="text" 
          placeholder="Choose a username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />
        {error && (
          <p className="text-red-500 mb-4">{error}</p>
        )}
        <button 
          onClick={handleCreateProfile}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Create Profile
        </button>
      </div>
    </div>
  )
}