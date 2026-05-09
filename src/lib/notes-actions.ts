'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache';
import { getAdminSettingsCached } from '@/lib/settings';

// ─── Browse Actions ───────────────────────────────────────────────────────────

export const getNotes = unstable_cache(
  async () => {
    const adminSupabase = createAdminClient();
    const { data } = await adminSupabase
      .from('notes')
      .select('*, uploader:users!notes_uploader_id_fkey(name)')
      .order('created_at', { ascending: false });
    return data || [];
  },
  ['notes-list-v2'],
  { revalidate: 60 }
);

export const getNoteBranches = unstable_cache(
  async () => {
    const adminSupabase = createAdminClient();
    const { data } = await adminSupabase
      .from('note_branches')
      .select('*')
      .order('name', { ascending: true });
    return data || [];
  },
  ['note-branches'],
  { revalidate: 300 }
);

export const getNoteSubjects = unstable_cache(
  async (semester: number, branch: string) => {
    const adminSupabase = createAdminClient();
    const { data } = await adminSupabase
      .from('note_subjects')
      .select('*')
      .eq('semester', semester)
      .eq('branch', branch)
      .order('name', { ascending: true });
    return data || [];
  },
  ['note-subjects'],
  { revalidate: 300 }
);

export async function getAllNoteSubjects() {
  const adminSupabase = createAdminClient();
  const { data } = await adminSupabase
    .from('note_subjects')
    .select('*')
    .order('semester', { ascending: true });
  return data || [];
}

// ─── Like / Download Actions ──────────────────────────────────────────────────

export async function getUserNoteLikes(userId: string): Promise<string[]> {
  const adminSupabase = createAdminClient();
  const { data } = await adminSupabase
    .from('note_likes')
    .select('note_id')
    .eq('user_id', userId);
  return data?.map((r: any) => r.note_id) || [];
}

