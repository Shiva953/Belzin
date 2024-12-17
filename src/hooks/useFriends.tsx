import { useState, useEffect } from 'react';
import { fetchProfile } from '@/app/lib/utils';
import { FriendT } from '@/app/conversations/page';

export function useFriends(pubkey: string) {
    const [friendList, setFriendList] = useState<FriendT[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchFriendsList() {
            if (!pubkey) return;

            setIsLoading(true);
            try {
                const profile = await fetchProfile(pubkey, 0);
                const id = profile?.id;

                if (!id) {
                    throw new Error('User profile not found');
                }

                const res = await fetch('/api/getFriendsForUser', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({userId: id})
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || 'Failed to fetch friends');
                }

                const { friendList } = await res.json();
                setFriendList(friendList);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
                setFriendList([]);
            } finally {
                setIsLoading(false);
            }
        }

        fetchFriendsList();
    }, [pubkey])

    return { friendList, isLoading, error };
}