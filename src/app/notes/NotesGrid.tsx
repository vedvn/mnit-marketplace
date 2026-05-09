'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import {
  ThumbsUp, Download, BookOpen, Upload, FileText,
  Search, X, ChevronDown, SlidersHorizontal, ChevronLeft, ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { toggleNoteLike, incrementNoteDownloads, logNoteSearch } from '@/lib/notes-actions';
import DocumentReaderModal from '@/components/DocumentReaderModal';
import { NOTE_TYPES, TYPE_COLORS } from '@/lib/constants/notes';
import { useNotification } from '@/components/ui/NotificationProvider';

const NOTES_PER_PAGE = 12;

type Note = {
  id: string; title: string; description: string | null; subject: string;
  branch: string; semester: number; type: string; file_url: string;
  file_name: string; file_type: string; is_anonymous: boolean;
  likes: number; downloads: number; created_at: string;
  uploader: { name: string } | null;
};

type Branch = { id: string; name: string; color_class: string };
type ResourceType = 'notes' | 'past_paper' | 'reference';

const SEMESTER_OPTIONS = [
  { label: '1st Year', semesters: [1] },
  { label: '3rd Sem', semesters: [3] },
  { label: '4th Sem', semesters: [4] },
  { label: '5th Sem', semesters: [5] },
  { label: '6th Sem', semesters: [6] },
  { label: '7th Sem', semesters: [7] },
  { label: '8th Sem', semesters: [8] },
];

const RESOURCE_OPTIONS: { key: ResourceType; label: string; emoji: string }[] = [
  { key: 'past_paper', label: 'PYPs', emoji: '📝' },
  { key: 'notes', label: 'Notes', emoji: '📖' },
  { key: 'reference', label: 'Books', emoji: '📚' },
];

// ─── Filter Chip ──────────────────────────────────────────────────────────────

