'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { unstable_cache } from 'next/cache';

export const getNotes = unstable_cache(
  async () => {
    const adminSupabase = createAdminClient();
    const { data } = await adminSupabase
      .from('notes')
      .select('*, uploader:users(name)')
      .order('created_at', { ascending: false });
    return data || [];
  },
  ['notes-list'],
  { revalidate: 60 }
);

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

  const title = (formData.get('title') as string)?.trim();
  const subject = (formData.get('subject') as string)?.trim();
  const branch = formData.get('branch') as string;
  const semester = parseInt(formData.get('semester') as string);
  const type = formData.get('type') as string;
  const description = (formData.get('description') as string)?.trim() || null;
  const is_anonymous = formData.get('is_anonymous') === 'true';
  const file = formData.get('file') as File;

  if (!title || !subject || !branch || !semester || !type || !file || file.size === 0) {
    return { error: 'Please fill all required fields and attach a file.' };
  }
  if (file.size > 20 * 1024 * 1024) {
    return { error: 'File size must be under 20MB.' };
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'pdf';
  const noteId = crypto.randomUUID();
  const storagePath = `${user.id}/${noteId}.${ext}`;
  const fileType = file.type.startsWith('image/') ? 'image' : 'pdf';

  const bytes = await file.arrayBuffer();
  const { error: uploadError } = await supabase.storage
    .from('notes')
    .upload(storagePath, bytes, { contentType: file.type });

  if (uploadError) return { error: `Upload failed: ${uploadError.message}` };

  const { data: { publicUrl } } = supabase.storage.from('notes').getPublicUrl(storagePath);

  const { error: dbError } = await supabase.from('notes').insert({
    id: noteId,
    title,
    description,
    subject,
    branch,
    semester,
    type,
    file_url: publicUrl,
    file_name: file.name,
    file_type: fileType,
    uploader_id: user.id,
    is_anonymous,
  });

  if (dbError) {
    await supabase.storage.from('notes').remove([storagePath]);
    return { error: `Failed to save: ${dbError.message}` };
  }

  revalidatePath('/notes');
  return { success: true };
}

export async function toggleNoteLike(noteId: string): Promise<{ liked: boolean; likes: number; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { liked: false, likes: 0, error: 'Login required' };

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
  const adminSupabase = createAdminClient();
  const { data: note } = await adminSupabase.from('notes').select('downloads').eq('id', noteId).single();
  await adminSupabase.from('notes').update({ downloads: (note?.downloads || 0) + 1 }).eq('id', noteId);
}

export async function deleteMyNote(noteId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { data: note } = await supabase.from('notes').select('file_url, uploader_id').eq('id', noteId).single();
  if (!note || note.uploader_id !== user.id) return { error: 'Not your note' };

  // Extract storage path from public URL
  const urlParts = note.file_url.split('/storage/v1/object/public/notes/');
  if (urlParts[1]) {
    await supabase.storage.from('notes').remove([decodeURIComponent(urlParts[1])]);
  }

  await supabase.from('notes').delete().eq('id', noteId);
  revalidatePath('/notes');
  return { success: true };
}
