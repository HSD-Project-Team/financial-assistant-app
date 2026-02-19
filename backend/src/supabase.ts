import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url) throw new Error('SUPABASE_URL is missing');
if (!serviceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is missing');

// Server-side: service role kullanıyoruz (admin)
export const supabase = createClient(url, serviceKey);
