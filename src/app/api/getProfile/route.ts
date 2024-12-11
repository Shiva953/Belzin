import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth'
import prisma from '@/lib/prisma'

// GET: Fetch user profile
// checking if exists -> return (username, pubkey) if exists
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.publicKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { walletPublicKey: session.publicKey ?? 'CUdHPZyyuMCzBJEgTZnoopxhp9zjp1pog3Tgx2jEKP7E' }
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