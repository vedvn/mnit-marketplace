'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getCategories, createProduct } from '@/lib/market-actions';
import { Loader2, ImagePlus, X, AlertCircle, Camera, QrCode } from 'lucide-react';
import { useRouter } from 'next/navigation';
import QRCode from 'react-qr-code';

export default function SellPage() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const supabase = createClient();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  
  const [livePhoto, setLivePhoto] = useState<File | null>(null);
  const [livePreview, setLivePreview] = useState<string | null>(null);

  // Cross Device State
  const [isMobile, setIsMobile] = useState(true); // default to true to avoid hydration mismatch flashes
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    getCategories().then(setCategories);
    
    // Check if device is desktop
    const userAgent = window.navigator.userAgent;
    const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) || window.innerWidth <= 768;
    setIsMobile(mobile);

    if (!mobile) {
      initDesktopSession();
    }
  }, []);

  useEffect(() => {
    let pollInterval: NodeJS.Timeout;
    if (polling && sessionId) {
      pollInterval = setInterval(async () => {
        try {
          const res = await fetch(`/api/camera-session/poll?session_id=${sessionId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.photoUrl) {
              setLivePreview(data.photoUrl);
              setPolling(false);
            }
          }
        } catch (e) {
          console.error('Polling error', e);
        }
      }, 3000); // 3 seconds
    }
    return () => clearInterval(pollInterval);
  }, [polling, sessionId]);

  const initDesktopSession = async () => {
    try {
      const res = await fetch('/api/camera-session/create', { method: 'POST' });
      const data = await res.json();
      if (data.sessionId) {
        setSessionId(data.sessionId);
        setQrUrl(`${window.location.origin}/sell/mobile-capture?sid=${data.sessionId}`);
        setPolling(true);
      }
    } catch (e) {
      console.error("Failed to init desktop session", e);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).slice(0, 3 - files.length);
      setFiles((prev) => [...prev, ...selectedFiles]);
      const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
      setPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const handleLivePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLivePhoto(file);
      setLivePreview(URL.createObjectURL(file));
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  async function handlePreSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (files.length === 0) {
      setError("Please add at least one public image.");
      return;
    }
    if (!livePhoto && !livePreview) {
      setError("Please capture a live verification photo.");
      return;
    }
    setError(null);
    setShowConfirm(true);
  }

  async function handleFinalSubmit() {
    if (!formRef.current) return;
    setLoading(true);
    const formData = new FormData(formRef.current);
    
    try {
      const imageUrls: string[] = [];
      // 1. Upload public images
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `public_${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, file);
        if (uploadError) throw new Error(`Public Image upload failed`);
        const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
        imageUrls.push(data.publicUrl);
      }
      
      // 2. Upload private live photo if it's local (Mobile flow)
      // If it's desktop, livePreview is already a public URL hosted in our bucket
      let finalLivePhotoUrl = livePreview;
      if (livePhoto) {
        const liveExt = livePhoto.name.split('.').pop();
        const liveName = `private_live_${Math.random().toString(36).substring(2)}_${Date.now()}.${liveExt}`;
        const { error: liveUploadErr } = await supabase.storage.from('product-images').upload(liveName, livePhoto);
        if (liveUploadErr) throw new Error(`Live photo upload failed`);
        const { data: liveData } = supabase.storage.from('product-images').getPublicUrl(liveName);
        finalLivePhotoUrl = liveData.publicUrl;
      }
      
      // 3. Submit Product
      const result = await createProduct(formData, imageUrls, finalLivePhotoUrl!);
      
      if (result.error) throw new Error(result.error);
      router.push('/profile');
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Sell an Item</h1>
      <p className="text-foreground/60 mb-8">List your item securely. Items will be reviewed by admin first.</p>

      <form ref={formRef} onSubmit={handlePreSubmit} className="glass-card p-8 rounded-3xl space-y-8 border border-black/5 shadow-xl">
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium ml-1">Title</label>
            <input required type="text" name="title" className="w-full px-4 py-3 rounded-xl bg-foreground/5 border border-black/5 focus:border-primary-500 outline-none" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium ml-1">Original Price (₹) <span className="text-foreground/40 font-normal">(Optional)</span></label>
            <input type="number" name="original_price" className="w-full px-4 py-3 rounded-xl bg-foreground/5 border border-black/5 focus:border-primary-500 outline-none" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium ml-1">Current Selling Price (₹)</label>
            <input required type="number" name="price" className="w-full px-4 py-3 rounded-xl bg-foreground/5 border border-black/5 focus:border-primary-500 outline-none" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium ml-1">Category</label>
            <select required name="category_id" className="w-full px-4 py-3 rounded-xl bg-foreground/5 border border-black/5 focus:border-primary-500 outline-none">
              <option value="">Select Category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium ml-1">Condition</label>
            <select required name="condition" className="w-full px-4 py-3 rounded-xl bg-foreground/5 border border-black/5 focus:border-primary-500 outline-none">
              <option value="NEW">New</option><option value="LIKE_NEW">Like New</option>
              <option value="GOOD">Good</option><option value="FAIR">Fair</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium ml-1">Pickup Location</label>
            <select required name="pickup_address" className="w-full px-4 py-3 rounded-xl bg-foreground/5 border border-black/5 focus:border-primary-500 outline-none">
              <option value="">Select Pickup Location</option>
              <option value="VLTC Front Porch">VLTC Front Porch</option>
              <option value="VLTC Backporch">VLTC Backporch</option>
              <option value="PMC">PMC</option>
              <option value="Vinodini Hostel Gate">Vinodini Hostel Gate</option>
              <option value="Gargi Hostel Gate">Gargi Hostel Gate</option>
              <option value="Hostel Office">Hostel Office</option>
            </select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium ml-1">Description</label>
            <textarea required name="description" rows={3} className="w-full px-4 py-3 rounded-xl bg-foreground/5 border border-black/5 focus:border-primary-500 outline-none resize-none" />
          </div>

          <div className="space-y-2 md:col-span-2 p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-center gap-2 mb-2 text-amber-500">
               <Camera className="w-5 h-5"/>
               <h3 className="font-bold">Live Verification Photo</h3>
            </div>
            <p className="text-xs text-amber-500/80 mb-4">
              Take a live photo of the item right now to prove ownership. This photo is completely private and only seen by the verifier.
            </p>
            <div className="flex gap-4 items-center">
              {livePreview ? (
                 <div className="relative w-32 h-32 rounded-xl overflow-hidden glass border border-amber-500/30 shrink-0">
                   <img src={livePreview} className="w-full h-full object-cover" />
                   <button type="button" onClick={() => {setLivePhoto(null); setLivePreview(null); if(!isMobile) initDesktopSession();}} className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full"><X className="w-3 h-3"/></button>
                 </div>
              ) : isMobile ? (
                 <label className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 text-white font-semibold cursor-pointer hover:bg-amber-600 transition-colors">
                   <Camera className="w-5 h-5" /> Take verification photo
                   <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleLivePhotoChange} />
                 </label>
              ) : qrUrl ? (
                 <div className="flex flex-col sm:flex-row items-center gap-6 w-full p-4 bg-white rounded-xl shadow-inner border border-black/5">
                   <div className="p-2 bg-white rounded-lg border border-black/10 shadow-sm shrink-0">
                     <QRCode value={qrUrl} size={100} />
                   </div>
                   <div className="space-y-2">
                     <h4 className="font-bold text-sm flex items-center gap-2"><QrCode className="w-4 h-4 text-amber-500"/> Scan with your phone</h4>
                     <p className="text-xs text-foreground/60 leading-relaxed">
                       You are on a desktop device. Scan this code with your phone camera to securely connect and take the verification picture.
                     </p>
                     <div className="flex items-center gap-2 text-[10px] text-amber-500/80 font-bold uppercase tracking-widest mt-2">
                       <Loader2 className="w-3 h-3 animate-spin"/> Waiting for photo...
                     </div>
                   </div>
                 </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-foreground/50">
                  <Loader2 className="w-4 h-4 animate-spin" /> Preparing secure session...
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2 md:col-span-2 mt-2">
            <label className="text-sm font-medium ml-1">Public Gallery Images (up to 3)</label>
            <div className="flex gap-4 items-center flex-wrap mt-2">
              {previews.map((src, i) => (
                <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden glass">
                  <img src={src} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeFile(i)} className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white"><X className="w-3 h-3" /></button>
                </div>
              ))}
              {files.length < 3 && (
                <label className="w-24 h-24 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-black/20 hover:border-primary-500 cursor-pointer">
                  <ImagePlus className="w-6 h-6 text-foreground/50" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} multiple />
                </label>
              )}
            </div>
          </div>
          
          <div className="space-y-2 md:col-span-2 mt-4 p-5 rounded-2xl bg-red-500/5 border border-red-500/10">
            <label className="flex items-start gap-3 cursor-pointer">
               <input required type="checkbox" className="mt-1 w-5 h-5 rounded border-black/20 text-primary-600 focus:ring-primary-500 bg-background" />
               <span className="text-sm text-foreground/80 leading-relaxed">
                 <strong className="text-red-500 block mb-1">Mandatory Terms &amp; Rules</strong>
                 I agree to the <a href="/terms" target="_blank" className="text-primary-600 underline font-bold hover:text-primary-900">handover and escrow rules</a>. I understand that any fraudulent behavior, failing to bring the item after payment, or selling broken items will result in a <strong>permanent ban</strong> from MNIT Marketplace without appeal.
               </span>
            </label>
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full py-4 rounded-xl bg-primary-600 text-white disabled:opacity-50 mt-6 flex justify-center items-center font-bold">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify Details & Continue"}
        </button>
      </form>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-black/5 animate-in zoom-in-95">
            <div className="w-16 h-16 bg-amber-500/20 text-amber-500 flex items-center justify-center rounded-full mb-6 mx-auto">
              <AlertCircle className="w-8 h-8"/>
            </div>
            <h3 className="text-2xl font-bold text-center mb-2">Are you sure?</h3>
            <p className="text-foreground/70 text-center mb-8 leading-relaxed">
              Once submitted and reviewed, product details (like price and description) <strong>cannot be edited</strong> to prevent scams. Please verify if all your information is absolutely correct.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleFinalSubmit} 
                disabled={loading}
                className="w-full py-4 rounded-xl bg-amber-500 text-white font-bold flex items-center justify-center disabled:opacity-50 tracking-wide"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Yes, Looks Good"}
              </button>
              <button 
                onClick={() => setShowConfirm(false)}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-foreground/5 text-foreground/80 font-bold tracking-wide"
              >
                Go Back & Edit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
