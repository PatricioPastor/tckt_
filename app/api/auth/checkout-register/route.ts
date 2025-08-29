// app/api/auth/checkout-register/route.ts - Simplified registration for checkout flow

import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { headers } from 'next/headers';

const checkoutRegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  dni: z.string().min(7),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, dni } = checkoutRegisterSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return Response.json(
        { success: false, error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Register user using Better Auth
    const signUpResult = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
      returnHeaders:true,
      headers: await headers(),
    });

    if (!signUpResult) {
      return Response.json(
        { success: false, error: 'Registration failed' },
        { status: 500 }
      );
    }

    // Get the newly created user and update with DNI
    const newUser = await prisma.user.findUnique({
      where: { email },
    });

    if (newUser) {
      await prisma.user.update({
        where: { id: newUser.id },
        data: { dni },
      });
    }

    // Auto-sign in the user
    const signInResult = await auth.api.signInEmail({
      body: {
        email,
        password,
        rememberMe: true,
      },
      headers: await headers(),
    });

    if (!signInResult) {
      return Response.json(
        { success: false, error: 'Auto login failed' },
        { status: 500 }
      );
    }

    // Return successful response
    return Response.json({
      success: true,
      message: 'Registration successful',
      user: {
        id: newUser?.id,
        name: newUser?.name,
        email: newUser?.email,
        dni: newUser?.dni,
      },
    });

  } catch (error) {
    console.error('Checkout registration error:', error);
    
    if (error instanceof z.ZodError) {
      return Response.json(
        { success: false, error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }

    return Response.json(
      { success: false, error: 'Registration failed' },
      { status: 500 }
    );
  }
}