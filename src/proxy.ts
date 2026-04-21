import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { triggerWelcomeEmail, triggerAccountUnbannedEmail } from './lib/email-service'

// Module-level cache: admin_settings rarely changes — avoid a DB round-trip on every request.
// Resets on cold start. In serverless, TTL is enforced explicitly below.
let _adminSettingsCache: { isMaintenance: boolean; isHoliday: boolean } | null = null;
let _adminSettingsCacheExpiry = 0;
const ADMIN_SETTINGS_TTL_MS = 30_000; // 30 seconds

export async function proxy(request: NextRequest) {
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

  // 0. Global Mode Checks — use module-level cache to avoid a DB call on every request
  let isMaintenance = false;
  let isHoliday = false;
  const now = Date.now();
  if (_adminSettingsCache && now < _adminSettingsCacheExpiry) {
    isMaintenance = _adminSettingsCache.isMaintenance;
    isHoliday = _adminSettingsCache.isHoliday;
  } else {
    const { data: settings } = await supabase.from('admin_settings').select('is_maintenance_mode, is_holiday_mode').single();
    isMaintenance = settings?.is_maintenance_mode ?? false;
    isHoliday = settings?.is_holiday_mode ?? false;
    _adminSettingsCache = { isMaintenance, isHoliday };
    _adminSettingsCacheExpiry = now + ADMIN_SETTINGS_TTL_MS;
  }
  
  // Critical paths that must ALWAYS be accessible
  const isCriticalPath = 
    path === '/maintenance' || 
    path === '/holiday' ||
    path === '/login' ||
    path === '/sell/mobile-capture' || 
    path.startsWith('/auth') || 
    path.startsWith('/_next') || 
    path === '/favicon.ico';

  // For unauthenticated users: redirect to maintenance/holiday immediately (no staff check possible)
  if (!user && !isCriticalPath) {
    if (isMaintenance) {
      const url = request.nextUrl.clone();
      url.pathname = '/maintenance';
      return NextResponse.redirect(url);
    }
    if (isHoliday) {
      const url = request.nextUrl.clone();
      url.pathname = '/holiday';
      return NextResponse.redirect(url);
    }
  }

  if (user && path !== '/banned') {
    // Single combined query — was previously 2 separate .from('users') calls
    const { data: profile } = await supabase
      .from('users')
      .select('name, is_admin, is_employee, is_banned, banned_until, welcome_email_sent, phone_number')
      .eq('id', user.id)
      .single();

    // Also check staff role from the same profile object
    const isStaff = profile?.is_admin || profile?.is_employee;

    // Re-check maintenance/holiday for staff bypass (uses already-fetched data)
    if (!isCriticalPath) {
      if (isMaintenance && !isStaff) {
        const url = request.nextUrl.clone();
        url.pathname = '/maintenance';
        return NextResponse.redirect(url);
      }
      if (isHoliday && !isStaff) {
        const url = request.nextUrl.clone();
        url.pathname = '/holiday';
        return NextResponse.redirect(url);
      }
    }

    if (profile?.is_banned) {
      // Automatic Unban Logic
      if (profile.banned_until && new Date(profile.banned_until) < new Date()) {
        await supabase
          .from('users')
          .update({ is_banned: false, banned_until: null })
          .eq('id', user.id);
        
        // Trigger Unban Email (Fire and forget from Proxy)
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

    // 3. Institutional Profile Gates
    // We liquid-smoothly defer Banking details until listing, but professionally require Phone at start.
    const { data: financials } = await supabase
      .from('user_financials')
      .select('phone_number, upi_id, bank_account_number')
      .eq('id', user.id)
      .single();

    const hasPhone = !!financials?.phone_number;
    const hasBanking = !!(financials?.upi_id || financials?.bank_account_number);
    const isOnCompleteProfile = path === '/complete-profile';
    const isSellingPath = path.startsWith('/sell');

    // Global Contact Gate: Redirect if no phone (except on critical paths or /complete-profile)
    if (!hasPhone && !isOnCompleteProfile) {
      const url = request.nextUrl.clone();
      url.pathname = '/complete-profile';
      return NextResponse.redirect(url);
    }

    // High-Performance Selling Gate: Redirect to finish banking metadata only when listing
    if (isSellingPath && !hasBanking && !isOnCompleteProfile) {
      const url = request.nextUrl.clone();
      url.pathname = '/complete-profile';
      // We pass a query param to professionally personalize the onboarding intent
      url.searchParams.set('intent', 'sell');
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
