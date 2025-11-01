import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { getPublishedEvents } from '@/lib/data/events';
import HomeClient from './components/home-client';

export default async function HomePage() {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session?.user) {
    redirect('/login?redirectTo=/home');
  }

  const events = await getPublishedEvents().catch(() => []);

  const userName = session.user.name || session.user.email || 'Tu cuenta';

  return (
    <HomeClient
      userName={userName}
      recommendedEvents={events.slice(0, 6)}
    />
  );
}
