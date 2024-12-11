import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
    try {
      const session = await getServerSession(authOptions)
      console.log("Session: ",session);
      if (!session?.publicKey) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
  
      const { username } = await req.json()
  
      // Check if username is already taken
      const existingUser = await prisma.user.findFirst({
        where: { username }
      })
  
      if (existingUser) {
        return NextResponse.json({ error: 'Username already taken' }, { status: 400 })
      }
  
      // Create new user
      const newUser = await prisma.user.create({
        data: {
          walletPublicKey: session.publicKey,
          username,
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