/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useState, useEffect } from 'react';
import { uploadImage } from '@/app/lib/utils';
import { motion } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { useWallet } from '@solana/wallet-adapter-react';
import { X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Popover,PopoverContent,PopoverTrigger } from './ui/popover';
import { Copy, ExternalLink, LogOut } from "lucide-react"
import { toast } from 'sonner';
import { shortenPublicKey } from '@/app/lib/utils';
import { clusterApiUrl, Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { UserProfileProps } from '@/types';

export function UserProfile({ user, onSignOut }: UserProfileProps) {
  const [copied, setCopied] = useState<boolean>(false)
  const [solAmount, setSolAmount] = useState<string>("0")
  const wallet = useWallet()

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
      const connection = new Connection(clusterApiUrl("devnet"), "confirmed")
      const balanceInLamports = await connection.getBalance(wallet)
      const solBalance = balanceInLamports / LAMPORTS_PER_SOL
      setSolAmount(solBalance.toFixed(2))
    }

    if (wallet.publicKey) {
      getSolBalance(wallet.publicKey)
    }
  }, [wallet.publicKey])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8 ring-2 ring-teal-500/70 ring-offset-2 ring-offset-background transition-all">
            <AvatarImage src={user.imageUrl} alt={user.username} />
            <AvatarFallback>{user.username?.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <div className="flex flex-col space-y-4 p-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.imageUrl} />
              <AvatarFallback>{user.username?.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold">{user.username}</h4>
              <p className="text-xs text-muted-foreground">{shortenPublicKey(user.walletPublicKey)}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 rounded-md bg-secondary p-4">
            <div>
              <p className="text-sm font-medium leading-none">Balance</p>
              <p className="text-xl font-bold">{solAmount} SOL</p>
            </div>
            <Button size="sm" className="ml-auto">
              Add Funds
            </Button>
          </div>
          <div className="flex flex-col space-y-2">
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => window.open(`https://solscan.io/account/${user.walletPublicKey}`)}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              View on Solscan
            </Button>
            <Button variant="outline" className="justify-start" onClick={copyToClipboard}>
              <Copy className="mr-2 h-4 w-4" />
              {copied ? "Copied!" : "Copy Address"}
            </Button>
            <Button variant="outline" className="justify-start text-destructive" onClick={onSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {'image/*': []},
    onDrop: (acceptedFiles) => {
      setImage(acceptedFiles[0])
    }
  })

  const handleCreateProfile = async () => {
    if (!username.trim()) {
      setError('Username cannot be empty')
      return
    }
  
    setIsLoading(true)
    let finalImageUrl = imageUrl
  
    try {
      if (image) {
        try {
          finalImageUrl = await uploadImage(image)
          setImageUrl(finalImageUrl)
        } catch (error) {
          toast.error('Failed to upload image')
          setIsLoading(false)
          return
        }
      }
  
      const response = await fetch('/api/createProfile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username, 
          walletPublicKey: pubkey,
          imageUrl: finalImageUrl
        }),
      })
  
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create profile')
      }
  
      onProfileCreated?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
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
                      <AvatarImage src={imageUrl} alt="Profile" />
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