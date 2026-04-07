import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const ACCESS_COOKIE_NAME = "opengym_access_token";

const authRoutes = new Set(["/login", "/register"]);
const protectedPrefixes = ["/", "/workouts", "/history", "/profile", "/exercises"];

function isProtectedRoute(pathname: string) {
  return protectedPrefixes.some((prefix) => {
    if (prefix === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(prefix);
  });
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const accessToken = request.cookies.get(ACCESS_COOKIE_NAME)?.value;

  if (!accessToken && isProtectedRoute(pathname)) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (accessToken && authRoutes.has(pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/register",
    "/workouts/:path*",
    "/history/:path*",
    "/profile/:path*",
    "/exercises/:path*",
  ],
};
