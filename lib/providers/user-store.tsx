// app/components/UserProvider.tsx
'use client';

import { useEffect } from 'react';
import { useUserStore } from '@/lib/store/user-store';
import { authClient } from '@/lib/auth-client'; // Asume Better Auth setup

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession();
  const { fetchUser, user } = useUserStore();

  useEffect(() => {
    if (!isPending) {
      if (session?.user && !user) {
        // User has session but no store user - fetch user data
        fetchUser(session.user);
      } else if (!session?.user && user) {
        // User store has data but no session - clear store
        useUserStore.getState().logout();
      }
    }
  }, [isPending, session, user, fetchUser]);

  return <>{children}</>;
}