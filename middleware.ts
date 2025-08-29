import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const { pathname } = request.nextUrl;

  // Define authentication routes that don't require authentication check
  const authRoutes = ["/login", "/signup"];

  // Redirect authenticated users away from login/signup pages
  if (sessionCookie && authRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Redirect ALL unauthenticated users to signup (except those already on auth pages)
  if (!sessionCookie && !authRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/signup", request.url));
  }

  // Allow authenticated users and auth pages
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Apply middleware to all routes except API routes, static files, and Next.js internals
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
