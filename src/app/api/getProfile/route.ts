/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth'
import prisma from '@/lib/prisma'
import { getSession } from 'next-auth/react'
import { NextApiRequest, NextApiResponse } from 'next';

// GET: Fetch user profile
// checking if exists -> return (username, pubkey) if exists

// 1. FIX SESSION BUG, CHECK CLIENT -> SERVER SESSION PERSISTENCE & USER STATE
// 2. INTEGRATE CHAT FINALLY(FIRST COMPLETE PUBLIC CHAT INTEGRATION, USE PUSHER/ABLY FOR CHAT INFRA)

export async function GET(req: NextRequest, res: NextResponse) {
  try {
    // const session = await getServerSession(authOptions);
    // const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const pubkey = searchParams.get('pubkey'); // Get public key from query parameters
    if (!pubkey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // const pubkey = session?.user?.name ?? 'CUdHPZyyuMCzBJEgTZnoopxhp9zjp1pog3Tgx2jEKP7E';
    const user = await prisma.user.findFirst({
      where: { walletPublicKey: pubkey }
    })

    if (!user) {
      return NextResponse.json({ exists: false }, { status: 200 })
    }

    return NextResponse.json({ 
      exists: true, 
      user: { 
        username: user.username, 
        walletPublicKey: user.walletPublicKey 
      } 
    }, { status: 200 })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}