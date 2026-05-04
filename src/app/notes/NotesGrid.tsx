'use client';

import { useState, useMemo } from 'react';
import { ThumbsUp, Download, BookOpen, Search, Upload, FileText, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { toggleNoteLike, incrementNoteDownloads } from '@/lib/notes-actions';
import DocumentReaderModal from '@/components/DocumentReaderModal';
import { NOTE_BRANCHES, NOTE_TYPES, BRANCH_COLORS, TYPE_COLORS } from '@/lib/constants/notes';

type Note = {
  id: string;
  title: string;
  description: string | null;
  subject: string;
  branch: string;
  semester: number;
  type: string;
  file_url: string;
  file_name: string;
  file_type: string;
  is_anonymous: boolean;
  likes: number;
  downloads: number;
  created_at: string;
  uploader: { name: string } | null;
};

export default function NotesGrid({
  initialNotes,
  userLikedNotes,
  isLoggedIn,
}: {
  initialNotes: Note[];
  userLikedNotes: string[];
  isLoggedIn: boolean;
}) {
  const [search, setSearch] = useState('');
  const [branch, setBranch] = useState('ALL');
  const [semester, setSemester] = useState(0);
  const [type, setType] = useState('ALL');
  const [openNote, setOpenNote] = useState<Note | null>(null);
  const [likedSet, setLikedSet] = useState<Set<string>>(new Set(userLikedNotes));
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>(
    Object.fromEntries(initialNotes.map(n => [n.id, n.likes]))
  );
  const [likeLoading, setLikeLoading] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return initialNotes.filter(n => {
      if (branch !== 'ALL' && n.branch !== branch) return false;
      if (semester !== 0 && n.semester !== semester) return false;
      if (type !== 'ALL' && n.type !== type) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!n.title.toLowerCase().includes(q) && !n.subject.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [initialNotes, branch, semester, type, search]);

  async function handleLike(e: React.MouseEvent, noteId: string) {
    e.stopPropagation();
    if (!isLoggedIn) { alert('Please login to like notes.'); return; }
    if (likeLoading) return;
    setLikeLoading(noteId);

    // Optimistic update
    const wasLiked = likedSet.has(noteId);
    setLikedSet(prev => {
      const next = new Set(prev);
      wasLiked ? next.delete(noteId) : next.add(noteId);
      return next;
    });
    setLikeCounts(prev => ({ ...prev, [noteId]: (prev[noteId] || 0) + (wasLiked ? -1 : 1) }));

    const result = await toggleNoteLike(noteId);
    if (result.error) {
      // Revert on error
      setLikedSet(prev => { const next = new Set(prev); wasLiked ? next.add(noteId) : next.delete(noteId); return next; });
      setLikeCounts(prev => ({ ...prev, [noteId]: result.likes }));
    } else {
      setLikeCounts(prev => ({ ...prev, [noteId]: result.likes }));
    }
    setLikeLoading(null);
  }

  async function handleDownload(e: React.MouseEvent, note: Note) {
    e.stopPropagation();
    incrementNoteDownloads(note.id);
    const a = document.createElement('a');
    a.href = note.file_url;
    a.download = note.file_name;
    a.target = '_blank';
    a.click();
  }

  return (
    <>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <h1 className="text-5xl sm:text-6xl display-title uppercase mb-2">Notes.</h1>
          <p className="mono-subtitle">Free study material shared by MNIT students</p>
        </div>
        {isLoggedIn ? (
          <Link
            href="/notes/upload"
            className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-primary-900 transition-colors self-start"
          >
            <Upload className="w-4 h-4" /> Share Notes
          </Link>
        ) : (
          <Link href="/login" className="px-6 py-3 bg-foreground/5 text-foreground font-bold text-xs uppercase tracking-widest hover:bg-foreground/10 transition-colors self-start border border-black/10">
            Login to Upload
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="space-y-4 mb-8">
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
          <input
            type="text"
            placeholder="Search by title or subject..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-foreground/5 border border-black/5 rounded-xl text-sm outline-none focus:border-primary-500 transition-colors"
          />
        </div>

        {/* Branch Tabs */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setBranch('ALL')}
            className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border ${branch === 'ALL' ? 'bg-primary-600 text-white border-primary-600' : 'bg-foreground/5 text-foreground/50 border-transparent hover:border-black/10'}`}
          >
            All
          </button>
          {NOTE_BRANCHES.map(b => (
            <button
              key={b}
              onClick={() => setBranch(b)}
              className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border ${branch === b ? 'bg-primary-600 text-white border-primary-600' : 'bg-foreground/5 text-foreground/50 border-transparent hover:border-black/10'}`}
            >
              {b}
            </button>
          ))}
        </div>

        {/* Semester + Type */}
        <div className="flex flex-wrap gap-3">
          <select
            value={semester}
            onChange={e => setSemester(parseInt(e.target.value))}
            className="px-4 py-2 bg-foreground/5 border border-black/5 rounded-xl text-xs font-bold uppercase tracking-wider outline-none focus:border-primary-500 transition-colors"
          >
            <option value={0}>All Semesters</option>
            {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
          </select>
          <select
            value={type}
            onChange={e => setType(e.target.value)}
            className="px-4 py-2 bg-foreground/5 border border-black/5 rounded-xl text-xs font-bold uppercase tracking-wider outline-none focus:border-primary-500 transition-colors"
          >
            <option value="ALL">All Types</option>
            {Object.entries(NOTE_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-2 mb-6 text-[11px] text-foreground/40 font-bold uppercase tracking-widest">
        <FileText className="w-3.5 h-3.5" />
        <span>{filtered.length} {filtered.length === 1 ? 'note' : 'notes'} found</span>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="py-24 flex flex-col items-center justify-center text-center glass-card rounded-2xl border border-black/5">
          <GraduationCap className="w-12 h-12 text-foreground/10 mb-4" />
          <p className="text-foreground/40 font-bold uppercase tracking-widest text-sm">No notes found</p>
          <p className="text-foreground/30 text-xs mt-1">Try adjusting your filters or be the first to share!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(note => {
            const liked = likedSet.has(note.id);
            const likes = likeCounts[note.id] ?? note.likes;
            return (
              <div
                key={note.id}
                onClick={() => setOpenNote(note)}
                className="glass-card rounded-2xl border border-black/5 p-5 flex flex-col gap-4 cursor-pointer hover:border-primary-500/30 hover:shadow-lg transition-all duration-200 group"
              >
                {/* Badges */}
                <div className="flex flex-wrap gap-1.5">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${BRANCH_COLORS[note.branch] || 'bg-foreground/5 text-foreground/50'}`}>
                    {note.branch}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${TYPE_COLORS[note.type] || 'bg-foreground/5 text-foreground/50'}`}>
                    {NOTE_TYPES[note.type as keyof typeof NOTE_TYPES] || note.type}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest bg-foreground/5 text-foreground/40">
                    Sem {note.semester}
                  </span>
                </div>

                {/* Title & Subject */}
                <div className="flex-1">
                  <h3 className="font-bold text-base leading-snug mb-1 group-hover:text-primary-600 transition-colors line-clamp-2">
                    {note.title}
                  </h3>
                  <p className="text-xs text-foreground/50 font-medium line-clamp-1">{note.subject}</p>
                  {note.description && (
                    <p className="text-xs text-foreground/40 mt-2 line-clamp-2 leading-relaxed">{note.description}</p>
                  )}
                </div>

                {/* Uploader + date */}
                <div className="flex items-center justify-between text-[10px] text-foreground/30 font-bold uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    {note.is_anonymous ? 'Anonymous' : (note.uploader?.name || 'Unknown')}
                  </span>
                  <span>{new Date(note.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-black/5" onClick={e => e.stopPropagation()}>
                  {/* Like */}
                  <button
                    onClick={e => handleLike(e, note.id)}
                    disabled={likeLoading === note.id}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-bold transition-all ${liked ? 'bg-primary-500/15 text-primary-600' : 'bg-foreground/5 text-foreground/40 hover:bg-primary-500/10 hover:text-primary-500'}`}
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${liked ? 'fill-primary-500' : ''}`} />
                    {likes}
                  </button>

                  {/* Download count */}
                  <span className="flex items-center gap-1 text-[10px] text-foreground/30 font-bold px-2">
                    <Download className="w-3 h-3" />
                    {note.downloads}
                  </span>

                  {/* Download button */}
                  <button
                    onClick={e => handleDownload(e, note)}
                    className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-600 text-white text-[10px] font-bold hover:bg-primary-700 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Document Reader Modal */}
      {openNote && (
        <DocumentReaderModal note={openNote} onClose={() => setOpenNote(null)} />
      )}
    </>
  );
}
