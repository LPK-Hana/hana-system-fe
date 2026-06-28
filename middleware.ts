import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_COOKIE } from './lib/auth';

export function middleware(request: NextRequest) {
  const isLoggedIn = request.cookies.get(AUTH_COOKIE)?.value === '1';
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin') && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (pathname === '/login' && isLoggedIn) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  if (pathname === '/') {
    return NextResponse.redirect(new URL(isLoggedIn ? '/admin' : '/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/login', '/admin/:path*'],
};
