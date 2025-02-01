/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
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
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                   (process.env.NODE_ENV === 'development' 
                    ? 'http://localhost:3000' 
                    : 'https://belzin.vercel.app');

    const response = await fetch(`${baseUrl}/api/betsForUser`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        userAddress: user.walletPublicKey || ''
      }),
    })
    const betsForGivenUser = await response.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const totalBetVolume = betsForGivenUser.reduce((total: number, bet: any) => total + bet.betAmount, 0) || 0;
    const totalBetAmount = totalBetVolume.toFixed(2);
    
    //this should be updated when the user places a bet, instead of fetching it while fetching the profile
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        betAmount: totalBetAmount,
      }
    })

    return NextResponse.json({ 
      exists: true, 
      user: user 
    }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}