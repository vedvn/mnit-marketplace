import { getNotes, getUserNoteLikes } from '@/lib/notes-actions';
import { createClient } from '@/lib/supabase/server';
import { Metadata } from 'next';
import NotesGrid from './NotesGrid';

export const metadata: Metadata = {
  title: 'Notes Hub',
  description: 'Free study material, notes, past papers and assignments shared by MNIT Jaipur students.',
};

export default async function NotesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [notes, userLikedNotes] = await Promise.all([
    getNotes(),
    user ? getUserNoteLikes(user.id) : Promise.resolve([]),
  ]);

  return (
    <div className="min-h-screen pt-24 pb-16 px-6 max-w-7xl mx-auto">
      <NotesGrid
        initialNotes={notes as any}
        userLikedNotes={userLikedNotes}
        isLoggedIn={!!user}
      />
    </div>
  );
}
