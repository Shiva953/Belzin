/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button'
import { MessageSquare } from 'lucide-react'
import { useSession } from 'next-auth/react';

type UserT = {
  username: string,
  walletPublicKey: string
}

export function UserProfile({ user }: { user: UserT|null}) {
  return (
    //modify to be more dynamic, add wallet address button(right) + PFP(avatar + [username](dropdown)left) 
    <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white">
              {user?.username?.[0]?.toUpperCase() || ''}
          </div>
        <span className="font-medium">{user?.username || 'Invalid User'}</span>
      </div>
  )
}

interface CreateUserProfileProps {
  pubkey: string,
  onProfileCreated?: () => void
}

export default function CreateUserProfile({ pubkey, onProfileCreated }: CreateUserProfileProps) {
  const [username, setUsername] = useState('')
  const [error, setError] = useState<string | null>(null)
  // const { data: session } = useSession()

  const handleCreateProfile = async () => {
    // Validation
    if (!username.trim()) {
      setError('Username cannot be empty')
      return
    }

    try {
      const response = await fetch('/api/createProfile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username, 
          walletPublicKey: pubkey
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