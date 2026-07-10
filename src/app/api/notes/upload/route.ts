import { createClient } from '@/lib/supabase/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { getAdminSettingsCached } from '@/lib/settings';

// Route Handlers configure maxDuration individually in App Router
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'You must be logged in to upload notes.' }, { status: 401 });

    // ── Security Guard: Maintenance/Holiday check (Bypass for staff) ────────
    const settings = await getAdminSettingsCached();
    const { data: profile } = await supabase.from('users').select('is_admin, is_employee').eq('id', user.id).single();
    const isStaff = profile?.is_admin || profile?.is_employee;

    if (!isStaff && (settings?.is_maintenance_mode || settings?.is_holiday_mode)) {
      return NextResponse.json({ error: 'Uploads are currently disabled for maintenance/holiday break.' }, { status: 503 });
    }

    // ── Security Guard: Rate Limiting (Max 5 per hour) ───────────────────────
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count: recentNotes } = await supabase
      .from('notes')
      .select('*', { count: 'exact', head: true })
      .eq('uploader_id', user.id)
      .gt('created_at', oneHourAgo);

    if (!isStaff && (recentNotes || 0) >= 5) {
      return NextResponse.json({ error: 'Upload cooldown active. Please wait an hour before uploading more files.' }, { status: 429 });
    }

    // ── Extract Metadata from Headers ────────────────────────────────────────
    const getHeader = (name: string) => decodeURIComponent(request.headers.get(name) || '');
    
    const title = getHeader('x-note-title');
    const subject = getHeader('x-note-subject');
    const branch = getHeader('x-note-branch');
    const type = getHeader('x-note-type');
    const semester = parseInt(getHeader('x-note-semester') || '0', 10);
    const isAnonymous = getHeader('x-note-anonymous') === 'true';
    const fileName = getHeader('x-file-name');
    const mimeType = request.headers.get('content-type') || 'application/octet-stream';
    const contentLength = parseInt(request.headers.get('content-length') || '0', 10);

    // ── Server-side validation ───────────────────────────────────────────────
    const ALLOWED_TYPES = ['notes', 'past_paper', 'reference'];

    if (!title)   return NextResponse.json({ error: 'Title is required.' });
    if (!subject) return NextResponse.json({ error: 'Subject is required.' });
    if (!branch)  return NextResponse.json({ error: 'Branch is required.' });
    if (!type || !ALLOWED_TYPES.includes(type)) return NextResponse.json({ error: 'Invalid resource type.' });
    if (semester < 0 || semester > 8) return NextResponse.json({ error: 'Invalid semester.' });
    if (title.length > 120)   return NextResponse.json({ error: 'Title must be under 120 characters.' });
    if (subject.length > 80)  return NextResponse.json({ error: 'Subject must be under 80 characters.' });
    if (!request.body) return NextResponse.json({ error: 'Please attach a file.' });
    if (contentLength > 50 * 1024 * 1024) return NextResponse.json({ error: 'File size must be under 50MB.' });

    const ALLOWED_MIME = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/png', 'image/jpeg', 'image/webp',
    ];
    if (!ALLOWED_MIME.includes(mimeType)) return NextResponse.json({ error: 'Unsupported file type. Use PDF, DOCX, or an image.' });

    // ── Upload to Google Drive (OAuth) ───────────────────────────────────────
    const driveFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID?.replace(/^'|'$/g, '');
    const clientId = process.env.GOOGLE_CLIENT_ID?.replace(/^'|'$/g, '');
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.replace(/^'|'$/g, '');
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN?.replace(/^'|'$/g, '');

    if (!driveFolderId || !clientId || !clientSecret || !refreshToken) {
      console.error('Note upload: Google Drive OAuth credentials are not configured in environment variables.');
      return NextResponse.json({ error: 'File storage is not configured. Please contact support.' });
    }

    const { google } = require('googleapis');
    const { Readable } = require('stream');

    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, 'https://developers.google.com/oauthplayground');
    oauth2Client.setCredentials({ refresh_token: refreshToken });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    // Direct stream from the NextRequest raw body to Google Drive
    const stream = Readable.fromWeb(request.body as any);

    const ext = fileName.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'pdf';
    const noteId = crypto.randomUUID();
    const fileType = mimeType.startsWith('image/') ? 'image' : 'pdf';

    let driveFileId;
    let publicUrl;
    try {
      const driveRes = await drive.files.create({
        requestBody: {
          name: fileName,
          mimeType: mimeType,
          parents: [driveFolderId],
        },
        media: { 
          mimeType: mimeType, 
          body: stream 
        },
        fields: 'id',
      });
      driveFileId = driveRes.data.id;
      
      // Ensure file is publicly readable
      await drive.permissions.create({
        fileId: driveFileId,
        requestBody: { role: 'reader', type: 'anyone' },
      });

      publicUrl = `https://drive.google.com/file/d/${driveFileId}/preview`;
    } catch (uploadError: any) {
      return NextResponse.json({ error: `Drive Upload failed: ${uploadError.message}` });
    }

    // ── Insert DB record ─────────────────────────────────────────────────────
    const { error: dbError } = await supabase.from('notes').insert({
      id: noteId,
      title,
      subject,
      branch,
      semester,
      type,
      file_url: publicUrl,
      file_name: fileName.slice(0, 200),
      file_type: fileType,
      uploader_id: user.id,
      is_anonymous: isAnonymous,
    });

    if (dbError) {
      console.error('Note upload DB error:', dbError.message);
      await drive.files.delete({ fileId: driveFileId }).catch(() => {});
      return NextResponse.json({ error: 'Failed to save note. Please try again.' });
    }

    revalidatePath('/notes');
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Note upload error:', err);
    return NextResponse.json({ 
      error: 'Upload failed. Please try again or contact support.',
    }, { status: 500 });
  }
}
