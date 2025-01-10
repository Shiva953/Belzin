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
import { Popover,PopoverContent,PopoverTrigger } from './ui/popover';
import { ChevronDown, ExternalLink, Copy } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {toast} from 'sonner';
import { shortenPublicKey } from '@/app/lib/utils';
import { clusterApiUrl, Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { UserProfileProps } from '@/types';

export function UserProfile({ user, onSignOut }: UserProfileProps) {
  const [copied, setCopied] = useState<boolean>(false)
  const [solAmount, setSolAmount] = useState<string>('0')

  const copyToClipboard = () => {
    if (user?.walletPublicKey) {
      navigator.clipboard.writeText(user.walletPublicKey)
      setCopied(true)
      toast.success("Copied Wallet Address")
      setTimeout(() => setCopied(false), 2000)
    }
  }

  useEffect(() => {
    const getSolBalance = async (wallet: PublicKey) => {
      const balanceInLamports = await connection.getBalance(wallet);
      const solBalance = balanceInLamports/LAMPORTS_PER_SOL
      setSolAmount(solBalance.toFixed(2));
    }
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    const wallet = new PublicKey(user.walletPublicKey);
    getSolBalance(wallet)
  }, [user.walletPublicKey])


  return (
    <div className="flex items-center justify-between space-x-4 p-2 rounded-lg shadow-sm">
      <Popover>
        <PopoverTrigger asChild>
          <div className="flex items-center space-x-2 cursor-pointer">
            <Avatar>
              <AvatarImage src={user.imageUrl} alt={user.username} />
              <AvatarFallback>{user.username?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="font-extrabold text-base tracking-tight my-auto">
              {user.username || 'InvalidUser'}
            </span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0">
          <div className="flex flex-col bg-black rounded-lg overflow-hidden">
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Avatar>
                    <AvatarImage src={user.imageUrl} alt={user.username} />
                  </Avatar>
                  <div className="font-mono text-[1rem] font-bold tracking-tight cursor-pointer hover:underline glow-effect-text-large opacity-80 hover:opacity-100" onClick={() => window.open(`https://solscan.io/account/${user?.walletPublicKey}`)}>
                    {shortenPublicKey(user?.walletPublicKey || 'So11111111111111111111111111111111111111112')}
                   </div>
                </div>
                <Button size="sm" className="text-[rgb(81,252,161)] bg-[rgb(10,46,27)] hover:bg-[rgb(5,21,12)] hover:text-[rgb(78,241,154)]" onClick={() => window.open(`https://solscan.io/account/${user?.walletPublicKey}`)}>
                 Account<ExternalLink/>
                </Button>
              </div>
              
              <div className="space-y-1">
                <div className="text-3xl font-bold">{solAmount} SOL</div>
                <div className="text-sm text-gray-400">BALANCE</div>
              </div>

              <Button className="bg-[rgb(46,10,23)] text-[rgb(236,72,153)] w-full rounded-xl">
                View Your Bets
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {user.walletPublicKey && (
              <Button
                variant="outline"
                size="default"
                className="font-mono text-sm font-bold rounded-xl"
                onClick={copyToClipboard}
              >
                {shortenPublicKey(user.walletPublicKey)}
                <Copy className="ml-2 h-3 w-3" />
              </Button>
            )}
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