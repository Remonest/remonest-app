import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Routes that require authentication.
const PROTECTED_PATHS = [
  "/dashboard",
  "/dashboard/(.*)",
  "/settings",
  "/settings/(.*)",
  "/profile",
  "/profile/(.*)",
];

// Routes that should never be processed by this middleware (static assets, etc.).
const PUBLIC_PATHS = [
  "/api/webhook(.*)",
  "/api/auth(.*)",
  "/auth/callback",
  "/_next/(.*)",
  "/favicon.ico",
  "/(.*)\\.(png|jpg|jpeg|svg|gif|webp|ico|css|js)$",
];

function isProtected(pathname: string): boolean {
  return PROTECTED_PATHS.some((pattern) => {
    const regex = new RegExp(`^${pattern}$`);
    return regex.test(pathname);
  });
}

function isPublicAsset(pathname: string): boolean {
  return PUBLIC_PATHS.some((pattern) => {
    const regex = new RegExp(`^${pattern}$`);
    return regex.test(pathname);
  });
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static assets and public paths.
  if (isPublicAsset(pathname)) {
    return NextResponse.next();
  }

  // Refresh session and get cookies set properly.
  const { response, user } = await updateSession(request);

  // If the route is protected and user is not authenticated, redirect to login.
  if (isProtected(pathname) && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);

    // Store redirect target in cookie so server action can read it
    const redirectResponse = NextResponse.redirect(loginUrl);
    redirectResponse.cookies.set("redirect_after_login", pathname, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 5, // 5 minutes
      path: "/",
    });
    return redirectResponse;
  }

  // If user is authenticated but trying login/register, redirect to dashboard.
  if (user && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
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
