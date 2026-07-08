import { NextRequest, NextResponse } from "next/server";
import { getSessionRoleFromPayload, verifyTokenEdge } from "@/lib/jwt-edge";
import {
  ADMIN_HUB_PATH,
  GURU_ALLOWED_PATH_PREFIXES,
  isAdminAllowedPath,
  isGuruAllowedAdminPath,
  isShachouAllowedPath,
} from "@/lib/roles";

const TOKEN_COOKIE = "auth_token";

const PUBLIC_PATHS = ["/", "/api/showcase", "/api/cv-example"];
const ADMIN_PREFIX = "/admin-dashboard";
const STUDENT_PREFIX = "/student-dashboard";
const GURU_PREFIX = "/guru-dashboard";
const SHACHOU_PREFIX = "/super-admin";

const SENSITIVE_STATIC_PREFIXES = [
  "/static/ktp/",
  "/static/kk/",
  "/static/hasil_mcu/",
  "/static/ijazah/",
  "/static/akte_kelahiran/",
  "/static/sertifikat/",
];

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`) || pathname.startsWith(`${p}?`),
  );
}

function isSensitiveStaticPath(pathname: string): boolean {
  return SENSITIVE_STATIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function withNoHtmlCache(response: NextResponse): NextResponse {
  response.headers.set(
    "Cache-Control",
    "private, no-cache, no-store, must-revalidate, max-age=0",
  );
  return response;
}

function nextWithPathname(request: NextRequest, pathname: string) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);
  return withNoHtmlCache(
    NextResponse.next({
      request: { headers: requestHeaders },
    }),
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin" || pathname.startsWith("/admin/pemberkasan")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.startsWith("/admin/pemberkasan")
      ? pathname.replace("/admin/pemberkasan", "/admin-dashboard/pemberkasan")
      : ADMIN_HUB_PATH;
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (isSensitiveStaticPath(pathname)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(TOKEN_COOKIE)?.value ?? "";
  const isDemoBuild = process.env.NEXT_PUBLIC_DEMO_MODE === "1";
  const demoRoleCookie = request.cookies.get("auth_role")?.value ?? "";
  const demoRoles = ["admin", "student", "guest", "superadmin", "guru"] as const;
  const demoRole = demoRoles.find((r) => r === demoRoleCookie) ?? null;

  const auth = !isDemoBuild && token ? await verifyTokenEdge(token) : null;
  const jwtRole: "admin" | "student" | "guest" | "superadmin" | "guru" | "" = auth
    ? getSessionRoleFromPayload(auth)
    : "";
  const role = jwtRole || (isDemoBuild ? demoRole : null) || "";
  const hasSession = isDemoBuild ? !!demoRole : !!auth;

  if (isPublic(pathname)) {
    return nextWithPathname(request, pathname);
  }

  if (!hasSession) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/";
    loginUrl.search = "";
    return NextResponse.redirect(loginUrl);
  }

  if (role === "guest") {
    if (!pathname.startsWith("/cust-page")) {
      const url = request.nextUrl.clone();
      url.pathname = "/cust-page";
      url.search = "";
      return NextResponse.redirect(url);
    }
    return nextWithPathname(request, pathname);
  }

  if (role === "superadmin") {
    if (isShachouAllowedPath(pathname)) {
      return nextWithPathname(request, pathname);
    }
    const url = request.nextUrl.clone();
    url.pathname = SHACHOU_PREFIX;
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (role === "guru") {
    if (isGuruAllowedAdminPath(pathname)) {
      return nextWithPathname(request, pathname);
    }
    const url = request.nextUrl.clone();
    url.pathname = "/guru-dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/cust-page")) {
    const url = request.nextUrl.clone();
    url.pathname = role === "admin" ? ADMIN_HUB_PATH : STUDENT_PREFIX;
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith(SHACHOU_PREFIX)) {
    const url = request.nextUrl.clone();
    url.pathname = role === "admin" ? ADMIN_HUB_PATH : STUDENT_PREFIX;
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith(GURU_PREFIX)) {
    const url = request.nextUrl.clone();
    url.pathname = role === "admin" ? ADMIN_HUB_PATH : STUDENT_PREFIX;
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith(ADMIN_PREFIX) && role === "admin") {
    if (!isAdminAllowedPath(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = ADMIN_HUB_PATH;
      url.search = "";
      return NextResponse.redirect(url);
    }
    return nextWithPathname(request, pathname);
  }

  if (pathname.startsWith(ADMIN_PREFIX) && role !== "admin") {
    const url = request.nextUrl.clone();
    url.pathname = STUDENT_PREFIX;
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith(STUDENT_PREFIX) && role === "admin") {
    const url = request.nextUrl.clone();
    url.pathname = ADMIN_HUB_PATH;
    url.search = "";
    return NextResponse.redirect(url);
  }

  return nextWithPathname(request, pathname);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
