import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";

const publicPaths = ["/", "/login", "/register", "/doctors", "/api/auth"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths and static files
  if (
    publicPaths.some((p) => pathname === p || pathname.startsWith(p + "/")) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/public") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("session-token")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const user = await verifyToken(token);
  if (!user) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("session-token");
    return response;
  }

  // Role-based route protection
  if (pathname.startsWith("/admin") && user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", request.url));
  }
  if (pathname.startsWith("/doctor") && user.role !== "DOCTOR") {
    return NextResponse.redirect(new URL("/", request.url));
  }
  if (pathname.startsWith("/patient") && user.role !== "PATIENT") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Attach user info to headers for server components
  const response = NextResponse.next();
  response.headers.set("x-user-id", user.id);
  response.headers.set("x-user-role", user.role);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
