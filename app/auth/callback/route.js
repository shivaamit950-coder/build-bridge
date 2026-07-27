import { NextResponse } from 'next/server';

   export async function GET(request) {
     const { searchParams } = new URL(request.url);
     const code = searchParams.get('code');
     const next = searchParams.get('next') || '/';

     // Supabase automatically creates the session when code is present
     // Just redirect to the destination page
     if (code) {
       return NextResponse.redirect(new URL(next, request.url));
     }

     // No code = auth failed, redirect to home with error
     return NextResponse.redirect(new URL('/?error=auth_failed', request.url));
   }
