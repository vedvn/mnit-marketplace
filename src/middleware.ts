import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { triggerWelcomeEmail, triggerAccountUnbannedEmail } from './lib/email-service'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy_anon',
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired - required for Server Components
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protect internal routes, but exclude login, static assets, etc.
  const path = request.nextUrl.pathname;
  const isProtectedPath = (
    path.startsWith('/market') ||
    path.startsWith('/sell') ||
    path.startsWith('/profile') ||
    path.startsWith('/employee') ||
    path.startsWith('/admin')
  );

  // 0. Global Mode Checks (Applies to everyone)
  const { data: settings } = await supabase.from('admin_settings').select('is_maintenance_mode, is_holiday_mode').single();
  const isMaintenance = settings?.is_maintenance_mode;
  const isHoliday = settings?.is_holiday_mode;
  
  // Critical paths that must ALWAYS be accessible
  const isCriticalPath = 
    path === '/maintenance' || 
    path === '/holiday' ||
    path === '/login' ||
    path === '/sell/mobile-capture' || 
    path.startsWith('/auth') || 
    path.startsWith('/_next') || 
    path === '/favicon.ico';

  if (!isCriticalPath) {
    // Determine if user is staff
    let isStaff = false;
    if (user) {
      const { data: profile } = await supabase
        .from('users')
        .select('is_admin, is_employee')
        .eq('id', user.id)
        .single();
      isStaff = profile?.is_admin || profile?.is_employee;
    }

    // 0a. Maintenance Redirect
    if (isMaintenance && !isStaff) {
      const url = request.nextUrl.clone();
      url.pathname = '/maintenance';
      return NextResponse.redirect(url);
    }

    // 0b. Holiday Redirect
    if (isHoliday && !isStaff) {
      const url = request.nextUrl.clone();
      url.pathname = '/holiday';
      return NextResponse.redirect(url);
    }
  }

  if (user && path !== '/banned') {
    const { data: profile } = await supabase
      .from('users')
      .select('name, is_admin, is_employee, is_banned, banned_until, welcome_email_sent, phone_number')
      .eq('id', user.id)
      .single();
    
    // 1. Banned check
    if (profile?.is_banned) {
      // Automatic Unban Logic
      if (profile.banned_until && new Date(profile.banned_until) < new Date()) {
        await supabase
          .from('users')
          .update({ is_banned: false, banned_until: null })
          .eq('id', user.id);
        
        // Trigger Unban Email (Fire and forget from Middleware)
        triggerAccountUnbannedEmail(user.email!, profile.name).catch(console.error);
        
        // Return without redirecting to /banned
      } else {
        const url = request.nextUrl.clone();
        url.pathname = '/banned';
        return NextResponse.redirect(url);
      }
    }

    // 2. Welcome email (fire once, on first login)
    if (profile && profile.welcome_email_sent === false) {
      await supabase.from('users').update({ welcome_email_sent: true }).eq('id', user.id);
      triggerWelcomeEmail(user.email!, user.user_metadata?.full_name || 'User').catch(console.error);
    }

    // 3. Profile completion gate — check if record exists in user_financials
    const { data: financials } = await supabase
      .from('user_financials')
      .select('id')
      .eq('id', user.id)
      .single();

    const profileComplete = !!financials;
    const isOnCompleteProfile = path === '/complete-profile';
    if (!profileComplete && !isOnCompleteProfile) {
      const url = request.nextUrl.clone();
      url.pathname = '/complete-profile';
      return NextResponse.redirect(url);
    }
  }

  if (isProtectedPath && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
