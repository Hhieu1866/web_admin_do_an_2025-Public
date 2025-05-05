import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";
import { PUBLIC_ROUTES, LOGIN, ROOT } from "@/lib/routes";
import { corsHeaders, preflightHeaders } from "@/lib/cors";

const { auth } = NextAuth(authConfig);

// Middleware xử lý CORS cho API routes
function corsMiddleware(req) {
  const { nextUrl } = req;

  // Chỉ áp dụng CORS cho các API routes
  if (nextUrl.pathname.startsWith("/api/")) {
    // Xử lý CORS preflight (OPTIONS request)
    if (req.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 200,
        headers: preflightHeaders,
      });
    }

    // Thêm CORS headers vào response
    const response = NextResponse.next();
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  }

  // Không phải API route, tiếp tục xử lý bình thường
  return null;
}

export default auth((req) => {
  const { nextUrl } = req;

  // Xử lý CORS trước
  const corsResponse = corsMiddleware(req);
  if (corsResponse) return corsResponse;

  // Xử lý authentication
  const isAuthenticated = !!req.auth;

  const isPublicRoute =
    PUBLIC_ROUTES.some((route) => nextUrl.pathname.startsWith(route)) ||
    nextUrl.pathname === ROOT;

  if (!isAuthenticated && !isPublicRoute) {
    return NextResponse.redirect(new URL(LOGIN, nextUrl));
  }
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api/auth|_next|favicon.ico|.*\\..*).*)", // Loại trừ NextAuth và các route nội bộ của Next.js
    "/api/:path*", // Thêm tất cả API routes để xử lý CORS
    "/", // Bao gồm route gốc
  ],
};
