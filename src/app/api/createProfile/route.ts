/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest, res: NextResponse) {
    try {
      const { username, walletPublicKey, imageUrl } = await req.json();

      if(!username || !walletPublicKey){
        return NextResponse.json({error: 'Invalid Username/PublicKey'}, {status: 400});
      }
      
      // Check if username is already taken
      const existingUser = await prisma.user.findFirst({
        where: { username }
      })
  
      if (existingUser) {
        return NextResponse.json({ error: 'Username already taken' }, { status: 400 })
      }
  
      // const walletPublicKey = session?.user?.name ?? 'CUdHPZyyuMCzBJEgTZnoopxhp9zjp1pog3Tgx2jEKP7E'
      // Create new user
      const newUser = await prisma.user.create({
        data: {
          walletPublicKey: walletPublicKey || 'CUdHPZyyuMCzBJEgTZnoopxhp9zjp1pog3Tgx2jEKP7E',
          username,
          imageUrl: imageUrl || ''
        }
      })
  
      return NextResponse.json({ 
        user: { 
          username: newUser.username, 
          walletPublicKey: newUser.walletPublicKey 
        } 
      }, { status: 201 })
    } catch (error) {
      console.error('Error creating user profile:', error)
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
  }