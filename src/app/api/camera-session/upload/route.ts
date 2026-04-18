import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const sessionId = formData.get('session_id') as string;
    const file = formData.get('file') as File;

    if (!sessionId || !file) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const adminSupabase = createAdminClient();

    // Verify session
    const { data: sessionData, error: sessionError } = await adminSupabase
      .from('live_camera_sessions')
      .select('id, expires_at')
      .eq('id', sessionId)
      .single();

    if (sessionError || !sessionData) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 404 });
    }

    // Check expiration
    if (new Date(sessionData.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Session expired' }, { status: 400 });
    }

    // Upload to bucket
    const fileExt = file.name.split('.').pop() || 'jpg';
    const remoteName = `private_live_${sessionId}_${Date.now()}.${fileExt}`;

    const { error: uploadError } = await adminSupabase.storage
      .from('product-images')
      .upload(remoteName, file, {
        contentType: 'image/jpeg',
        upsert: false
      });

    if (uploadError) {
      throw uploadError;
    }

    // Get URL
    const { data: { publicUrl } } = adminSupabase.storage
      .from('product-images')
      .getPublicUrl(remoteName);

    // Update DB
    const { error: updateError } = await adminSupabase
      .from('live_camera_sessions')
      .update({ photo_url: publicUrl })
      .eq('id', sessionId);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ success: true, photoUrl: publicUrl });
  } catch (error: any) {
    console.error('Session upload error:', error);
    return NextResponse.json({ error: 'Failed to upload photo' }, { status: 500 });
  }
}
