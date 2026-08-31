import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { checkRateLimit } from "./lib/security";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // 1. Enforce HTTPS redirect for insecure requests in production
  const proto = request.headers.get("x-forwarded-proto");
  if (proto === "http" && process.env.NODE_ENV === "production") {
    const httpsUrl = new URL(request.url);
    httpsUrl.protocol = "https:";
    return NextResponse.redirect(httpsUrl, 301);
  }

  // 2. Rate Limiting for API Endpoints
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    const { allowed, remaining } = checkRateLimit(clientIp, 100, 60000);

    response.headers.set("X-RateLimit-Limit", "100");
    response.headers.set("X-RateLimit-Remaining", remaining.toString());

    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Rate limit exceeded. Please wait a minute." },
        { status: 429, headers: response.headers }
      );
    }
  }

  // 3. Security Response Headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), browsing-topics=()"
  );

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
