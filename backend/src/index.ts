import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { supabase } from './supabase';
import documentRoutes from './routes/document.routes';
// @ts-ignore
import type { HealthDto } from '@fa/shared';

const app = express();

app.use(cors());
app.use(express.json());

// Rotaları tanımlıyoruz
// Not: '/api/documents' şeklinde kullanmak daha standarttır
app.use('/api/documents', documentRoutes);

// Sağlık kontrolü (Mevcut kodun)
app.get('/health', (_req, res) => {
  const payload: HealthDto = { ok: true };
  res.json(payload);
});

// Veritabanı bağlantı testi (Mevcut kodun)
app.get('/db-health', async (_req, res) => {
  try {
    const { error } = await supabase.auth.getSession();
    if (error) throw error;
    res.json({ ok: true, supabase: 'reachable' });
  } catch (e: any) {
    res.status(500).json({ ok: false, supabase: 'error', message: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Sunucu http://localhost:${PORT} adresinde hazır!`);
});
