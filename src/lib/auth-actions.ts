'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// ─── SIGNUP (Password + Email Verification via Supabase) ──────────────────────
export async function signUp(formData: FormData) {
  const email    = formData.get('email') as string;
  const password = formData.get('password') as string;
  const name     = formData.get('name') as string;

  if (!email?.endsWith('@mnit.ac.in')) {
    return { error: 'Only @mnit.ac.in email addresses are allowed.' };
  }
  if (!password || password.length < 8) {
    return { error: 'Password must be at least 8 characters.' };
  }
  if (!name?.trim()) {
    return { error: 'Please enter your full name.' };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name } },
  });

  if (error) {
    if (error.message.includes('already registered') || error.message.includes('already been registered')) {
      return { error: 'An account with this email already exists. Please log in instead.' };
    }
    return { error: error.message };
  }

  return { success: true };
}

// ─── PASSWORD LOGIN ────────────────────────────────────────────────────────────
export async function signInWithPassword(formData: FormData) {
  const email    = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email?.endsWith('@mnit.ac.in')) {
    return { error: 'Only @mnit.ac.in email addresses are allowed.' };
  }

  const supabase = await createClient();

  // 1. Check if the user exists in our DB first to provide better feedback
  const { data: userExists } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  if (!userExists) {
    return { error: "Account doesn't exist. Please signup first." };
  }

  // 2. Proceed with sign in
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.message.toLowerCase().includes('email not confirmed')) {
      return { error: 'Please verify your email first. Check your @mnit.ac.in inbox for the verification link we sent.' };
    }
    return { error: 'Incorrect password. Please try again.' };
  }

  revalidatePath('/', 'layout');
  redirect('/market');
}

// ─── OTP MAGIC LINK LOGIN (fallback / passwordless) ───────────────────────────
export async function sendOTP(formData: FormData) {
  const email = formData.get('email') as string;

  if (!email || !email.endsWith('@mnit.ac.in')) {
    return { error: 'Please use your valid @mnit.ac.in student email.' };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true, email };
}

export async function verifyOTP(formData: FormData) {
  const email = formData.get('email') as string;
  const token = formData.get('token') as string;

  if (!email || !token) {
    return { error: 'Email and OTP are required.' };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  redirect('/market');
}

export async function verifySignupOTP(formData: FormData) {
  const email = formData.get('email') as string;
  const token = formData.get('token') as string;

  if (!email || !token) {
    return { error: 'Email and OTP code are required.' };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.verifyOtp({ email, token, type: 'signup' });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  redirect('/market');
}

// ─── SIGN OUT ─────────────────────────────────────────────────────────────────
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

// ─── PASSWORD RESET (6-Digit OTP) ─────────────────────────────────────────────
export async function requestResetOTP(formData: FormData) {
  const email = formData.get('email') as string;

  if (!email || !email.endsWith('@mnit.ac.in')) {
    return { error: 'Please use your valid @mnit.ac.in student email.' };
  }

  const supabase = await createClient();

  // Supabase resetPasswordForEmail sends an OTP if configured, or a link.
  // We specify the flow to ensure recovery type is triggered.
  const { error } = await supabase.auth.resetPasswordForEmail(email);

  if (error) {
    return { error: error.message };
  }

  return { success: true, email };
}

export async function verifyRecoveryOTP(formData: FormData) {
  const email = formData.get('email') as string;
  const token = formData.get('token') as string;

  if (!email || !token) {
    return { error: 'Email and OTP code are required.' };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'recovery'
  });

  if (error) {
    return { error: error.message };
  }

  // Once verified, the user is logged in with a recovery session.
  // We redirect them to the actual reset page.
  return { success: true };
}

export async function updateUserPassword(formData: FormData) {
  const password = formData.get('password') as string;

  if (!password || password.length < 8) {
    return { error: 'Password must be at least 8 characters long.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
