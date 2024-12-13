// chat popup(common in both DM and public GC), should supports blinks(unfurl + tx)
import { useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

export default function ChatInterface(){
    useEffect(() => {
        socket.connect();
    }, [])
}