// app/api/user/update/route.ts - Update user profile data

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const updateUserSchema = z.object({
  dni: z.string().optional(),
  username: z.string().optional(),
  birthDate: z.string().datetime().optional(),
  name: z.string().optional(),
  imageBase64: z.string().optional(),
});

export async function PATCH(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateUserSchema.parse(body);

    // Convert birthDate string to Date if provided  
    const updateData: typeof validatedData & { birthDate?: string } = { ...validatedData };
    if (validatedData.birthDate) {
      updateData.birthDate = validatedData.birthDate;
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        image: true,
        image_base64: true,
        dni: true,
        birthDate: true,
      },
    });

    return Response.json({ success: true, user: updatedUser });

  } catch (error) {
    console.error('User update error:', error);
    
    if (error instanceof z.ZodError) {
      return Response.json(
        { success: false, error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }

    return Response.json(
      { success: false, error: 'Failed to update user' },
      { status: 500 }
    );
  }
}