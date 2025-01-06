import { NextResponse } from 'next/server';
import { supabase } from './lib/supabase';

export default async function middleware(req) {
  const { data: session } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.redirect(new URL('/auth', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/protected-page'], // Add paths that require auth
};
