/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest, res: NextResponse) {
  try {

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
      user: user 
    }, { status: 200 })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}