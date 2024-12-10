// this is a protected route
// ONLY WHEN USER WALLET IS AUTHENTICATED THIS USER PROFILE ROUTE SHOULD BE CALLED

import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

// type User = {
//     id: string,
//     walletPublicKey: string,
//     username: string
//     created_at: Date
// }

const secret = process.env.NEXTAUTH_SECRET;

export default async function GET(req: NextRequest){
    const token = await getToken({ req, secret });

    if (!token || !token.sub){
        return NextResponse.json({ success: false, error: 'User wallet NOT AUTHENTICATED' }, { status: 500 });
    }

    if (token) {

        // all the USER SESSION CHECKING IN DB -> [IF USER EXISTS]db fetching logic

        return NextResponse.json({
            success: true,
            message: "User Wallet Authentication Successful"
        }, {status: 200})
    }

    return NextResponse.json({
        success: false,
        error: 'You must be signed in with your Solana Wallet to view the protected content on this page.'
    },  {status: 402})
}

