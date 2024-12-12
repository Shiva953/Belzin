/* eslint-disable @typescript-eslint/no-unused-vars */
// this is a protected route
// ONLY WHEN USER WALLET IS AUTHENTICATED THIS USER PROFILE ROUTE SHOULD BE CALLED

import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/lib/auth";

// type User = {
//     id: string,
//     walletPublicKey: string,
//     username: string
//     created_at: Date
// }

export const GET = async (req: NextApiRequest, res: NextApiResponse) => {

    const session = await getServerSession(authOptions);
    return NextResponse.json({ message: 'If you see this, you are authenticated!', session: session }, { status: 200 });
}