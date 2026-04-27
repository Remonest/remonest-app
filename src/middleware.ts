import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Routes that require authentication.
const PROTECTED_PATHS = [
  "/dashboard",
  "/settings",
  "/profile",
  "/admin",
];

// Routes that should never be processed by this middleware (static assets, etc.).
const PUBLIC_ASSETS = ["/_next/", "/favicon.ico"];
const EXTENSION_REGEX = /\.(png|jpg|jpeg|svg|gif|webp|ico|css|js)$/i;

function isProtected(pathname: string): boolean {
  return PROTECTED_PATHS.some((path) => 
    pathname === path || pathname.startsWith(`${path}/`)
  );
}

function isPublicAsset(pathname: string): boolean {
  return (
    PUBLIC_ASSETS.some((asset) => pathname.startsWith(asset)) ||
    EXTENSION_REGEX.test(pathname)
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Skip middleware for static assets (Fastest path)
  if (isPublicAsset(pathname)) {
    return NextResponse.next();
  }

  // 2. Skip middleware for specific public API routes
  if (pathname.startsWith("/api/webhook") || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // 3. Skip session refresh for prefetch requests (Vercel optimization)
  if (request.headers.get("x-middleware-prefetch")) {
    return NextResponse.next();
  }

  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isProtectedRoute = isProtected(pathname);

  // 4. Only perform session check if it's a protected route or an auth page.
  // This saves a network call for the landing page and other public pages.
  if (isProtectedRoute || isAuthPage) {
    const { response, user } = await updateSession(request);

    // If protected and not logged in -> redirect to login
    if (isProtectedRoute && !user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);

      const redirectResponse = NextResponse.redirect(loginUrl);
      redirectResponse.cookies.set("redirect_after_login", pathname, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 5,
        path: "/",
      });
      return redirectResponse;
    }

    // If auth page and already logged in -> redirect to dashboard
    if (isAuthPage && user) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return response;
  }

  // For all other public pages, just continue without session check
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (SSR assets)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
