import { user as PrismaUser } from '@prisma/client';

/**
 * Representa el subconjunto de datos del usuario que está disponible
 * en el objeto de sesión del lado del cliente.
 */
export type SessionUser = Pick<
  PrismaUser,
  'id' | 'name' | 'email' | 'image'
>;
