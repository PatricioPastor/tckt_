// app/components/UserProvider.tsx
'use client';

import { useEffect } from 'react';
import { useUserStore } from '@/lib/store/user-store';
import { authClient } from '@/lib/auth-client'; // Asume Better Auth setup

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession();
  const { fetchUser, user } = useUserStore();

  useEffect(() => {
    if (!isPending && session?.user && !user) {
      fetchUser(session.user);
    }
  }, [isPending, session, user, fetchUser]);

  return <>{children}</>;
}