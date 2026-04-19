import multer from 'multer';

// Bellek depolama ayarı
const storage = multer.memoryStorage();

// 'upload' objesini dışa aktarıyoruz
export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB sınırı
});
