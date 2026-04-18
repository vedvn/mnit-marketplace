'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getCategories, createProduct } from '@/lib/market-actions';
import { Loader2, ImagePlus, X, AlertCircle, Camera, QrCode, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import QRCode from 'react-qr-code';


import { CAMPUS_SAFE_ZONES, isWithinSafetyWindow } from '@/lib/constants/locations';


export default function SellPage() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const supabase = createClient();
  const [categories, setCategories] = useState<any[]>([]);
  const [feePercent, setFeePercent] = useState<number>(5);
  const [price, setPrice] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [originalPrice, setOriginalPrice] = useState<string>('');
  
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  
  const [livePhoto, setLivePhoto] = useState<File | null>(null);
  const [livePreview, setLivePreview] = useState<string | null>(null);

  // Cross Device State
  const [isMobile, setIsMobile] = useState(true); 
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    getCategories().then(setCategories);
    
    // Fetch fee percent
    supabase.from('admin_settings').select('platform_fee_percent').single().then(({data}) => {
      if (data?.platform_fee_percent) setFeePercent(Number(data.platform_fee_percent));
    });
    
    // Check if device is desktop
    const userAgent = window.navigator.userAgent;
    const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) || window.innerWidth <= 768;
    setIsMobile(mobile);

    if (!mobile) {
      initDesktopSession();
    }
  }, []);

  // ... (Polling and Desktop Session logic omitted for brevity, keeping it identical)
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
      }, 3000); 
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
    setError(null);

    // 1. Compliance Check: Safety Window
    if (!isWithinSafetyWindow()) {
      setError("Marketplace safety window closed. Listings and handovers must be scheduled between 7:00 AM and 9:00 PM.");
      return;
    }

    // 2. Pricing Logic Check
    const sellingPrice = parseFloat(price);
    const originalPriceRaw = (e.target as HTMLFormElement).original_price.value;
    if (originalPriceRaw) {
      const originalPrice = parseFloat(originalPriceRaw);
      if (sellingPrice > originalPrice) {
        setError("Your selling price cannot be higher than the original market price. Please provide a fair value.");
        return;
      }
    }

    if (files.length === 0) {
      setError("Please add at least one public image.");
      return;
    }
    if (!livePhoto && !livePreview) {
      setError("Please capture a live verification photo.");
      return;
    }
    setShowConfirm(true);
  }

  async function handleFinalSubmit() {
    if (!formRef.current) return;
    setLoading(true);
    const formData = new FormData(formRef.current);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Authentication failed");

      const imageUrls: string[] = [];
      // 1. Upload public images to public bucket
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `public_${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, file);
        if (uploadError) throw new Error(`Public Image upload failed`);
        const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
        imageUrls.push(data.publicUrl);
      }
      
      // 2. Upload private live photo to PRIVATE bucket (Compliance Section 03)
      // Note: If from mobile flow (livePhoto exists), upload it now.
      // If from desktop flow (livePreview is already a URL from the API), we'll keep that.
      let finalLivePhotoPath = livePreview;
      if (livePhoto) {
        const liveExt = livePhoto.name.split('.').pop();
        // Route to the private bucket and include userId in path for RLS protection
        const privateFileName = `${user.id}/${Math.random().toString(36).substring(2)}_${Date.now()}.${liveExt}`;
        const { error: liveUploadErr } = await supabase.storage.from('verification-photos').upload(privateFileName, livePhoto);
        if (liveUploadErr) throw new Error(`Private Verification upload failed`);
        finalLivePhotoPath = privateFileName; // We store the PATH for private files, not public URL
      } else if (livePreview && livePreview.includes('verification-photos')) {
         // If it's already in the bucket (e.g. from desktop-to-mobile proxy), extract the path
         const urlParts = livePreview.split('verification-photos/');
         if (urlParts.length > 1) finalLivePhotoPath = urlParts[1];
      }
      
      // 3. Submit Product
      const result = await createProduct(formData, imageUrls, finalLivePhotoPath!);
      
      if (result.error) throw new Error(result.error);
      router.push('/profile');
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      setShowConfirm(false);
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Sell an Item</h1>
        <p className="text-foreground/60">Professional review is active. All listings must follow campus safety protocols.</p>
        <div className="mt-4 p-3 rounded-xl bg-primary-500/5 border border-primary-500/10 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary-600">
           <Clock className="w-3.5 h-3.5"/> Safety Window Active: 07:00 AM — 09:00 PM IST
        </div>
      </div>

      <form ref={formRef} onSubmit={handlePreSubmit} className="glass-card p-8 rounded-3xl space-y-8 border border-black/5 shadow-xl">
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-start gap-3 animate-in slide-in-from-top-4">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium ml-1">Title</label>
            <input required type="text" name="title" placeholder="e.g. Physics Textbook, Hero Bicycle..." className="w-full px-4 py-3 rounded-xl bg-foreground/5 border border-black/5 focus:border-primary-500 outline-none" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium ml-1">Condition</label>
            <select required name="condition" className="w-full px-4 py-3 rounded-xl bg-foreground/5 border border-black/5 focus:border-primary-500 outline-none appearance-none cursor-pointer">
              <option value="NEW">New / Boxed</option>
              <option value="LIKE_NEW">Like New</option>
              <option value="GOOD">Good / Used</option>
              <option value="FAIR">Fair / Functional</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium ml-1">Category</label>
            <select required name="category_id" className="w-full px-4 py-3 rounded-xl bg-foreground/5 border border-black/5 focus:border-primary-500 outline-none appearance-none cursor-pointer">
              <option value="">Select Category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium ml-1">Original Price (MRP) ₹</label>
            <input 
              type="number" 
              name="original_price" 
              value={originalPrice}
              onChange={(e) => setOriginalPrice(e.target.value)}
              placeholder="e.g. 1500"
              className="w-full px-4 py-3 rounded-xl bg-foreground/5 border border-black/5 focus:border-primary-500 outline-none" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm ml-1 text-primary-600 font-bold">Your Selling Price ₹</label>
            <input 
              required 
              type="number" 
              name="price" 
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 800"
              className={`w-full px-4 py-3 rounded-xl bg-foreground/5 border focus:border-primary-500 outline-none shadow-sm transition-all ${
                originalPrice && parseFloat(price) > parseFloat(originalPrice) ? 'border-red-500/50 bg-red-500/5' : 'border-black/20'
              }`} 
            />
            {originalPrice && parseFloat(price) > parseFloat(originalPrice) ? (
              <p className="text-[10px] text-red-500 font-bold animate-pulse ml-1">
                Warning: Selling price should be less than or equal to Original Price (MRP).
              </p>
            ) : (
              <p className="text-[10px] text-foreground/40 ml-1">Showing a higher original price (MRP) can help you sell faster!</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium ml-1">Campus Safe-Handover Zone</label>
            <select required name="pickup_address" className="w-full px-4 py-3 rounded-xl bg-foreground/5 border border-black/5 focus:border-primary-500 outline-none appearance-none cursor-pointer">
              <option value="">Choose a location...</option>
              {CAMPUS_SAFE_ZONES.map(zone => (
                <option key={zone.id} value={zone.id}>{zone.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium ml-1">Product Description</label>
            <textarea 
              required 
              name="description" 
              rows={3} 
              placeholder="Provide key details about the item's state, history, and usage..."
              className="w-full px-4 py-3 rounded-xl bg-foreground/5 border border-black/5 focus:border-primary-500 outline-none resize-none leading-relaxed" 
            />
          </div>

          <div className="space-y-2 md:col-span-2 p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-center gap-2 mb-2 text-amber-600">
               <Camera className="w-5 h-5"/>
               <h3 className="font-bold">Live Identity Verification</h3>
            </div>
            <p className="text-[11px] text-amber-700 leading-relaxed mb-4">
              <strong>REQUIRED:</strong> Take a photo of the item in its current environment. This identifies you as the genuine owner. This image is <strong>encrypted & private</strong>, visible only to authorized employee moderators.
            </p>
            <div className="flex gap-4 items-center">
              {livePreview ? (
                 <div className="relative w-32 h-32 rounded-xl overflow-hidden glass border-2 border-amber-500/30 shrink-0">
                   <img src={livePreview} className="w-full h-full object-cover" />
                   <button type="button" onClick={() => {setLivePhoto(null); setLivePreview(null); if(!isMobile) initDesktopSession();}} className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full"><X className="w-3 h-3"/></button>
                 </div>
              ) : isMobile ? (
                 <label className="flex items-center gap-3 px-6 py-4 rounded-xl bg-amber-500 text-white font-bold text-xs uppercase tracking-widest cursor-pointer hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20">
                   <Camera className="w-5 h-5" /> Take verification photo
                   <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleLivePhotoChange} />
                 </label>
              ) : qrUrl ? (
                 <div className="flex flex-col sm:flex-row items-center gap-6 w-full p-4 bg-white rounded-xl shadow-inner border border-black/5">
                   <div className="p-2 bg-white rounded-lg border border-black/10 shadow-sm shrink-0">
                     <QRCode value={qrUrl} size={100} />
                   </div>
                   <div className="space-y-2">
                     <h4 className="font-bold text-sm flex items-center gap-2"><QrCode className="w-4 h-4 text-amber-500"/> Scan with Mobile Camera</h4>
                     <p className="text-xs text-foreground/60 leading-relaxed">
                       Scan this code with your phone to securely connect and take the verification picture.
                     </p>
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
                 I agree to the <a href="/terms" target="_blank" className="text-primary-600 underline font-bold hover:text-primary-900">handover and platform safety rules</a>. I understand that any fraudulent behavior, failing to bring the item after payment, or selling broken items will result in a <strong>permanent ban</strong> from MNIT Marketplace without appeal.
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
