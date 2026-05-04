'use client';

import { useEffect } from 'react';
import { X, Download, ExternalLink } from 'lucide-react';

interface NoteForModal {
  id: string;
  title: string;
  subject: string;
  branch: string;
  file_url: string;
  file_type: string;
  file_name: string;
}

export default function DocumentReaderModal({ note, onClose }: { note: NoteForModal; onClose: () => void }) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  // Google Docs viewer gives best cross-browser PDF rendering
  const viewerSrc = note.file_type === 'pdf'
    ? `https://docs.google.com/viewer?url=${encodeURIComponent(note.file_url)}&embedded=true`
    : note.file_url;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6"
      style={{ backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(10px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white w-full max-w-5xl h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{ animation: 'slideUp 0.25s ease-out' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 px-5 py-3.5 border-b border-black/8 shrink-0">
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-foreground/30 mb-0.5">
              {note.branch} · {note.subject}
            </p>
            <h2 className="font-bold text-sm sm:text-base truncate leading-tight">{note.title}</h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={note.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg bg-foreground/5 hover:bg-foreground/10 transition text-[9px] font-bold uppercase tracking-widest text-foreground/60"
            >
              <ExternalLink className="w-3.5 h-3.5" /> New Tab
            </a>
            <a
              href={note.file_url}
              download={note.file_name}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition text-[9px] font-bold uppercase tracking-widest"
            >
              <Download className="w-3.5 h-3.5" /> Download
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-foreground/5 transition text-foreground/40 hover:text-foreground"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document */}
        <div className="flex-1 bg-gray-100 min-h-0">
          {note.file_type === 'image' ? (
            <div className="w-full h-full flex items-center justify-center p-6">
              <img
                src={note.file_url}
                alt={note.title}
                className="max-w-full max-h-full object-contain rounded-xl shadow-xl"
              />
            </div>
          ) : (
            <iframe
              src={viewerSrc}
              className="w-full h-full border-0"
              title={note.title}
              allow="fullscreen"
            />
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
