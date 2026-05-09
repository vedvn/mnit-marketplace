'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Info, 
  AlertTriangle,
  Loader2
} from 'lucide-react';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: NotificationType;
}

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
}

interface NotificationContextType {
  showToast: (message: string, type?: NotificationType) => void;
  showConfirm: (options: ConfirmOptions) => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmModal, setConfirmModal] = useState<{
    options: ConfirmOptions;
    resolve: (value: boolean) => void;
  } | null>(null);

  const showToast = useCallback((message: string, type: NotificationType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const showConfirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setConfirmModal({ options, resolve });
    });
  }, []);

  const handleConfirm = (value: boolean) => {
    if (confirmModal) {
      confirmModal.resolve(value);
      setConfirmModal(null);
    }
  };

  return (
    <NotificationContext.Provider value={{ showToast, showConfirm }}>
      {children}

      {/* Toasts Container */}
      <div className="fixed bottom-6 right-6 z-200 flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              className={`
                pointer-events-auto flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-md min-w-[300px] max-w-md
                ${toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' :
                  toast.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-600' :
                  toast.type === 'warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-600' :
                  'bg-blue-500/10 border-blue-500/20 text-blue-600'}
              `}
            >
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 shrink-0" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5 shrink-0" />}
              {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 shrink-0" />}
              {toast.type === 'info' && <Info className="w-5 h-5 shrink-0" />}
              
              <p className="text-[11px] font-black uppercase tracking-widest flex-1">{toast.message}</p>
              
              <button 
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                className="p-1 hover:bg-black/5 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 opacity-40" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmModal && (
          <div className="fixed inset-0 z-210 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => handleConfirm(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl border border-black/5 overflow-hidden"
            >
              <div className="p-8">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${
                  confirmModal.options.variant === 'danger' ? 'bg-red-500/10 text-red-600' : 'bg-primary-500/10 text-primary-600'
                }`}>
                  {confirmModal.options.variant === 'danger' ? <AlertTriangle className="w-7 h-7" /> : <Info className="w-7 h-7" />}
                </div>
                
                <h3 className="text-2xl font-black uppercase tracking-tight mb-2 leading-none">
                  {confirmModal.options.title}
                </h3>
                <p className="text-sm text-foreground/50 font-medium leading-relaxed mb-8">
                  {confirmModal.options.message}
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleConfirm(false)}
                    className="flex-1 px-6 py-4 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    {confirmModal.options.cancelLabel || 'Cancel'}
                  </button>
                  <button
                    onClick={() => handleConfirm(true)}
                    className={`flex-1 px-6 py-4 rounded-xl text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-lg ${
                      confirmModal.options.variant === 'danger' 
                        ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20' 
                        : 'bg-primary-600 hover:bg-primary-700 shadow-primary-600/20'
                    }`}
                  >
                    {confirmModal.options.confirmLabel || 'Confirm'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
