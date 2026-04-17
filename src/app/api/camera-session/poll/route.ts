import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing session ID' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('live_camera_sessions')
      .select('photo_url')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({ photoUrl: data.photo_url });
  } catch (error: any) {
    console.error('Session poll error:', error);
    return NextResponse.json({ error: 'Failed to poll camera session' }, { status: 500 });
  }
}
