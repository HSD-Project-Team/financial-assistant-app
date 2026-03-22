# Backend (Node.js & TypeScript) Geliştirme Kuralları

Bu belge, `backend/` klasörü altında Express.js ve TypeScript kullanarak geliştirme yaparken uyulması gereken mimari kuralları, dosya sınırlarını ve kodlama standartlarını içerir.

## 1. Klasör Yapısı ve Dosya Sınırları

Projenin sürdürülebilir olması için katmanlı mimari (Layered Architecture) prensiplerini uyguluyoruz. Hiçbir katman, diğerinin sorumluluğunu üstlenmemelidir.

```text
backend/src/
├── controllers/    # Sadece HTTP Request/Response yönetimini yapar (iş mantığı YOKTUR)
├── services/       # Asıl iş mantığının (business logic) bulunduğu yer
├── routes/         # Express router tanımları, endpointler
├── middlewares/    # Auth kontrolü, validasyon, hata yönetimi
├── utils/          # Ortak yardımcı fonksiyonlar
├── types/          # Backend'e özel lokal TypeScript tanımları
├── supabase.ts     # Supabase client tanımı
└── index.ts        # Uygulama başlatma noktası
```

### Sınır (Boundary) Kuralları:

1. **Routes Katmanı:** Sadece gelen isteğin hangi Controller metoduna gideceğini belirtir. Express `req` ve `res` nesnelerini burada okuyup işlem DEĞİL, sadece yönlendirme yapın.
2. **Controller Katmanı:** Gelen isteği (params, query, body) alır, Service katmanına iletir. Service'ten dönen yanıtı veya hatayı `res.status().json()` formatına çevirip Frontende / Mobile'a döner. **Veritabanı (Supabase) sorgusu BURADA YAPILMAZ.**
3. **Service Katmanı:** Tüm veritabanı sorguları, dış API çağrıları (AI servisi vb.) burada yapılır. `req` veya `res` nesneleri buraya **kabul edilmez**. Sadece saf argümanlar alır.
4. **Shared Katmanı:** Frontend/Mobile ile ortak olan DTO (Data Transfer Object) ve Tipler, monorepo içindeki `shared/` paketine yazılmalıdır. Backend'e özel spesifik tipler ise `backend/src/types` içine yazılır.

---

## 2. Kod Yazım Standartları

### A. Tip Güvenliği (TypeScript)

- Kesinlikle `any` tipi kullanmak **yasaktır**. Eğer tipi bilmiyorsanız `unknown` kullanın ve tip kontrolü yapın (Type Guarding).
- Değişken ve fonksiyon dönüş tipleri belirtilmelidir.
- Supabase sorguları tipli olmalıdır. Veritabanından gelen veri her zaman beklenmedik olabilir, doğru cast edilmeli veya Schema kontrolü yapılmalıdır.

### B. İsimlendirme Formatları

- **Klasör ve Dosyalar:** `kebab-case` (ör: `user-controller.ts`, `auth-service.ts`)
- **Değişken ve Fonksiyonlar:** `camelCase` (ör: `getUserById`, `isAuthenticated`)
- **Sınıflar (Eğer varsa) ve Interface'ler:** `PascalCase` (ör: `UserService`, `IUser`)
- **Sabitler (Constants):** `UPPER_SNAKE_CASE` (ör: `MAX_RETRY_COUNT`, `PORT`)

### C. Hata Yönetimi (Error Handling)

- Endpointlerde mutlaka `try/catch` kalıbı kullanılmalıdır. (Not: Eğer `express-async-errors` kullanılıyorsa ona uygun ilerlenir).
- Global hata yakalayıcı (Global Error Middleware) kullanılmalıdır. Konsolda kırmızı uzun hata satırları (stack trace) client'a **kesinlikle** gönderilmemelidir.
- Beklenen iş mantığı hataları (Ör: "Şifre yanlış") için `400` veya `401` dönmeli, `500 Internal Server Error` **sadece** beklenmedik bir sunucu çökmesinde dönmelidir.

### Örnek Hata Fırlatma:

```typescript
// service
if (!user) {
  throw new AppError('Kullanıcı bulunamadı', 404);
}

// controller
try {
  const result = await UserService.getUser(id);
  res.status(200).json(result);
} catch (error) {
  next(error); // Error middleware'e pasla
}
```

---

## 3. Ortam Değişkenleri ve Güvenlik

- Gizlilik gerektiren bilgiler (`SUPABASE_SERVICE_ROLE_KEY` gibi) koda "hardcoded" olarak asla yazılmamalıdır.
- Her zaman `process.env.DEGISKEN_ADI` üzerinden okunmalıdır.
- Yeni bir ortam değişkeni eklediğinizde, repo kökündeki `.env.example` dosyasına da boş bir referansını eklemeyi unutmayın! Aksi takdirde diğer ekip arkadaşlarınızın kodu çalışmayacaktır.

## 4. Geliştirme Testleri

PR açmadan önce yazdığınız modül için mutlaka lint hatası olup olmadığını `pnpm lint:backend` veya genel kontroller için `pnpm check` çalıştırarak teyit edin.
Evrensel olarak Prettier ile formatlanmayan dosyalar CI sunucusunda (Github Actions) reddedilecektir.
