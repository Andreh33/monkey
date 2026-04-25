import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
      if (!token || token.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/admin/login", req.url));
      }
    }
    if (pathname.startsWith("/cuenta") && !token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true,
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/cuenta/:path*"],
};
