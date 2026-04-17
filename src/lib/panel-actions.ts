'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function verifyEmployeePassword(formData: FormData) {
  const password = formData.get('password') as string;
  const envPassword = process.env.EMPLOYEE_PANEL_PASSWORD;

  if (!envPassword) {
    return { error: 'Employee panel password is not configured in .env.local' };
  }

  if (password === envPassword) {
    const cookieStore = await cookies();
    cookieStore.set('employee_auth', password, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24,
      path: '/'
    });
    revalidatePath('/employee');
    return { success: true };
  }

  return { error: 'Incorrect secondary password.' };
}

export async function verifyAdminPassword(formData: FormData) {
  const password = formData.get('password') as string;
  const envPassword = process.env.ADMIN_PANEL_PASSWORD;

  if (!envPassword) {
    return { error: 'Admin panel password is not configured in .env.local' };
  }

  if (password === envPassword) {
    const cookieStore = await cookies();
    cookieStore.set('admin_auth', password, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24,
      path: '/'
    });
    revalidatePath('/admin');
    return { success: true };
  }

  return { error: 'Incorrect secondary password.' };
}
