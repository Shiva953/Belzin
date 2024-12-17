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

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    // const session = await getServerSession(authOptions);
    // const session = await getServerSession(authOptions);
    // const { searchParams } = new URL(req.url);
    // const pubkey = searchParams.get('pubkey'); // Get public key from query parameters

    const {pubkey, userId} = await req.json();

    if (!pubkey && !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    let user;
    if (pubkey && !userId) {
      user = await prisma.user.findFirst({
        where: { walletPublicKey: pubkey },
      });
    } else if (!pubkey && userId) {
      user = await prisma.user.findFirst({
        where: { id: userId },
      });
    } else {
      return NextResponse.json({ error: 'Invalid request: Provide either pubkey or userId' }, { status: 400 });
    }

    if (!user) {
      return NextResponse.json({ exists: false }, { status: 200 })
    }

    return NextResponse.json({ 
      exists: true, 
      user: { 
        id: user.id,
        username: user.username, 
        walletPublicKey: user.walletPublicKey,
        imageUrl: user.imageUrl
      } 
    }, { status: 200 })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}