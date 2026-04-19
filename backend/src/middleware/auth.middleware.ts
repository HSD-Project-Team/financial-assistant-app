import { Request, Response, NextFunction } from 'express';
import { supabase } from '../supabase';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. İstek başlığından (header) token'ı al
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Yetkilendirme başlığı eksik. Lütfen giriş yapın.' });
    }

    const token = authHeader.split(' ')[1];

    // 2. Supabase üzerinden token doğrulaması yap
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Oturum geçersiz veya süresi dolmuş.' });
    }

    // 3. Kullanıcı bilgilerini request objesine ekle (Böylece controller'da ID'yi kullanabileceğiz)
    (req as any).user = user;

    next(); // Her şey yolunda, bir sonraki adıma geç
  } catch (error) {
    console.error('Auth Middleware Hatası:', error);
    res.status(401).json({ error: 'Yetkilendirme hatası oluştu.' });
  }
};
