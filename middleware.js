import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { PUBLIC_ROUTES, LOGIN, ROOT } from "@/lib/routes";

// Chỉ định sử dụng Node.js runtime thay vì Edge runtime
export const runtime = "nodejs";

export async function middleware(request) {
  const { nextUrl } = request;

  // Auth middleware
  const session = await auth();
  const isAuthenticated = !!session?.user;

  const isPublicRoute =
    PUBLIC_ROUTES.some((route) => nextUrl.pathname.startsWith(route)) ||
    nextUrl.pathname === ROOT;

  if (!isAuthenticated && !isPublicRoute) {
    return NextResponse.redirect(new URL(LOGIN, nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/auth|_next|favicon.ico|.*\\..*).*)", "/api/:path*", "/"],
};
