import dotenv from 'dotenv';

dotenv.config();

const portRaw = process.env.PORT;
const port = portRaw ? Number(portRaw) : 3000;

export const config = {
  port: Number.isFinite(port) ? port : 3000,
  supabaseUrl: process.env.SUPABASE_URL ?? '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  jwtSecret: process.env.JWT_SECRET ?? 'change_me',
};
