import { createClient } from '@supabase/supabase-js';

// .env dosyasındaki isimlendirmelerle birebir aynı olmalı!
const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_KEY; // Burayı değiştirdik!

if (!url) throw new Error('SUPABASE_URL is missing');
if (!serviceKey) throw new Error('SUPABASE_KEY is missing');

export const supabase = createClient(url, serviceKey);
