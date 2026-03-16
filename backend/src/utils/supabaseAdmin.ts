import { createClient } from '@supabase/supabase-js';
import { config } from '../config/env';

if (!config.supabaseUrl) throw new Error('SUPABASE_URL is missing');
if (!config.supabaseServiceRoleKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is missing');

// Admin işlemleri için server-side service_role client
export const supabaseAdmin = createClient(config.supabaseUrl, config.supabaseServiceRoleKey);