export async function uploadNote(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'You must be logged in to upload notes.' };

  // ── Security Guard: Maintenance/Holiday check (Bypass for staff) ────────
  const settings = await getAdminSettingsCached();
  const { data: profile } = await supabase.from('users').select('is_admin, is_employee').eq('id', user.id).single();
  const isStaff = profile?.is_admin || profile?.is_employee;

  if (!isStaff && (settings?.is_maintenance_mode || settings?.is_holiday_mode)) {
    return { error: 'Uploads are currently disabled for maintenance/holiday break.' };
  }

  // ── Security Guard: Rate Limiting (Max 5 per hour) ───────────────────────
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count: recentNotes } = await supabase
    .from('notes')
    .select('*', { count: 'exact', head: true })
    .eq('uploader_id', user.id)
    .gt('created_at', oneHourAgo);

  if (!isStaff && (recentNotes || 0) >= 5) {
    return { error: 'Upload cooldown active. Please wait an hour before uploading more files.' };
  }

  // ── Extract & sanitize ───────────────────────────────────────────────────
  const strip = (s: string) => s.replace(/<[^>]*>/g, '').trim(); // strip HTML tags

  const title   = strip((formData.get('title')   as string) || '');
  const subject = strip((formData.get('subject') as string) || '');
  const branch  = strip((formData.get('branch')  as string) || '');
  const type    = (formData.get('type') as string) || '';
  const semester = parseInt(formData.get('semester') as string);
  const is_anonymous = formData.get('is_anonymous') === 'true';
  const file = formData.get('file') as File;

  // ── Server-side validation ───────────────────────────────────────────────
  const ALLOWED_TYPES = ['notes', 'past_paper', 'reference'];

  if (!title)   return { error: 'Title is required.' };
  if (!subject) return { error: 'Subject is required.' };
  if (!branch)  return { error: 'Branch is required.' };
  if (!type || !ALLOWED_TYPES.includes(type)) return { error: 'Invalid resource type.' };
  if (!semester && semester !== 0) return { error: 'Invalid semester.' };
  if (semester < 0 || semester > 8) return { error: 'Invalid semester.' };
  if (title.length > 120)   return { error: 'Title must be under 120 characters.' };
  if (subject.length > 80)  return { error: 'Subject must be under 80 characters.' };
  if (!file || file.size === 0) return { error: 'Please attach a file.' };
  if (file.size > 50 * 1024 * 1024) return { error: 'File size must be under 50MB.' };

  // Validate file MIME type
  const ALLOWED_MIME = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/png', 'image/jpeg', 'image/webp',
  ];
  if (!ALLOWED_MIME.includes(file.type)) return { error: 'Unsupported file type. Use PDF, DOCX, or an image.' };

  // ── Upload to Google Drive (OAuth) ───────────────────────────────────────
  const driveFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID?.replace(/^'|'$/g, '');
  const clientId = process.env.GOOGLE_CLIENT_ID?.replace(/^'|'$/g, '');
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.replace(/^'|'$/g, '');
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN?.replace(/^'|'$/g, '');

  if (!driveFolderId || !clientId || !clientSecret || !refreshToken) {
    return { error: 'Google Drive OAuth credentials missing in .env.local.' };
  }

  const { google } = require('googleapis');
  const { Readable } = require('stream');

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, 'https://developers.google.com/oauthplayground');
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  const drive = google.drive({ version: 'v3', auth: oauth2Client });

  // Use direct streaming to prevent memory exhaustion and payload limits on large files
  const stream = Readable.fromWeb(file.stream() as any);

  const ext = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'pdf';
  const noteId = crypto.randomUUID();
  const fileType = file.type.startsWith('image/') ? 'image' : 'pdf';

  let driveFileId;
  let publicUrl;
  try {
    const driveRes = await drive.files.create({
      requestBody: {
        name: file.name,
        mimeType: file.type, // Explicitly set the MIME type
        parents: [driveFolderId],
      },
      media: { 
        mimeType: file.type, 
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
    return { error: `Drive Upload failed: ${uploadError.message}` };
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
    file_name: file.name.slice(0, 200), // cap filename length
    file_type: fileType,
    uploader_id: user.id,
    is_anonymous,
  });

  if (dbError) {
    await drive.files.delete({ fileId: driveFileId }).catch(() => {});
    return { error: `Failed to save: ${dbError.message}` };
  }

  revalidatePath('/notes');
  return { success: true };
}


export async function toggleNoteLike(noteId: string): Promise<{ liked: boolean; likes: number; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { liked: false, likes: 0, error: 'Login required' };

  // ── Security Guard: Maintenance/Holiday check (Bypass for staff) ────────
  const settings = await getAdminSettingsCached();
  const { data: profile } = await supabase.from('users').select('is_admin, is_employee').eq('id', user.id).single();
  const isStaff = profile?.is_admin || profile?.is_employee;

  if (!isStaff && (settings?.is_maintenance_mode || settings?.is_holiday_mode)) {
    return { liked: false, likes: 0, error: 'Interactions are disabled during maintenance/holiday break.' };
  }

  const { data: existing } = await supabase
    .from('note_likes')
    .select('note_id')
    .eq('note_id', noteId)
    .eq('user_id', user.id)
    .single();

  const { data: note } = await supabase.from('notes').select('likes').eq('id', noteId).single();
  const currentLikes = note?.likes || 0;

  if (existing) {
    await supabase.from('note_likes').delete().eq('note_id', noteId).eq('user_id', user.id);
    const newLikes = Math.max(0, currentLikes - 1);
    await supabase.from('notes').update({ likes: newLikes }).eq('id', noteId);
    revalidatePath('/notes');
    return { liked: false, likes: newLikes };
  } else {
    await supabase.from('note_likes').insert({ note_id: noteId, user_id: user.id });
    const newLikes = currentLikes + 1;
    await supabase.from('notes').update({ likes: newLikes }).eq('id', noteId);
    revalidatePath('/notes');
    return { liked: true, likes: newLikes };
  }
}

export async function incrementNoteDownloads(noteId: string) {
  // Security Guard: Authentication required to prevent analytics bot-spam
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return; 

  const adminSupabase = createAdminClient();

  // ── Security Guard: Rate Limiting (Prevent "Pop Inflation") ──────────────
  // Only increment if user hasn't downloaded this specific note in the last 10 mins
  const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const { count: recentDownload } = await adminSupabase
    .from('site_analytics')
    .select('*', { count: 'exact', head: true })
    .eq('event_type', 'NOTE_DOWNLOAD')
    .eq('metadata->>user_id', user.id)
    .eq('metadata->>note_id', noteId)
    .gt('created_at', tenMinsAgo);

  if ((recentDownload || 0) > 0) return; // Cooldown active

  const { data: note } = await adminSupabase.from('notes').select('downloads').eq('id', noteId).single();
  if (note) {
    await adminSupabase.from('notes').update({ downloads: (note.downloads || 0) + 1 }).eq('id', noteId);
    
    // Log the event for rate-limiting and audit
    await adminSupabase.from('site_analytics').insert({
      event_type: 'NOTE_DOWNLOAD',
      path: `/notes`,
      metadata: { note_id: noteId, user_id: user.id }
    });
  }
}

export async function deleteMyNote(noteId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { data: note } = await supabase.from('notes').select('file_url, uploader_id').eq('id', noteId).single();
  if (!note || note.uploader_id !== user.id) return { error: 'Not your note' };

  const urlParts = note.file_url.split('/storage/v1/object/public/notes/');
  if (urlParts[1]) {
    await supabase.storage.from('notes').remove([decodeURIComponent(urlParts[1])]);
  }

  await supabase.from('notes').delete().eq('id', noteId);
  revalidatePath('/notes');
  return { success: true };
}

// ─── Admin: Branch CRUD ───────────────────────────────────────────────────────

export async function adminAddBranch(name: string, colorClass: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { data: profile } = await supabase.from('users').select('is_admin').eq('id', user.id).single();
  if (!profile?.is_admin) return { error: 'Forbidden' };

  const cleanName = name.replace(/<[^>]*>/g, '').trim().slice(0, 50);
  if (!cleanName) return { error: 'Branch name is required.' };

  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase.from('note_branches').insert({ name: cleanName, color_class: colorClass });
  if (error) return { error: error.message };

  revalidatePath('/notes');
  revalidatePath('/admin');
  return { success: true };
}

export async function adminUpdateBranch(id: string, name: string, colorClass: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { data: profile } = await supabase.from('users').select('is_admin').eq('id', user.id).single();
  if (!profile?.is_admin) return { error: 'Forbidden' };

  const cleanName = name.replace(/<[^>]*>/g, '').trim().slice(0, 50);
  if (!cleanName) return { error: 'Branch name is required.' };

  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase.from('note_branches').update({ name: cleanName, color_class: colorClass }).eq('id', id);
  if (error) return { error: error.message };

  revalidatePath('/notes');
  revalidatePath('/admin');
  return { success: true };
}

export async function adminDeleteBranch(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { data: profile } = await supabase.from('users').select('is_admin').eq('id', user.id).single();
  if (!profile?.is_admin) return { error: 'Forbidden' };

  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase.from('note_branches').delete().eq('id', id);
  if (error) return { error: error.message };

  revalidatePath('/notes');
  revalidatePath('/admin');
  return { success: true };
}

// ─── Admin: Subject CRUD ──────────────────────────────────────────────────────

export async function adminAddSubject(name: string, semester: number, branch: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { data: profile } = await supabase.from('users').select('is_admin').eq('id', user.id).single();
  if (!profile?.is_admin) return { error: 'Forbidden' };

  const cleanName = name.replace(/<[^>]*>/g, '').trim().slice(0, 80);
  if (!cleanName) return { error: 'Subject name is required.' };
  if (semester < 0 || semester > 8) return { error: 'Invalid semester.' };

  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase.from('note_subjects').insert({ name: cleanName, semester, branch });
  if (error) return { error: error.message };

  revalidatePath('/notes');
  revalidatePath('/admin');
  return { success: true };
}

export async function adminUpdateSubject(id: string, name: string, semester: number, branch: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { data: profile } = await supabase.from('users').select('is_admin').eq('id', user.id).single();
  if (!profile?.is_admin) return { error: 'Forbidden' };

  const cleanName = name.replace(/<[^>]*>/g, '').trim().slice(0, 80);
  if (!cleanName) return { error: 'Subject name is required.' };
  if (semester < 0 || semester > 8) return { error: 'Invalid semester.' };

  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase.from('note_subjects').update({ name: cleanName, semester, branch }).eq('id', id);
  if (error) return { error: error.message };

  revalidatePath('/notes');
  revalidatePath('/admin');
  return { success: true };
}

export async function adminDeleteSubject(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { data: profile } = await supabase.from('users').select('is_admin').eq('id', user.id).single();
  if (!profile?.is_admin) return { error: 'Forbidden' };

  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase.from('note_subjects').delete().eq('id', id);
  if (error) return { error: error.message };

  revalidatePath('/notes');
  revalidatePath('/admin');
  return { success: true };
}

export async function deleteUserNote(noteId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const adminSupabase = createAdminClient();
  
  // Fetch note to verify ownership and get file details
  const { data: note } = await adminSupabase.from('notes').select('*').eq('id', noteId).single();
  if (!note) return { error: 'Note not found' };
  
  // Allow admins or the owner to delete
  const { data: profile } = await supabase.from('users').select('is_admin').eq('id', user.id).single();
  if (note.uploader_id !== user.id && !profile?.is_admin) {
    return { error: 'You do not have permission to delete this note' };
  }

  // Delete from storage
  if (note.file_url.includes('drive.google.com')) {
    // Extract ID from preview URL: https://drive.google.com/file/d/{id}/preview
    const match = note.file_url.match(/file\/d\/([^\/]+)/);
    if (match && match[1]) {
      try {
        const { google } = require('googleapis');
        const clientId = process.env.GOOGLE_CLIENT_ID?.replace(/^'|'$/g, '');
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.replace(/^'|'$/g, '');
        const refreshToken = process.env.GOOGLE_REFRESH_TOKEN?.replace(/^'|'$/g, '');

        if (clientId && clientSecret && refreshToken) {
          const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, 'https://developers.google.com/oauthplayground');
          oauth2Client.setCredentials({ refresh_token: refreshToken });
          
          const drive = google.drive({ version: 'v3', auth: oauth2Client });
          await drive.files.delete({ fileId: match[1] }).catch(() => {});
        }
      } catch (err) {
        console.error('Failed to delete from Drive:', err);
      }
    }
  } else {
    // Legacy Supabase storage deletion
    try {
      const urlObj = new URL(note.file_url);
      const pathParts = urlObj.pathname.split('/');
      // Path usually ends with notes/user_id/note_id.pdf
      const notesIndex = pathParts.indexOf('notes');
      if (notesIndex !== -1) {
        const storagePath = pathParts.slice(notesIndex + 1).map(decodeURIComponent).join('/');
        await adminSupabase.storage.from('notes').remove([storagePath]);
      }
    } catch (err) {
      console.error('Failed to delete from Supabase storage:', err);
    }
  }

  // Delete from DB
  const { error } = await adminSupabase.from('notes').delete().eq('id', noteId);
  if (error) return { error: error.message };

  revalidatePath('/notes');
  revalidatePath('/profile');
  return { success: true };
}

export async function logNoteSearch(query: string) {
  if (!query || query.length < 2) return;
  
  const adminSupabase = createAdminClient();
  const authSupabase = await createClient();
  const { data: { user } } = await authSupabase.auth.getUser();

  // Log the exact search query for analytics
  await adminSupabase.from('site_analytics').insert({
    event_type: 'NOTE_SEARCH',
    path: '/notes',
    metadata: { 
      query: query.trim(),
      user_id: user?.id || 'anonymous',
      timestamp: new Date().toISOString()
    }
  });
}
