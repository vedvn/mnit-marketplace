'use client';

import { useState, useRef, useCallback } from 'react';
import { getNoteSubjects } from '@/lib/notes-actions';
import { Upload, FileText, X, CheckCircle2, Loader2, Eye, EyeOff, GraduationCap, ArrowLeft, ChevronRight, Plus, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

type FileEntry = { id: string; title: string; file: File | null };

type Branch = { id: string; name: string; color_class: string };
type Subject = { id: string; name: string; semester: number; branch: string };

const YEAR_OPTIONS = [
  { label: '1st Year', value: 'y1', semesters: [1] },
  { label: '3rd Sem',  value: 's3', semesters: [3] },
  { label: '4th Sem',  value: 's4', semesters: [4] },
  { label: '5th Sem',  value: 's5', semesters: [5] },
  { label: '6th Sem',  value: 's6', semesters: [6] },
  { label: '7th Sem',  value: 's7', semesters: [7] },
  { label: '8th Sem',  value: 's8', semesters: [8] },
];

const RESOURCE_OPTIONS = [
  { key: 'past_paper', label: 'PYPs',            emoji: '📝', desc: 'Previous Year Papers' },
  { key: 'notes',      label: 'Notes',            emoji: '📖', desc: 'Lecture & Study Notes' },
  { key: 'reference',  label: 'Reference Books',  emoji: '📚', desc: 'Textbooks & References' },
];

function StepCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="glass-card rounded-2xl border border-black/5 p-6 space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-300">
      {children}
    </div>
  );
}

function StepLabel({ n, label }: { n: number; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-6 h-6 rounded-full bg-primary-600 text-white text-[10px] font-black flex items-center justify-center shrink-0">{n}</span>
      <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/50">{label}</span>
    </div>
  );
}

