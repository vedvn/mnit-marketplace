'use client';

import { useState, useRef } from 'react';
import { uploadNote } from '@/lib/notes-actions';
import { NOTE_BRANCHES, NOTE_TYPES } from '@/lib/constants/notes';
import { Upload, FileText, X, CheckCircle2, Loader2, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NoteUploadForm() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file) { setError('Please attach a file.'); return; }
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set('file', file);
    formData.set('is_anonymous', String(isAnonymous));

    const result = await uploadNote(formData);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      setTimeout(() => router.push('/notes'), 2000);
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <CheckCircle2 className="w-14 h-14 text-emerald-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Notes Shared!</h2>
        <p className="text-foreground/50 text-sm">Your notes are now live. Redirecting...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
      {/* Title */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/50 ml-1">Title *</label>
        <input
          name="title"
          required
          placeholder="e.g. Engineering Maths II — Complete Notes"
          className="w-full px-4 py-3.5 rounded-xl bg-foreground/5 border border-black/5 outline-none focus:border-primary-500 text-sm transition-colors"
        />
      </div>

      {/* Subject */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/50 ml-1">Subject *</label>
        <input
          name="subject"
          required
          placeholder="e.g. Engineering Mathematics II"
          className="w-full px-4 py-3.5 rounded-xl bg-foreground/5 border border-black/5 outline-none focus:border-primary-500 text-sm transition-colors"
        />
      </div>

      {/* Branch + Semester */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/50 ml-1">Branch *</label>
          <select
            name="branch"
            required
            defaultValue=""
            className="w-full px-4 py-3.5 rounded-xl bg-foreground/5 border border-black/5 outline-none focus:border-primary-500 text-sm transition-colors"
          >
            <option value="" disabled>Select branch</option>
            {NOTE_BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/50 ml-1">Semester *</label>
          <select
            name="semester"
            required
            defaultValue=""
            className="w-full px-4 py-3.5 rounded-xl bg-foreground/5 border border-black/5 outline-none focus:border-primary-500 text-sm transition-colors"
          >
            <option value="" disabled>Select semester</option>
            {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
          </select>
        </div>
      </div>

      {/* Type */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/50 ml-1">Type *</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {Object.entries(NOTE_TYPES).map(([k, v]) => (
            <label key={k} className="cursor-pointer">
              <input type="radio" name="type" value={k} required className="sr-only peer" />
              <div className="text-center py-2.5 rounded-xl border border-black/5 bg-foreground/5 text-xs font-bold uppercase tracking-widest text-foreground/40 peer-checked:bg-primary-600 peer-checked:text-white peer-checked:border-primary-600 transition-all">
                {v}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/50 ml-1">Description <span className="text-foreground/30">(optional)</span></label>
        <textarea
          name="description"
          rows={3}
          placeholder="Topics covered, which chapters, exam year, etc."
          className="w-full px-4 py-3 rounded-xl bg-foreground/5 border border-black/5 outline-none focus:border-primary-500 text-sm resize-none transition-colors"
        />
      </div>

      {/* File Upload */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/50 ml-1">File *</label>
        <div
          onClick={() => fileRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all ${file ? 'border-primary-500/50 bg-primary-500/5' : 'border-black/10 bg-foreground/2 hover:border-primary-500/30 hover:bg-primary-500/3'}`}
        >
          {file ? (
            <>
              <FileText className="w-8 h-8 text-primary-500" />
              <div className="text-center">
                <p className="font-bold text-sm text-primary-600 truncate max-w-xs">{file.name}</p>
                <p className="text-[10px] text-foreground/40 mt-0.5">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
              </div>
              <button
                type="button"
                onClick={e => { e.stopPropagation(); setFile(null); }}
                className="absolute top-3 right-3 p-1 rounded-full hover:bg-foreground/10 text-foreground/30"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <Upload className="w-8 h-8 text-foreground/20" />
              <div className="text-center">
                <p className="font-bold text-sm text-foreground/50">Click to attach file</p>
                <p className="text-[10px] text-foreground/30 mt-0.5">PDF, DOCX, PNG, JPG — max 20MB</p>
              </div>
            </>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp"
          className="hidden"
          onChange={e => setFile(e.target.files?.[0] || null)}
        />
      </div>

      {/* Anonymous Toggle */}
      <div
        onClick={() => setIsAnonymous(!isAnonymous)}
        className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${isAnonymous ? 'border-primary-500/30 bg-primary-500/5' : 'border-black/5 bg-foreground/2 hover:border-black/10'}`}
      >
        <div>
          <p className="font-bold text-sm">{isAnonymous ? 'Posting Anonymously' : 'Show My Name'}</p>
          <p className="text-[10px] text-foreground/40 mt-0.5">
            {isAnonymous ? 'Your name won\'t appear on the note card' : 'Your name will be visible to other students'}
          </p>
        </div>
        <div className={`w-10 h-6 rounded-full transition-colors relative ${isAnonymous ? 'bg-primary-500' : 'bg-foreground/20'}`}>
          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${isAnonymous ? 'left-5' : 'left-1'}`} />
        </div>
        <div className="ml-3">
          {isAnonymous ? <EyeOff className="w-4 h-4 text-primary-500" /> : <Eye className="w-4 h-4 text-foreground/30" />}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 text-red-600 text-sm font-medium">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 rounded-xl bg-primary-600 text-white font-bold uppercase tracking-widest hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</> : <><Upload className="w-4 h-4" /> Share Notes</>}
      </button>
    </form>
  );
}
