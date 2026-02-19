import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { supabase } from './supabase';
import type { HealthDto } from '@fa/shared';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  const payload: HealthDto = { ok: true };
  res.json(payload);
});

app.get('/db-health', async (_req, res) => {
  try {
    const { error } = await supabase.auth.getSession();
    if (error) throw error;
    res.json({ ok: true, supabase: 'reachable' });
  } catch (e: any) {
    res.status(500).json({ ok: false, supabase: 'error', message: e?.message ?? 'unknown' });
  }
});

const port = process.env.PORT ? Number(process.env.PORT) : 3000;
const baseUrl = process.env.RENDER_EXTERNAL_URL ?? `http://localhost:${port}`;

app.listen(port, '0.0.0.0', () => {
  console.log('-----------------------------------------');
  console.log(`🚀 Backend: ${baseUrl}`);
  console.log(`📡 Health: ${baseUrl}/health`);
  console.log('-----------------------------------------');
});
