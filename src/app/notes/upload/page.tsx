import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import NoteUploadForm from './NoteUploadForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Share Notes',
  description: 'Upload and share your notes, past papers, and assignments with MNIT students for free.',
};

export default async function NoteUploadPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return (
    <div className="min-h-screen pt-24 pb-16 px-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <Link href="/notes" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-foreground/40 hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Notes
        </Link>
        <h1 className="text-4xl font-bold tracking-tight mb-2">Share Notes</h1>
        <p className="text-foreground/50 text-sm">Help your fellow students — upload your notes, past papers, or assignments for free.</p>
      </div>
      <NoteUploadForm />
    </div>
  );
}
