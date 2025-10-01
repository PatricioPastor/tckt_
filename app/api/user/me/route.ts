// app/api/user/me/route.ts (Endpoint API para fetch user data)

import { auth } from '@/lib/auth'; // Asume que tienes auth configurado con Better Auth
import { headers } from 'next/headers';
import prisma  from '@/lib/prisma';

export async function GET() {

  const session = await auth.api.getSession({
      headers: await headers(),
    });

  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      
      id: true,
      name: true,
      email: true,
      username: true,
      role: true,
      image: true,
      dni: true,
      birthDate: true,
      
    },
  });

  if (!user) {
    return new Response('User not found', { status: 404 });
  }

  return Response.json(user);
}