'use client';

import { useState, Suspense } from 'react';
import { Camera, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

function CaptureCore() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sid');
  
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!sessionId) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="p-6 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl flex flex-col items-center">
          <AlertCircle className="w-8 h-8 mb-2" />
          <p className="font-bold">Invalid or missing session link.</p>
        </div>
      </div>
    );
  }

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const captured = e.target.files[0];
      setFile(captured);
      setPreview(URL.createObjectURL(captured));
    }
  };

  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_DIMENSION = 1200;
          if (width > height) {
            if (width > MAX_DIMENSION) {
              height = Math.round(height * (MAX_DIMENSION / width));
              width = MAX_DIMENSION;
            }
          } else {
            if (height > MAX_DIMENSION) {
              width = Math.round(width * (MAX_DIMENSION / height));
              height = MAX_DIMENSION;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Compression failed'));
          }, 'image/jpeg', 0.7);
        };
        img.onerror = () => reject(new Error('Image failed to load'));
        img.src = event.target?.result as string;
      };
      reader.onerror = () => reject(new Error('File read failed'));
      reader.readAsDataURL(file);
    });
  };

  const uploadPhoto = async () => {
    if (!file || !sessionId) return;
    setUploading(true);
    setError(null);
    
    try {
      const compressedBlob = await compressImage(file);
      
      const formData = new FormData();
      formData.append('file', compressedBlob, file.name || 'live_photo.jpg');
      formData.append('session_id', sessionId);
      
      const res = await fetch('/api/camera-session/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Upload failed');
      }
      
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  if (success) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Photo Uploaded!</h1>
        <p className="text-foreground/60 px-4">
          You can now close this window and return to your laptop to complete the listing.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 w-full">
      <div className="w-full max-w-sm glass-card border border-amber-500/30 p-8 rounded-3xl flex flex-col items-center shadow-2xl">
        <div className="w-16 h-16 bg-amber-500/20 text-amber-500 rounded-full flex items-center justify-center mb-4">
          <Camera className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold mb-2 text-center text-amber-500">Live Verification</h1>
        <p className="text-sm text-foreground/60 text-center mb-8">
          Take a clear photo of the item you are listing to prove you have it right now.
        </p>

        {preview ? (
          <div className="w-full flex flex-col items-center gap-4">
            <div className="w-full aspect-square rounded-2xl overflow-hidden glass border border-amber-500/30">
              <img src={preview} className="w-full h-full object-cover" />
            </div>
            
            {error && <p className="text-red-500 text-sm font-bold text-center">{error}</p>}

            <button 
              onClick={uploadPhoto}
              disabled={uploading}
              className="w-full py-4 rounded-xl bg-amber-500 text-white font-bold tracking-widest uppercase hover:bg-amber-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {uploading ? <><Loader2 className="w-5 h-5 animate-spin" /> Uploading...</> : 'Looks Good, Upload'}
            </button>
            <button 
              onClick={() => { setFile(null); setPreview(null); }}
              disabled={uploading}
              className="w-full py-3 rounded-xl bg-foreground/5 text-foreground/60 font-bold tracking-widest uppercase hover:bg-foreground/10 transition-colors disabled:opacity-50"
            >
              Retake
            </button>
          </div>
        ) : (
          <div className="w-full">
            <label className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-amber-500 text-white font-bold tracking-widest uppercase cursor-pointer hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/20">
              <Camera className="w-5 h-5" /> Open Camera
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleCapture} />
            </label>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MobileCapturePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Suspense fallback={<div className="flex-1 flex items-center justify-center w-full"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
        <CaptureCore />
      </Suspense>
    </div>
  )
}