function Chip({
  active, onClick, children,
}: {
  active: boolean; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all border whitespace-nowrap
        ${active
          ? 'bg-primary-600 text-white border-primary-600 shadow-sm shadow-primary-600/20'
          : 'bg-foreground/4 text-foreground/50 border-transparent hover:border-black/10 hover:bg-foreground/8'
        }`}
    >
      {children}
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function NotesGrid({
  initialNotes, userLikedNotes, isLoggedIn, branches,
}: {
  initialNotes: Note[]; userLikedNotes: string[]; isLoggedIn: boolean; branches: Branch[];
}) {
  const { showToast } = useNotification();
  // ── Filter state ────────────────────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [selectedSemesters, setSelectedSemesters] = useState<number[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<ResourceType | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false); // collapsed on mobile by default

  // ── Pagination state ────────────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const gridRef = useRef<HTMLDivElement>(null);

  // ── Notes interaction state ─────────────────────────────────────────────
  const [openNote, setOpenNote] = useState<Note | null>(null);
  const [likedSet, setLikedSet] = useState<Set<string>>(new Set(userLikedNotes));
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>(
    Object.fromEntries(initialNotes.map(n => [n.id, n.likes]))
  );
  const [likeLoading, setLikeLoading] = useState<string | null>(null);

  // ── Detect desktop for auto-expanding filters ───────────────────────────
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    setFiltersOpen(mq.matches);
    const handler = (e: MediaQueryListEvent) => setFiltersOpen(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // ── Active filter count (for mobile badge) ──────────────────────────────
  const activeFilterCount =
    (selectedSemesters.length > 0 ? 1 : 0) +
    (selectedBranch ? 1 : 0) +
    (selectedType ? 1 : 0);

  // ── Search Logging (Debounced) ──────────────────────────────────────────
  useEffect(() => {
    if (!search || search.length < 3) return;

    // Respect cookie consent choices
    const persistentConsent = localStorage.getItem('mnit_cookie_consent');
    const sessionConsent = sessionStorage.getItem('mnit_cookie_session_consent');
    
    if (persistentConsent === 'accepted_necessary' || sessionConsent === 'accepted_necessary') return;

    const timer = setTimeout(() => {
      logNoteSearch(search);
    }, 1500); // Wait 1.5s after typing before logging
    return () => clearTimeout(timer);
  }, [search]);

  // ── Ranking & Filtering ─────────────────────────────────────────────────
  const filteredNotes = useMemo(() => {
    const scored = initialNotes.map(n => {
      let score = 0;
      let isMatch = true;

      // 1. Text Matching Score
      if (search) {
        const q = search.toLowerCase();
        const titleMatch = n.title.toLowerCase().includes(q);
        const subjectMatch = n.subject.toLowerCase().includes(q);
        const branchMatch = n.branch.toLowerCase().includes(q);
        const uploaderMatch = !n.is_anonymous && n.uploader?.name?.toLowerCase().includes(q);

        if (titleMatch || subjectMatch || branchMatch || uploaderMatch) {
          if (titleMatch) score += 100;
          if (subjectMatch) score += 50;
          if (branchMatch) score += 20;
          if (uploaderMatch) score += 10;
          
          // Bonus for exact starts-with match
          if (n.title.toLowerCase().startsWith(q)) score += 50;
        } else {
          isMatch = false;
        }
      }

      // 2. Global Popularity Score (Normalized)
      // We add a base popularity score so even without search, they are ranked
      score += (n.likes * 2) + n.downloads;

      // 3. Hard Filters (Semester, Branch, Type)
      if (selectedSemesters.length > 0 && !selectedSemesters.includes(n.semester)) isMatch = false;
      if (selectedBranch && n.branch !== selectedBranch) isMatch = false;
      if (selectedType && n.type !== selectedType) isMatch = false;

      return { note: n, score, isMatch };
    });

    return scored
      .filter(item => item.isMatch)
      .sort((a, b) => b.score - a.score)
      .map(item => item.note);
  }, [initialNotes, search, selectedSemesters, selectedBranch, selectedType]);

  // ── Pagination ──────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filteredNotes.length / NOTES_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedNotes = filteredNotes.slice(
    (safePage - 1) * NOTES_PER_PAGE,
    safePage * NOTES_PER_PAGE
  );

  // Reset page when filters change
  useEffect(() => { setCurrentPage(1); }, [search, selectedSemesters, selectedBranch, selectedType]);

  function goToPage(p: number) {
    const target = Math.max(1, Math.min(p, totalPages));
    setCurrentPage(target);
    gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ── Semester toggle helper ──────────────────────────────────────────────
  function toggleSemester(sems: number[]) {
    setSelectedSemesters(prev => {
      const key = sems.join(',');
      const prevKey = prev.join(',');
      // Toggle off if same selection
      if (prevKey === key) return [];
      return sems;
    });
  }

  // ── Clear all filters ──────────────────────────────────────────────────
  function clearFilters() {
    setSearch('');
    setSelectedSemesters([]);
    setSelectedBranch(null);
    setSelectedType(null);
  }

  const hasAnyFilter = search || selectedSemesters.length > 0 || selectedBranch || selectedType;

  // ── Like / Download handlers (unchanged) ────────────────────────────────
  async function handleLike(e: React.MouseEvent, noteId: string) {
    e.stopPropagation();
    if (!isLoggedIn) { showToast('Please login to like notes.', 'info'); return; }
    if (likeLoading) return;
    setLikeLoading(noteId);
    const wasLiked = likedSet.has(noteId);
    setLikedSet(prev => { const n = new Set(prev); wasLiked ? n.delete(noteId) : n.add(noteId); return n; });
    setLikeCounts(prev => ({ ...prev, [noteId]: (prev[noteId] || 0) + (wasLiked ? -1 : 1) }));
    const result = await toggleNoteLike(noteId);
    if (result.error) {
      setLikedSet(prev => { const n = new Set(prev); wasLiked ? n.add(noteId) : n.delete(noteId); return n; });
    }
    setLikeCounts(prev => ({ ...prev, [noteId]: result.likes }));
    setLikeLoading(null);
  }

  async function handleDownload(e: React.MouseEvent, note: Note) {
    e.stopPropagation();
    incrementNoteDownloads(note.id);
    
    const isDriveUrl = note.file_url.includes('drive.google.com');
    const downloadUrl = isDriveUrl
      ? note.file_url.replace('/preview', '').replace('https://drive.google.com/file/d/', 'https://drive.google.com/uc?export=download&id=')
      : note.file_url;

    const a = document.createElement('a');
    a.href = downloadUrl; 
    if (!isDriveUrl) a.download = note.file_name; 
    a.target = '_blank'; 
    a.click();
  }

  return (
    <>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4">
        <div>
          <h1 className="text-5xl sm:text-6xl display-title uppercase mb-2">Notes.</h1>
          <p className="mono-subtitle">Free study material shared by MNIT students</p>
        </div>
        {isLoggedIn ? (
          <Link href="/notes/upload" className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-primary-900 transition-colors self-start">
            <Upload className="w-4 h-4" /> Share Notes
          </Link>
        ) : (
          <Link href="/login" className="px-6 py-3 bg-foreground/5 text-foreground font-bold text-xs uppercase tracking-widest hover:bg-foreground/10 transition-colors self-start border border-black/10">
            Login to Upload
          </Link>
        )}
      </div>

      {/* ── Search Bar ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30 pointer-events-none" />
          <input
            id="notes-search"
            type="text"
            placeholder="Search by title, subject, branch, or uploader..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-10 py-3.5 bg-foreground/4 border border-black/5 rounded-2xl text-sm outline-none focus:border-primary-500 focus:bg-foreground/2 transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-foreground/10 text-foreground/30 transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter toggle — always visible */}
        <button
          onClick={() => setFiltersOpen(v => !v)}
          className={`flex items-center gap-2 px-5 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all border shrink-0 self-start
            ${filtersOpen
              ? 'bg-primary-600 text-white border-primary-600'
              : 'bg-foreground/4 text-foreground/50 border-transparent hover:border-black/10'
            }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {activeFilterCount > 0 && !filtersOpen && (
            <span className="ml-1 w-5 h-5 rounded-full bg-primary-600 text-white text-[10px] font-black flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* ── Filter Chips Panel ──────────────────────────────────────────── */}
      {filtersOpen && (
        <div className="glass-card rounded-2xl border border-black/5 p-4 sm:p-5 mb-6 animate-in fade-in slide-in-from-top-2 duration-200 space-y-4">
          {/* Semester row */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-2 block">Semester</span>
            <div className="flex flex-wrap gap-2">
              {SEMESTER_OPTIONS.map(s => (
                <Chip
                  key={s.label}
                  active={s.semesters.join(',') === selectedSemesters.join(',')}
                  onClick={() => toggleSemester(s.semesters)}
                >
                  {s.label}
                </Chip>
              ))}
            </div>
          </div>

          {/* Branch row */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-2 block">Branch</span>
            <div className="flex flex-wrap gap-2">
              {branches.map(b => (
                <Chip
                  key={b.id}
                  active={selectedBranch === b.name}
                  onClick={() => setSelectedBranch(prev => prev === b.name ? null : b.name)}
                >
                  {b.name}
                </Chip>
              ))}
            </div>
          </div>

          {/* Resource type row */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-2 block">Type</span>
            <div className="flex flex-wrap gap-2">
              {RESOURCE_OPTIONS.map(r => (
                <Chip
                  key={r.key}
                  active={selectedType === r.key}
                  onClick={() => setSelectedType(prev => prev === r.key ? null : r.key)}
                >
                  {r.emoji} {r.label}
                </Chip>
              ))}
            </div>
          </div>

          {/* Clear all */}
          {hasAnyFilter && (
            <button onClick={clearFilters} className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors pt-1">
              <X className="w-3 h-3" /> Clear all filters
            </button>
          )}
        </div>
      )}

      {/* ── Active filter tags (visible when panel collapsed) ───────────── */}
      {!filtersOpen && hasAnyFilter && (
        <div className="flex flex-wrap items-center gap-2 mb-5">
          {selectedSemesters.length > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-500/10 text-primary-700 text-[10px] font-bold uppercase tracking-wider">
              {SEMESTER_OPTIONS.find(s => s.semesters.join(',') === selectedSemesters.join(','))?.label}
              <button onClick={() => setSelectedSemesters([])} className="hover:text-primary-900"><X className="w-3 h-3" /></button>
            </span>
          )}
          {selectedBranch && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-500/10 text-primary-700 text-[10px] font-bold uppercase tracking-wider">
              {selectedBranch}
              <button onClick={() => setSelectedBranch(null)} className="hover:text-primary-900"><X className="w-3 h-3" /></button>
            </span>
          )}
          {selectedType && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-500/10 text-primary-700 text-[10px] font-bold uppercase tracking-wider">
              {RESOURCE_OPTIONS.find(r => r.key === selectedType)?.emoji} {RESOURCE_OPTIONS.find(r => r.key === selectedType)?.label}
              <button onClick={() => setSelectedType(null)} className="hover:text-primary-900"><X className="w-3 h-3" /></button>
            </span>
          )}
          <button onClick={clearFilters} className="text-[10px] font-bold text-foreground/30 hover:text-red-500 transition-colors uppercase tracking-wider">
            Clear all
          </button>
        </div>
      )}

      {/* ── Results count ───────────────────────────────────────────────── */}
      <div ref={gridRef} className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-[11px] text-foreground/40 font-bold uppercase tracking-widest">
          <FileText className="w-3.5 h-3.5" />
          <span>
            {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'}
            {hasAnyFilter ? ' matched' : ' available'}
          </span>
        </div>
        {totalPages > 1 && (
          <span className="text-[11px] text-foreground/30 font-bold uppercase tracking-widest">
            Page {safePage} of {totalPages}
          </span>
        )}
      </div>

      {/* ── Notes Grid ──────────────────────────────────────────────────── */}
      {paginatedNotes.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center glass-card rounded-2xl border border-black/5">
          <BookOpen className="w-12 h-12 text-foreground/10 mb-4" />
          <p className="text-foreground/40 font-bold uppercase tracking-widest text-sm">
            {hasAnyFilter ? 'No notes match your filters' : 'No notes uploaded yet'}
          </p>
          <p className="text-foreground/30 text-xs mt-1">
            {hasAnyFilter ? 'Try broadening your search or removing filters.' : 'Be the first to share study material!'}
          </p>
          <div className="flex items-center gap-3 mt-5">
            {hasAnyFilter && (
              <button onClick={clearFilters} className="px-5 py-2.5 rounded-xl bg-foreground/5 text-foreground/50 text-xs font-bold uppercase tracking-widest hover:bg-foreground/10 transition-colors">
                Clear Filters
              </button>
            )}
            {isLoggedIn && (
              <Link href="/notes/upload" className="px-5 py-2.5 bg-primary-600 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-primary-700 transition-colors">
                Upload Notes
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {paginatedNotes.map(note => {
            const liked = likedSet.has(note.id);
            const likes = likeCounts[note.id] ?? note.likes;
            return (
              <div key={note.id} onClick={() => setOpenNote(note)}
                className="glass-card rounded-2xl border border-black/5 p-4 sm:p-5 flex flex-col gap-3 sm:gap-4 cursor-pointer hover:border-primary-500/30 hover:shadow-lg transition-all duration-200 group">
                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${TYPE_COLORS[note.type] || 'bg-foreground/5 text-foreground/50'}`}>
                    {NOTE_TYPES[note.type as keyof typeof NOTE_TYPES] || note.type}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest bg-foreground/5 text-foreground/40">
                    {note.semester === 0 ? '1st Yr' : `Sem ${note.semester}`}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest bg-foreground/5 text-foreground/40">{note.branch}</span>
                </div>
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base leading-snug mb-1 group-hover:text-primary-600 transition-colors line-clamp-2">{note.title}</h3>
                  <p className="text-xs text-foreground/50 font-medium line-clamp-1">{note.subject}</p>
                  {note.description && <p className="text-xs text-foreground/40 mt-2 line-clamp-2 leading-relaxed">{note.description}</p>}
                </div>
                {/* Meta */}
                <div className="flex items-center justify-between text-[10px] text-foreground/30 font-bold uppercase tracking-wider">
                  <span className="flex items-center gap-1 truncate"><BookOpen className="w-3 h-3 shrink-0" />{note.is_anonymous ? 'Anonymous' : (note.uploader?.name || 'Unknown')}</span>
                  <span className="shrink-0">{new Date(note.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                </div>
                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-black/5" onClick={e => e.stopPropagation()}>
                  <button onClick={e => handleLike(e, note.id)} disabled={likeLoading === note.id}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-bold transition-all ${liked ? 'bg-primary-500/15 text-primary-600' : 'bg-foreground/5 text-foreground/40 hover:bg-primary-500/10 hover:text-primary-500'}`}>
                    <ThumbsUp className={`w-3.5 h-3.5 ${liked ? 'fill-primary-500' : ''}`} />{likes}
                  </button>
                  <span className="flex items-center gap-1 text-[10px] text-foreground/30 font-bold px-2"><Download className="w-3 h-3" />{note.downloads}</span>
                  <button onClick={e => handleDownload(e, note)}
                    className="ml-auto flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-primary-600 text-white text-[10px] font-bold hover:bg-primary-700 transition-colors">
                    <Download className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Download</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Pagination ──────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <button
            onClick={() => goToPage(safePage - 1)}
            disabled={safePage <= 1}
            className="flex items-center gap-1 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all border border-transparent disabled:opacity-30 disabled:cursor-not-allowed bg-foreground/5 hover:bg-foreground/10 text-foreground/60"
          >
            <ChevronLeft className="w-4 h-4" /> <span className="hidden sm:inline">Prev</span>
          </button>

          {/* Page numbers */}
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => {
                // Show first, last, current, and neighbors
                if (p === 1 || p === totalPages) return true;
                if (Math.abs(p - safePage) <= 1) return true;
                return false;
              })
              .reduce<(number | 'dot')[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('dot');
                acc.push(p);
                return acc;
              }, [])
              .map((item, i) =>
                item === 'dot' ? (
                  <span key={`dot-${i}`} className="px-1 text-foreground/20 text-xs">…</span>
                ) : (
                  <button
                    key={item}
                    onClick={() => goToPage(item)}
                    className={`w-9 h-9 rounded-xl text-xs font-bold transition-all
                      ${item === safePage
                        ? 'bg-primary-600 text-white shadow-sm shadow-primary-600/20'
                        : 'bg-foreground/5 text-foreground/40 hover:bg-foreground/10'
                      }`}
                  >
                    {item}
                  </button>
                )
              )}
          </div>

          <button
            onClick={() => goToPage(safePage + 1)}
            disabled={safePage >= totalPages}
            className="flex items-center gap-1 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all border border-transparent disabled:opacity-30 disabled:cursor-not-allowed bg-foreground/5 hover:bg-foreground/10 text-foreground/60"
          >
            <span className="hidden sm:inline">Next</span> <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Document Reader Modal ───────────────────────────────────────── */}
      {openNote && <DocumentReaderModal note={openNote} onClose={() => setOpenNote(null)} />}
    </>
  );
}
