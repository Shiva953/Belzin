import { useState, useEffect } from 'react';
import { UserT } from '@/types';

export function useProfile(pubkey?: string, userId?: number | string) {
  const [profile, setProfile] = useState<UserT | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchUserProfile() {
      setLoading(true);
      setError(null);

      try {
        const numericUserId = typeof userId === 'string' ? parseInt(userId, 10) : userId;

        const res = await fetch('/api/getProfile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            pubkey: pubkey || '',
            userId: numericUserId || 0
          })
        });

        const data = await res.json();
        
        if (data.user) {
          setProfile(data.user);
        } else {
          setError(new Error('No user profile found'));
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      } finally {
        setLoading(false);
      }
    }

    if (pubkey || (userId !== undefined && userId !== null)) {
      fetchUserProfile();
    }
  }, [pubkey, userId]);

  return {
    profile,
    loading,
    error
  };
}