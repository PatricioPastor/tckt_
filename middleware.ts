import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const { pathname } = request.nextUrl;

  // Rutas de autenticación (login/signup)
  const authRoutes = ["/login", "/signup"];

  // Rutas públicas (no requieren autenticación)
  const publicRoutes = [
    "/",
    "/events",
    "/checkout",
    "/payment",
  ];

  // Rutas protegidas (requieren autenticación)
  const protectedRoutes = [
    "/dashboard",
    "/admin",
    "/scanner",
    "/tickets",
  ];

  // Helper: verifica si la ruta actual coincide con algún patrón
  const matchesRoute = (routes: string[]) => {
    return routes.some(route => {
      if (route === pathname) return true;
      // Permite subrutas (ej: /events/123, /payment/success)
      if (pathname.startsWith(route + "/")) return true;
      return false;
    });
  };

  // 1. Usuarios autenticados intentando acceder a login/signup → redirigir a events/1
  if (sessionCookie && authRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/events/1", request.url));
  }

  // 2. Rutas públicas → permitir acceso a todos (autenticados o no)
  if (matchesRoute(publicRoutes)) {
    return NextResponse.next();
  }

  // 3. Rutas de autenticación → permitir acceso a todos
  if (authRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // 4. Rutas protegidas sin autenticación → redirigir a signup
  if (!sessionCookie && matchesRoute(protectedRoutes)) {
    return NextResponse.redirect(new URL("/signup", request.url));
  }

  // 5. Todo lo demás → permitir
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Apply middleware to all routes except API routes, static files, and Next.js internals
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
