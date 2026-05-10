import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

function secret() {
  return new TextEncoder().encode(process.env.JWT_SECRET ?? "")
}

async function tokenType(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, secret())
    return typeof payload.type === "string" ? payload.type : null
  } catch {
    return null
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/seller")) {
    const token = request.cookies.get("seller_session")?.value
    if (!token || (await tokenType(token)) !== "seller") {
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }
  }

  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const token = request.cookies.get("admin_session")?.value
    if (!token || (await tokenType(token)) !== "admin") {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/seller/:path*", "/admin/:path*"],
}
