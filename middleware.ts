import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const { pathname } = request.nextUrl;

  // 🔒 Rutas de autenticación (login/signup - signup redirige a login)
  const authRoutes = ["/login", "/signup"];

  // 🌐 Rutas públicas (no requieren autenticación)
  const publicRoutes = [
    "/",
    "/events", // Permitir ver eventos sin login (guest browsing)
  ];

  // 🔐 Rutas protegidas (requieren autenticación)
  const protectedRoutes = [
    "/checkout",
    "/payment",
    "/dashboard",
    "/admin",
    "/scanner",
    "/tickets",
  ];

  // 🚫 Si accede a /not_found → redirigir a /login
  if (pathname === "/not_found") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Helper para comparar rutas (soporta subrutas: /events/123, /payment/success, etc.)
  const matchesRoute = (routes: string[]) => {
    return routes.some((route) => pathname === route || pathname.startsWith(route + "/"));
  };

  // 1️⃣ Si el usuario ya está autenticado y va a login/signup → redirigir a home
  if (sessionCookie && authRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 2️⃣ Rutas públicas → acceso libre
  if (matchesRoute(publicRoutes)) {
    return NextResponse.next();
  }

  // 3️⃣ Rutas de autenticación → acceso libre (login y signup)
  if (authRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // 4️⃣ Rutas protegidas sin autenticación → redirigir a login (tab signup)
  if (!sessionCookie && matchesRoute(protectedRoutes)) {
    const loginUrl = new URL("/login?tab=signup", request.url);
    // Preservar la URL original para redirigir después del login
    loginUrl.searchParams.set("redirectTo", pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  // 5️⃣ Todo lo demás → permitir
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Aplica el middleware a todas las rutas excepto API, estáticos e internos de Next.js
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
