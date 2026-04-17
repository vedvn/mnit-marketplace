import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('live_camera_sessions')
      .insert({ user_id: user.id })
      .select('id')
      .single();

    if (error || !data) {
      throw error || new Error('No data returned');
    }

    return NextResponse.json({ sessionId: data.id });
  } catch (error: any) {
    console.error('Session create error:', error);
    return NextResponse.json({ error: 'Failed to create camera session' }, { status: 500 });
  }
}
