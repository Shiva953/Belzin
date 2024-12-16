/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, ExternalLink, Copy } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
// import { SignOutButton } from "./sign-out-button"


export interface UserT {
  username: string,
  walletPublicKey: string
  imageUrl: string
}

interface UserProfileProps {
  user: UserT
  onSignOut: () => void
}

export function UserProfile({ user, onSignOut }: UserProfileProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    if (user?.walletPublicKey) {
      navigator.clipboard.writeText(user.walletPublicKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }


  return (
    //modify to be more dynamic, add wallet address button(right) + PFP(avatar + [username](dropdown)left) 
    // <div className="flex items-center space-x-4">
    //       <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white">
    //           {user?.username?.[0]?.toUpperCase() || ''}
    //       </div>
    //     <span className="font-medium">{user?.username || 'Invalid User'}</span>
    //   </div>
    <div className="flex items-center justify-between space-x-4 bg-background p-2 rounded-lg shadow-sm">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="p-0 hover:bg-transparent">
            <div className="flex items-center space-x-2">
              <Avatar>
                <AvatarImage src={user.imageUrl} alt={user.username} />
                <AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="font-bold tracking-wide">{user.username || 'InvalidUser'}</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem>
            <ExternalLink className="mr-2 h-4 w-4" />
            <span>View Account</span>
          </DropdownMenuItem>
          {/* <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <SignOutButton onSignOut={onSignOut} />
          </DropdownMenuItem> */}
        </DropdownMenuContent>
      </DropdownMenu>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {user.walletPublicKey && (<Button
              variant="outline"
              size="sm"
              className="font-mono text-xs"
              onClick={copyToClipboard}
            >
              {user.walletPublicKey.slice(0, 4)}...{user.walletPublicKey.slice(-4)}
              <Copy className="ml-2 h-3 w-3" />
            </Button>)}
          </TooltipTrigger>
          <TooltipContent>
            <p>{copied ? 'Copied!' : 'Copy wallet address'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
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
  const [image,setImage] = useState<File|null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState<string>('')

  useEffect(() => {
      if(image){
        const url = URL.createObjectURL(image);
        setImageUrl(url)
      }
  }, [image])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {'image/*': []},
    onDrop: (acceptedFiles) => {
      setImage(acceptedFiles[0])
    }
  })

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
          walletPublicKey: pubkey,
          imageUrl: imageUrl
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Profile</CardTitle>
          <CardDescription>Create your profile before entering the chat</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete='off'
              />
            </div>
            <div className="space-y-2">
              <Label>Profile Picture</Label>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                  isDragActive ? 'border-primary' : 'border-muted-foreground'
                }`}
              >
                <input {...getInputProps()} />
                {image ? (
                  <div className="flex items-center justify-center">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src={URL.createObjectURL(image)} alt="Profile" />
                      <AvatarFallback>
                        {username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-2"
                      onClick={(e) => {
                        e.stopPropagation()
                        setImage(null)
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <p>{isDragActive ? 'Drop the image here' : 'Drag & drop an image here, or click to select'}</p>
                )}
              </div>
            </div>
            {error && (
              <p className="text-destructive text-sm">{error}</p>
            )}
            <Button
              className="w-full"
              onClick={handleCreateProfile}
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Profile'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}