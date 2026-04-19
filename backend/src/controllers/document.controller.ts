import { Request, Response } from 'express';
import { supabase } from '../supabase';

export const uploadDocument = async (req: Request, res: Response) => {
  try {
    // 1. Temel Dosya Kontrolü
    if (!req.file) {
      return res.status(400).json({ error: 'Dosya bulunamadı.' });
    }

    const file = req.file;

    // 2. DOSYA DOĞRULAMA (Validation) - Rapor Madde 13
    // Sadece Resim (JPEG, PNG, WEBP) ve PDF formatlarına izin veriyoruz
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return res.status(400).json({
        error: 'Geçersiz dosya tipi. Lütfen sadece JPEG, PNG, WEBP veya PDF yükleyin.',
      });
    }

    // Maksimum boyut kontrolü (Örn: 5MB)
    const maxSize = 5 * 1024 * 1024; // 5 Megabayt
    if (file.size > maxSize) {
      return res.status(400).json({
        error: 'Dosya boyutu çok büyük. Maksimum 5MB yükleyebilirsiniz.',
      });
    }

    // 3. Dosya İsmi ve Yolu Oluşturma
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${fileExt}`;
    const filePath = `documents/${fileName}`;

    // 4. Supabase Storage'a Yükleme
    const { data: storageData, error: storageError } = await supabase.storage
      .from('financial-documents')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (storageError) {
      console.error('Storage Hatası:', storageError.message);
      throw storageError;
    }

    // 5. Veritabanına Kayıt
    // user_id'yi şimdilik body'den alıyoruz, auth middleware eklendiğinde req.user'dan gelecek
    const { data: dbData, error: dbError } = await supabase
      .from('documents')
      .insert([
        {
          storage_path: filePath,
          file_name: file.originalname,
          status: 'pending', // Rapor gereği başlangıç statüsü
          user_id: req.body.userId || 'f0edb959-e649-4039-8841-b8ba2082fdae', // Test için default bir ID
        },
      ])
      .select();

    if (dbError) {
      console.error('Veritabanı Hatası:', dbError.message);
      throw dbError;
    }

    // 6. Başarılı Yanıt (Rapor gereği document_id döndürülüyor)
    res.status(201).json({
      message: 'Belge başarıyla yüklendi ve işleme alındı.',
      document: dbData[0],
    });
  } catch (error: any) {
    console.error('Genel Yükleme Hatası:', error.message);
    res.status(500).json({ error: 'Sunucu tarafında bir hata oluştu.' });
  }
};
