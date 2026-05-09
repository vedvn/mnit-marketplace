import { unstable_cache } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';

export const getAdminSettingsCached = unstable_cache(
  async () => {
    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase.from('admin_settings').select('*').single();
    if (error) {
      console.error('Failed to fetch admin settings:', error);
      return null;
    }
    return data;
  },
  ['global-admin-settings'],
  { revalidate: 300, tags: ['admin-settings'] } // 5 min TTL, bustable via tag if admin updates it
);