export default function NoteUploadForm({ branches }: { branches: Branch[] }) {
  const router = useRouter();
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Wizard state
  const [yearKey,      setYearKey]      = useState<string | null>(null);
  const [subjectType,  setSubjectType]  = useState<'institute_core' | 'program_core' | null>(null);
  const [branchName,   setBranchName]   = useState<string | null>(null);
  const [subjects,     setSubjects]     = useState<Subject[]>([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [resourceType, setResourceType] = useState<string | null>(null);

  // Multi-file entries
  const [entries, setEntries] = useState<FileEntry[]>([{ id: crypto.randomUUID(), title: '', file: null }]);
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Submission
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number; results: { title: string; ok: boolean; error?: string }[] }>({ current: 0, total: 0, results: [] });
  const [error,   setError]   = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Derived values
  const selectedYear = YEAR_OPTIONS.find(y => y.value === yearKey);
  const isFirstYear  = yearKey === 'y1';
  const semesters    = selectedYear?.semesters ?? [];
  const resolvedBranch = isFirstYear && subjectType === 'institute_core' ? 'Common' : branchName ?? '';
  const resolvedSemester = semesters[0] ?? 0;

  // Step visibility
  const showSubjectTypeStep = isFirstYear && yearKey !== null;
  const showBranchStep      = yearKey !== null && (!isFirstYear || subjectType === 'program_core');
  const branchReady         = yearKey !== null && (
    (isFirstYear && subjectType === 'institute_core') ||
    (!isFirstYear && branchName !== null) ||
    (isFirstYear && subjectType === 'program_core' && branchName !== null)
  );
  const showSubjectStep   = branchReady;
  const showResourceStep  = branchReady && selectedSubject !== '';
  const showFormBody      = showResourceStep && resourceType !== null;

  async function loadSubjects(sem: number, branch: string) {
    setSubjectsLoading(true);
    setSelectedSubject('');
    setResourceType(null);
    const data = await getNoteSubjects(sem, branch);
    setSubjects(data as Subject[]);
    setSubjectsLoading(false);
  }

  function handleYearChange(key: string) {
    setYearKey(key);
    setSubjectType(null);
    setBranchName(null);
    setSubjects([]);
    setSelectedSubject('');
    setResourceType(null);
  }

  function handleSubjectTypeChange(type: 'institute_core' | 'program_core') {
    setSubjectType(type);
    setBranchName(null);
    setSubjects([]);
    setSelectedSubject('');
    setResourceType(null);
    if (type === 'institute_core') {
      loadSubjects(resolvedSemester || semesters[0], 'Common');
    }
  }

  function handleBranchChange(name: string) {
    setBranchName(name);
    setSelectedSubject('');
    setResourceType(null);
    loadSubjects(semesters[0], name);
  }

  // ── Entry helpers ──────────────────────────────────────────────────────
  const addEntry = useCallback(() => {
    setEntries(prev => [...prev, { id: crypto.randomUUID(), title: '', file: null }]);
  }, []);

  const removeEntry = useCallback((id: string) => {
    setEntries(prev => prev.length <= 1 ? prev : prev.filter(e => e.id !== id));
  }, []);

  const updateEntry = useCallback((id: string, field: 'title' | 'file', value: string | File | null) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedSubject.trim()) { setError('Please select a subject.'); return; }
    if (!resourceType) { setError('Please select a resource type.'); return; }

    // Validate all entries
    const validEntries = entries.filter(en => en.file && en.title.trim());
    if (validEntries.length === 0) {
      setError('Please add at least one file with a title.');
      return;
    }

    const incomplete = entries.filter(en => (en.file && !en.title.trim()) || (!en.file && en.title.trim()));
    if (incomplete.length > 0) {
      setError('Some entries are incomplete — each needs both a title and a file.');
      return;
    }

    setLoading(true);
    setError(null);
    setUploadProgress({ current: 0, total: validEntries.length, results: [] });

    const results: { title: string; ok: boolean; error?: string }[] = [];

    for (let i = 0; i < validEntries.length; i++) {
      const entry = validEntries[i];
      setUploadProgress(prev => ({ ...prev, current: i + 1 }));

      // Send raw binary to bypass Turbopack FormData stream drops
      const headers = new Headers();
      headers.set('x-note-title', encodeURIComponent(entry.title.trim()));
      headers.set('x-note-subject', encodeURIComponent(selectedSubject));
      headers.set('x-note-branch', encodeURIComponent(resolvedBranch));
      headers.set('x-note-semester', String(resolvedSemester));
      headers.set('x-note-type', encodeURIComponent(resourceType));
      headers.set('x-note-anonymous', String(isAnonymous));
      headers.set('x-file-name', encodeURIComponent(entry.file!.name));
      headers.set('content-type', entry.file!.type);

      const res = await fetch('/api/notes/upload', { 
        method: 'POST', 
        headers: headers,
        body: entry.file, // Send raw file stream, no FormData parsing!
      });
      
      const result = await res.json();
      results.push({ title: entry.title.trim(), ok: !!result.success, error: result.error ?? undefined });
      setUploadProgress(prev => ({ ...prev, results: [...results] }));
    }


    setLoading(false);
    const allOk = results.every(r => r.ok);
    if (allOk) {
      setSuccess(true);
      setTimeout(() => router.push('/notes'), 2000);
    } else {
      const failCount = results.filter(r => !r.ok).length;
      setError(`${failCount} of ${results.length} upload(s) failed. Check details below.`);
    }
  }

  if (success) {
    const count = uploadProgress.results.length;
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2">{count > 1 ? `${count} Notes Shared!` : 'Notes Shared!'}</h2>
        <p className="text-foreground/50 text-sm">Your material is now live for all MNIT students. Redirecting...</p>
      </div>
    );
  }

  // Breadcrumb
  const crumbs = [
    selectedYear?.label,
    subjectType ? (subjectType === 'institute_core' ? 'Institute Core' : 'Program Core') : null,
    branchName,
    selectedSubject || null,
    resourceType ? RESOURCE_OPTIONS.find(r => r.key === resourceType)?.label : null,
  ].filter(Boolean);

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Breadcrumb */}
      {crumbs.length > 0 && (
        <div className="flex items-center flex-wrap gap-1.5 text-[10px] font-bold uppercase tracking-widest text-foreground/40">
          {crumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="w-3 h-3" />}
              <span className={i === crumbs.length - 1 ? 'text-primary-600' : ''}>{c}</span>
            </span>
          ))}
        </div>
      )}

      {/* ── Step 1: Year ── */}
      <StepCard>
        <StepLabel n={1} label="Which year is this for?" />
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {YEAR_OPTIONS.map(y => (
            <button key={y.value} type="button" onClick={() => handleYearChange(y.value)}
              className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-all text-center ${
                yearKey === y.value
                  ? 'border-primary-600 bg-primary-600 text-white shadow-md'
                  : 'border-black/5 bg-foreground/2 text-foreground/60 hover:border-primary-500/30 hover:bg-primary-500/5'
              }`}>
              <GraduationCap className="w-4 h-4" />
              <span className="font-bold text-xs leading-tight">{y.label}</span>
            </button>
          ))}
        </div>
      </StepCard>

      {/* ── Step 2A: Subject type (1st year only) ── */}
      {showSubjectTypeStep && (
        <StepCard>
          <StepLabel n={2} label="Subject type" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button type="button" onClick={() => handleSubjectTypeChange('institute_core')}
              className={`flex flex-col gap-2 p-4 rounded-xl border-2 text-left transition-all ${
                subjectType === 'institute_core'
                  ? 'border-slate-500/40 bg-slate-500/8 ring-1 ring-slate-500/20'
                  : 'border-black/5 bg-foreground/2 hover:border-black/10'
              }`}>
              <span className="text-2xl">🏛️</span>
              <span className="font-bold text-sm">Institute Core</span>
              <span className="text-[10px] text-foreground/40 leading-relaxed">Common to all branches — Maths, Physics, Chemistry, Workshop & more</span>
            </button>
            <button type="button" onClick={() => handleSubjectTypeChange('program_core')}
              className={`flex flex-col gap-2 p-4 rounded-xl border-2 text-left transition-all ${
                subjectType === 'program_core'
                  ? 'border-primary-500/40 bg-primary-500/5 ring-1 ring-primary-500/20'
                  : 'border-black/5 bg-foreground/2 hover:border-black/10'
              }`}>
              <span className="text-2xl">🔬</span>
              <span className="font-bold text-sm">Program Core</span>
              <span className="text-[10px] text-foreground/40 leading-relaxed">Specific to your branch — intro to department subjects</span>
            </button>
          </div>
        </StepCard>
      )}

      {/* ── Step 2B / 3: Branch ── */}
      {showBranchStep && (
        <StepCard>
          <StepLabel n={isFirstYear ? 3 : 2} label="Select your branch" />
          {branches.length === 0 ? (
            <p className="text-sm text-foreground/40 italic">No branches available yet. Contact admin.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {branches.map(b => (
                <button key={b.id} type="button" onClick={() => handleBranchChange(b.name)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
                    branchName === b.name
                      ? 'border-primary-600 bg-primary-600 text-white shadow-md'
                      : `border-transparent hover:border-primary-500/30 hover:bg-primary-500/5 ${b.color_class || 'bg-foreground/5 text-foreground/60'}`
                  }`}>
                  {b.name}
                </button>
              ))}
            </div>
          )}
        </StepCard>
      )}

      {/* ── Subject ── */}
      {showSubjectStep && (
        <StepCard>
          <StepLabel n={isFirstYear ? (subjectType === 'institute_core' ? 3 : 4) : 3} label="Select subject" />
          {subjectsLoading ? (
            <div className="flex items-center gap-2 text-foreground/40 py-2"><Loader2 className="w-4 h-4 animate-spin" /><span className="text-sm">Loading subjects...</span></div>
          ) : subjects.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {subjects.map(s => (
                <button key={s.id} type="button" onClick={() => setSelectedSubject(s.name)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
                    selectedSubject === s.name
                      ? 'border-primary-600 bg-primary-600 text-white shadow-md'
                      : 'border-black/5 bg-foreground/5 text-foreground/60 hover:border-primary-500/30 hover:bg-primary-500/5'
                  }`}>
                  {s.name}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-6 text-center">
              <p className="text-sm font-bold text-foreground/40">No subjects added for this combination yet.</p>
              <p className="text-xs text-foreground/30">Ask your admin to add subjects for this year/branch in the admin panel.</p>
            </div>
          )}
        </StepCard>
      )}


      {/* ── Resource type ── */}
      {showResourceStep && (
        <StepCard>
          <StepLabel n={isFirstYear ? (subjectType === 'institute_core' ? 4 : 5) : 4} label="What are you sharing?" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {RESOURCE_OPTIONS.map(r => (
              <button key={r.key} type="button" onClick={() => setResourceType(r.key)}
                className={`flex flex-col items-center gap-2.5 p-5 rounded-xl border-2 transition-all ${
                  resourceType === r.key
                    ? 'border-primary-600 bg-primary-500/5 ring-1 ring-primary-500/20'
                    : 'border-black/5 bg-foreground/2 hover:border-primary-500/30 hover:bg-primary-500/5'
                }`}>
                <span className="text-3xl">{r.emoji}</span>
                <div className="text-center">
                  <p className="font-bold text-sm">{r.label}</p>
                  <p className="text-[10px] text-foreground/40 mt-0.5">{r.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </StepCard>
      )}

      {/* ── Form body ── */}
      {showFormBody && (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-300">

          {/* Context badge */}
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <p className="text-xs font-bold text-emerald-700">
              Sem {resolvedSemester} · {resolvedBranch === 'Common' ? 'Institute Core' : resolvedBranch} · {selectedSubject} · {RESOURCE_OPTIONS.find(r => r.key === resourceType)?.label}
            </p>
          </div>

          {/* ── File entries ── */}
          <div className="space-y-4">
            {entries.map((entry, idx) => (
              <div key={entry.id} className="glass-card rounded-2xl border border-black/5 p-4 sm:p-5 space-y-3 relative">
                {/* Entry header */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">
                    File {idx + 1}
                  </span>
                  {entries.length > 1 && (
                    <button type="button" onClick={() => removeEntry(entry.id)}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 text-foreground/30 hover:text-red-500 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Title */}
                <input
                  value={entry.title}
                  onChange={e => updateEntry(entry.id, 'title', e.target.value)}
                  placeholder={`e.g. Engineering Maths I — Mid Sem Notes 2024`}
                  className="w-full px-4 py-3 rounded-xl bg-foreground/5 border border-black/5 outline-none focus:border-primary-500 text-sm transition-colors"
                />

                {/* File picker */}
                <div
                  onClick={() => fileRefs.current[entry.id]?.click()}
                  className={`relative flex items-center gap-3 p-4 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                    entry.file ? 'border-primary-500/50 bg-primary-500/5' : 'border-black/10 bg-foreground/2 hover:border-primary-500/30'
                  }`}
                >
                  {entry.file ? (
                    <>
                      <FileText className="w-6 h-6 text-primary-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-primary-600 truncate">{entry.file.name}</p>
                        <p className="text-[10px] text-foreground/40">{(entry.file.size / 1024 / 1024).toFixed(1)} MB</p>
                      </div>
                      <button type="button" onClick={e => { e.stopPropagation(); updateEntry(entry.id, 'file', null); }}
                        className="p-1.5 rounded-full hover:bg-foreground/10 text-foreground/30 shrink-0">
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-foreground/20 shrink-0" />
                      <div>
                        <p className="font-bold text-sm text-foreground/50">Click to attach file</p>
                        <p className="text-[10px] text-foreground/30">PDF, DOCX, PNG, JPG — max 20MB</p>
                      </div>
                    </>
                  )}
                </div>
                <input
                  ref={el => { fileRefs.current[entry.id] = el; }}
                  type="file"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp"
                  className="hidden"
                  onChange={e => { updateEntry(entry.id, 'file', e.target.files?.[0] || null); e.target.value = ''; }}
                />
              </div>
            ))}
          </div>

          {/* Add another file */}
          <button type="button" onClick={addEntry}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 border-dashed border-black/10 text-foreground/40 hover:border-primary-500/30 hover:text-primary-500 hover:bg-primary-500/3 transition-all text-xs font-bold uppercase tracking-widest">
            <Plus className="w-4 h-4" /> Add Another File
          </button>

          {/* Anonymous toggle */}
          <div onClick={() => setIsAnonymous(!isAnonymous)}
            className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
              isAnonymous ? 'border-primary-500/30 bg-primary-500/5' : 'border-black/5 bg-foreground/2 hover:border-black/10'
            }`}>
            <div>
              <p className="font-bold text-sm">{isAnonymous ? 'Posting Anonymously' : 'Show My Name'}</p>
              <p className="text-[10px] text-foreground/40 mt-0.5">
                {isAnonymous ? "Your name won't appear on the note cards" : 'Your name will be visible to other students'}
              </p>
            </div>
            <div className={`w-10 h-6 rounded-full transition-colors relative mx-3 ${isAnonymous ? 'bg-primary-500' : 'bg-foreground/20'}`}>
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${isAnonymous ? 'left-5' : 'left-1'}`} />
            </div>
            {isAnonymous ? <EyeOff className="w-4 h-4 text-primary-500" /> : <Eye className="w-4 h-4 text-foreground/30" />}
          </div>

          {/* Upload progress */}
          {loading && uploadProgress.total > 1 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-foreground/50">
                <span>Uploading {uploadProgress.current} of {uploadProgress.total}</span>
                <span>{Math.round((uploadProgress.current / uploadProgress.total) * 100)}%</span>
              </div>
              <div className="w-full h-2 bg-foreground/5 rounded-full overflow-hidden">
                <div className="h-full bg-primary-600 rounded-full transition-all duration-300" style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }} />
              </div>
            </div>
          )}

          {/* Per-file results (shown after batch with errors) */}
          {!loading && uploadProgress.results.length > 0 && uploadProgress.results.some(r => !r.ok) && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 block">Upload Results</span>
              {uploadProgress.results.map((r, i) => (
                <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${
                  r.ok ? 'bg-emerald-500/5 text-emerald-700' : 'bg-red-500/5 text-red-600'
                }`}>
                  {r.ok ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
                  <span className="truncate">{r.title}</span>
                  {r.error && <span className="ml-auto text-[10px] shrink-0">— {r.error}</span>}
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 text-red-600 text-sm font-medium">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-4 rounded-xl bg-primary-600 text-white font-bold uppercase tracking-widest hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading{uploadProgress.total > 1 ? ` (${uploadProgress.current}/${uploadProgress.total})` : ''}...</>
              : <><Upload className="w-4 h-4" /> Share {entries.filter(e => e.file && e.title.trim()).length > 1 ? `${entries.filter(e => e.file && e.title.trim()).length} Notes` : 'Notes'}</>
            }
          </button>
        </div>
      )}
    </form>
  );
}
