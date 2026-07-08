import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
// Service Role Key digunakan di server-side (API Routes) untuk bypass RLS
// Aman karena hanya berjalan di server, tidak pernah dikirim ke browser
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[Supabase] URL atau Anon Key belum diset di .env!');
}

// Client untuk API Routes (server-side) - menggunakan service_role agar bypass RLS
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Client untuk browser (client-side components) - menggunakan anon key
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export async function checkConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('master_user').select('user_id').limit(1);
    if (error) {
      console.error('❌ Koneksi Supabase bermasalah:', error.message);
      return false;
    }
    console.log('✅ Koneksi ke Supabase berhasil terjalin!');
    return true;
  } catch (error) {
    console.error('❌ Terjadi kesalahan tidak terduga saat mengecek koneksi:', error);
    return false;
  }
}
