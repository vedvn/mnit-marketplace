'use client';

import { useNotification } from './ui/NotificationProvider';

export default function SellHolidayButton() {
  const { showToast } = useNotification();

  return (
    <button 
      onClick={() => showToast("Listing new items is suspended during the holiday break. You can still browse existing listings!", "info")}
      className="px-8 py-3 bg-foreground/10 text-foreground/40 font-bold text-xs uppercase tracking-widest cursor-not-allowed border border-black/5 transition-all hover:bg-foreground/5"
    >
      Market Suspended
    </button>
  );
}
