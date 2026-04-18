'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function completeProfile(formData: FormData) {
  const phone = formData.get('phone_number') as string;
  const payoutMethod = formData.get('payout_method') as 'bank' | 'upi';
  const bankAccount = formData.get('bank_account_number') as string;
  const bankIfsc = formData.get('bank_ifsc') as string;
  const upiId = formData.get('upi_id') as string;

  if (!phone) return { error: 'Phone number is required.' };
  if (!/^[6-9]\d{9}$/.test(phone)) {
    return { error: 'Enter a valid 10-digit Indian mobile number.' };
  }

  if (payoutMethod === 'upi') {
    if (!upiId || !upiId.includes('@')) {
      return { error: 'Enter a valid UPI ID (e.g. name@upi).' };
    }
  } else {
    if (!bankAccount) return { error: 'Bank account number is required.' };
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(bankIfsc?.toUpperCase())) {
      return { error: 'Enter a valid IFSC code (e.g. SBIN0001234).' };
    }
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not logged in.' };

  // Compliance Fix: Save sensitive PII to the hardened user_financials table
  // instead of the public users table.
  const { error } = await supabase
    .from('user_financials')
    .upsert({
      id: user.id,
      phone_number: phone,
      bank_account_number: payoutMethod === 'bank' ? bankAccount : null,
      bank_ifsc: payoutMethod === 'bank' ? bankIfsc.toUpperCase() : null,
      upi_id: payoutMethod === 'upi' ? upiId : null,
      updated_at: new Date().toISOString()
    });

  if (error) return { error: error.message };

  revalidatePath('/', 'layout');
  redirect('/market');
}
