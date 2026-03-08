# Veritabanı Şeması — Financial Assistant App

> **Platform:** Supabase (PostgreSQL)
> **Auth:** Supabase Auth (auth.users) — bu tablo Supabase tarafından yönetilir, dokunmuyoruz.
> **Public Schema:** Uygulamamızın tüm tabloları `public` şemasında yaşar.

---

## Tablo Detayları

### 1. `public.users`

Supabase `auth.users` tablosuyla 1:1 ilişkili. Kullanıcı auth.users'a kaydolduğunda **Postgres Trigger** ile otomatik oluşturulur. Backend endpoint'i ile **oluşturulmaz**.

| Kolon        | Tip           | Constraint                                             | Varsayılan | Açıklama                              |
| ------------ | ------------- | ------------------------------------------------------ | ---------- | ------------------------------------- |
| `id`         | `UUID`        | `PRIMARY KEY`, `FK → auth.users(id) ON DELETE CASCADE` | —          | Supabase Auth user ID                 |
| `email`      | `TEXT`        | `NOT NULL`                                             | —          | Kullanıcı e-postası                   |
| `full_name`  | `TEXT`        | —                                                      | `NULL`     | Ad soyad                              |
| `avatar_url` | `TEXT`        | —                                                      | `NULL`     | Profil fotoğrafı URL'i                |
| `currency`   | `TEXT`        | `NOT NULL`                                             | `'TRY'`    | Para birimi kodu                      |
| `language`   | `TEXT`        | `NOT NULL`                                             | `'tr'`     | Dil kodu                              |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`                                             | `now()`    | Oluşturulma zamanı                    |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL`                                             | `now()`    | Son güncelleme (trigger ile otomatik) |

> **Neden ayrı tablo?** Supabase `auth.users` tablosuna doğrudan sütun ekleyemiyoruz. Uygulamaya özel bilgiler (currency, language, full_name) burada tutulur.

---

### 2. `public.categories`

Hem sistem genelinde sabit kategorileri hem kullanıcıların kendi oluşturduğu alt kategorileri barındırır. **Self-referencing** yapıda: `parent_id` ile ana-alt kategori hiyerarşisi sağlanır.

| Kolon        | Tip           | Constraint                                          | Varsayılan          | Açıklama                                       |
| ------------ | ------------- | --------------------------------------------------- | ------------------- | ---------------------------------------------- |
| `id`         | `UUID`        | `PRIMARY KEY`                                       | `gen_random_uuid()` | Kategori ID                                    |
| `name`       | `TEXT`        | `NOT NULL`                                          | —                   | Kategori adı (ör: "Food & Drink", "Groceries") |
| `type`       | `TEXT`        | `NOT NULL`, `CHECK (type IN ('income', 'expense'))` | —                   | Gelir mi gider mi                              |
| `icon`       | `TEXT`        | `NOT NULL`                                          | —                   | Lucide ikon adı (ör: "utensils-crossed")       |
| `color`      | `TEXT`        | `NOT NULL`                                          | —                   | İkon rengi hex (ör: "#F59E0B")                 |
| `bg_color`   | `TEXT`        | `NOT NULL`                                          | —                   | İkon arka plan rengi hex (ör: "#FEF3C7")       |
| `is_system`  | `BOOLEAN`     | `NOT NULL`                                          | `false`             | Sistem kategorisi mi?                          |
| `user_id`    | `UUID`        | `FK → users(id) ON DELETE CASCADE`                  | `NULL`              | Sahibi (sistem kategorilerinde NULL)           |
| `parent_id`  | `UUID`        | `FK → categories(id) ON DELETE CASCADE`             | `NULL`              | Üst kategori (ana kategorilerde NULL)          |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`                                          | `now()`             | Oluşturulma zamanı                             |

**Constraint:**

```sql
CONSTRAINT chk_system_no_user CHECK (
  (is_system = true AND user_id IS NULL) OR
  (is_system = false AND user_id IS NOT NULL)
)
```

> **Kritik Kural:** Sistem kategorileri (`is_system = true`) her kullanıcıya **kopyalanmaz**. Veritabanında `user_id = NULL` olarak tek kopya durur. Sorgular her zaman şu kalıpla yapılır:
>
> ```sql
> WHERE (user_id = :currentUserId OR is_system = true)
> ```
>
> Bu sayede her kullanıcı hem sistem kategorilerini hem kendi özel kategorilerini görür, ama veri tekrarı olmaz.

**Hiyerarşi Örneği:**

```
Food & Drink (is_system=true, parent_id=NULL, user_id=NULL)
├── Groceries (is_system=true, parent_id=Food&Drink.id, user_id=NULL)
├── Restaurants (is_system=true, parent_id=Food&Drink.id, user_id=NULL)
├── Coffee (is_system=true, parent_id=Food&Drink.id, user_id=NULL)
└── Bakery (is_system=false, parent_id=Food&Drink.id, user_id=abc-123)  ← Kullanıcının eklediği
```

---

### 3. `public.transactions`

Kullanıcının tüm gelir/gider işlemlerini tutar. Uygulamanın en yoğun yazılıp okunan tablosu.

| Kolon         | Tip             | Constraint                                           | Varsayılan          | Açıklama                                             |
| ------------- | --------------- | ---------------------------------------------------- | ------------------- | ---------------------------------------------------- |
| `id`          | `UUID`          | `PRIMARY KEY`                                        | `gen_random_uuid()` | İşlem ID                                             |
| `user_id`     | `UUID`          | `NOT NULL`, `FK → users(id) ON DELETE CASCADE`       | —                   | İşlem sahibi                                         |
| `category_id` | `UUID`          | `NOT NULL`, `FK → categories(id) ON DELETE RESTRICT` | —                   | Kategori                                             |
| `title`       | `TEXT`          | —                                                    | `NULL`              | İşlem başlığı/notu (ör: "Migros", "Starbucks")       |
| `amount`      | `NUMERIC(12,2)` | `NOT NULL`, `CHECK (amount > 0)`                     | —                   | Tutar (her zaman pozitif, tür `type` ile belirlenir) |
| `type`        | `TEXT`          | `NOT NULL`, `CHECK (type IN ('income', 'expense'))`  | —                   | Gelir/Gider                                          |
| `date`        | `DATE`          | `NOT NULL`                                           | `CURRENT_DATE`      | İşlem tarihi                                         |
| `note`        | `TEXT`          | —                                                    | `NULL`              | Ek not                                               |
| `receipt_url` | `TEXT`          | —                                                    | `NULL`              | OCR ile taranan fiş görseli URL'i                    |
| `created_at`  | `TIMESTAMPTZ`   | `NOT NULL`                                           | `now()`             | Oluşturulma zamanı                                   |
| `updated_at`  | `TIMESTAMPTZ`   | `NOT NULL`                                           | `now()`             | Son güncelleme                                       |

> **`amount` neden her zaman pozitif?** Gelir/gider ayrımı `type` alanı ile yapılır. Frontend'de gösterimde gelir yeşil "+", gider kırmızı "−" prefix'i ile gösterilir. Bu sayede toplam hesaplamalarında `SUM(CASE WHEN type='income' THEN amount ELSE -amount END)` gibi sorgular yazılabilir.

> **`ON DELETE RESTRICT` (category_id):** Bir kategoriye bağlı işlem varsa o kategori silinemez. Kullanıcıya "Bu kategoriye ait işlemler var, önce onları taşıyın" hatası gösterilir.

**Index'ler:**

```sql
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(date DESC);
CREATE INDEX idx_transactions_category_id ON transactions(category_id);
```

---

### 4. `public.recurring_transactions`

Netflix, kira, maaş gibi belirli aralıklarla tekrar eden işlemler. Cron job ile `next_date`'i gelen kayıtlar otomatik olarak `transactions` tablosuna aktarılır.

| Kolon         | Tip             | Constraint                                                                  | Varsayılan          | Açıklama                                  |
| ------------- | --------------- | --------------------------------------------------------------------------- | ------------------- | ----------------------------------------- |
| `id`          | `UUID`          | `PRIMARY KEY`                                                               | `gen_random_uuid()` | Tekrarlayan işlem ID                      |
| `user_id`     | `UUID`          | `NOT NULL`, `FK → users(id) ON DELETE CASCADE`                              | —                   | Sahibi                                    |
| `category_id` | `UUID`          | `NOT NULL`, `FK → categories(id) ON DELETE RESTRICT`                        | —                   | Kategori                                  |
| `title`       | `TEXT`          | `NOT NULL`                                                                  | —                   | İşlem adı (ör: "Netflix", "Kira")         |
| `amount`      | `NUMERIC(12,2)` | `NOT NULL`, `CHECK (amount > 0)`                                            | —                   | Tutar                                     |
| `type`        | `TEXT`          | `NOT NULL`, `CHECK (type IN ('income', 'expense'))`                         | —                   | Gelir/Gider                               |
| `frequency`   | `TEXT`          | `NOT NULL`, `CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly'))` | —                   | Tekrar sıklığı                            |
| `start_date`  | `DATE`          | `NOT NULL`                                                                  | —                   | İlk işlem tarihi                          |
| `next_date`   | `DATE`          | `NOT NULL`                                                                  | —                   | Sonraki işlem tarihi (cron job bunu okur) |
| `is_active`   | `BOOLEAN`       | `NOT NULL`                                                                  | `true`              | Aktif mi? (devre dışı bırakılabilir)      |
| `created_at`  | `TIMESTAMPTZ`   | `NOT NULL`                                                                  | `now()`             | Oluşturulma zamanı                        |
| `updated_at`  | `TIMESTAMPTZ`   | `NOT NULL`                                                                  | `now()`             | Son güncelleme                            |

> **Cron Job Akışı (her gün 00:05):**
>
> 1. `SELECT * FROM recurring_transactions WHERE is_active = true AND next_date <= CURRENT_DATE`
> 2. Her biri için `transactions` tablosuna INSERT
> 3. `next_date`'i frequency'ye göre ilerlet (`+ 1 month`, `+ 1 week`, vb.)
> 4. Güncellenen `next_date`'i kaydet

---

### 5. `public.budgets`

Kategori bazlı harcama limitleri. Kullanıcı "Food & Drink" kategorisine aylık ₺2.000 limit koyar, backend harcamaları toplayarak kalan bütçeyi hesaplar.

| Kolon          | Tip             | Constraint                                                      | Varsayılan          | Açıklama           |
| -------------- | --------------- | --------------------------------------------------------------- | ------------------- | ------------------ |
| `id`           | `UUID`          | `PRIMARY KEY`                                                   | `gen_random_uuid()` | Bütçe ID           |
| `user_id`      | `UUID`          | `NOT NULL`, `FK → users(id) ON DELETE CASCADE`                  | —                   | Sahibi             |
| `category_id`  | `UUID`          | `NOT NULL`, `FK → categories(id) ON DELETE CASCADE`             | —                   | Kategori           |
| `limit_amount` | `NUMERIC(12,2)` | `NOT NULL`, `CHECK (limit_amount > 0)`                          | —                   | Harcama limiti     |
| `period`       | `TEXT`          | `NOT NULL`, `CHECK (period IN ('weekly', 'monthly', 'yearly'))` | `'monthly'`         | Dönem              |
| `created_at`   | `TIMESTAMPTZ`   | `NOT NULL`                                                      | `now()`             | Oluşturulma zamanı |
| `updated_at`   | `TIMESTAMPTZ`   | `NOT NULL`                                                      | `now()`             | Son güncelleme     |

**Unique Constraint:**

```sql
UNIQUE(user_id, category_id, period)
```

> Aynı kullanıcı aynı kategoriye aynı periyotla birden fazla bütçe tanımlayamaz.

> **`spent` alanı neden tabloda yok?** Harcanan tutar gerçek zamanlı olarak `transactions` tablosundan hesaplanır. Bu sayede tutarsızlık riski ortadan kalkar. Backend `GET /api/budgets` endpoint'inde şu sorgu çalışır:
>
> ```sql
> SELECT COALESCE(SUM(t.amount), 0) as spent
> FROM transactions t
> WHERE t.user_id = :userId AND t.type = 'expense'
>   AND (t.category_id = b.category_id
>        OR t.category_id IN (SELECT id FROM categories WHERE parent_id = b.category_id))
>   AND t.date >= date_trunc('month', CURRENT_DATE)
>   AND t.date < date_trunc('month', CURRENT_DATE) + interval '1 month';
> ```
>
> Dikkat: Alt kategorilerdeki harcamalar da ana kategori bütçesine dahil edilir.

---

### 6. `public.goals`

Kullanıcının birikim hedefleri. "MacBook Pro için ₺60.000 biriktir" gibi.

| Kolon           | Tip             | Constraint                                     | Varsayılan          | Açıklama                      |
| --------------- | --------------- | ---------------------------------------------- | ------------------- | ----------------------------- |
| `id`            | `UUID`          | `PRIMARY KEY`                                  | `gen_random_uuid()` | Hedef ID                      |
| `user_id`       | `UUID`          | `NOT NULL`, `FK → users(id) ON DELETE CASCADE` | —                   | Sahibi                        |
| `name`          | `TEXT`          | `NOT NULL`                                     | —                   | Hedef adı (ör: "MacBook Pro") |
| `target_amount` | `NUMERIC(12,2)` | `NOT NULL`, `CHECK (target_amount > 0)`        | —                   | Hedef tutar                   |
| `saved_amount`  | `NUMERIC(12,2)` | `NOT NULL`, `CHECK (saved_amount >= 0)`        | `0`                 | Biriken tutar                 |
| `target_date`   | `DATE`          | —                                              | `NULL`              | Hedef tarihi (opsiyonel)      |
| `color`         | `TEXT`          | `NOT NULL`                                     | `'#6366F1'`         | UI rengi                      |
| `created_at`    | `TIMESTAMPTZ`   | `NOT NULL`                                     | `now()`             | Oluşturulma zamanı            |
| `updated_at`    | `TIMESTAMPTZ`   | `NOT NULL`                                     | `now()`             | Son güncelleme                |

> **`saved_amount` neden direkt tabloda?** Bütçeden farklı olarak, birikim katkıları düzensiz zamanlarda ve farklı tutarlarda olur. `goal_contributions` tablosundan her seferinde SUM almak yerine, katkı eklendiğinde atomik olarak güncellenir:
>
> ```sql
> UPDATE goals SET saved_amount = saved_amount + :amount WHERE id = :goalId;
> ```

---

### 7. `public.goal_contributions`

Her birikim hedefine yapılan katkıların (para ekleme) geçmişini tutar.

| Kolon        | Tip             | Constraint                                     | Varsayılan          | Açıklama     |
| ------------ | --------------- | ---------------------------------------------- | ------------------- | ------------ |
| `id`         | `UUID`          | `PRIMARY KEY`                                  | `gen_random_uuid()` | Katkı ID     |
| `goal_id`    | `UUID`          | `NOT NULL`, `FK → goals(id) ON DELETE CASCADE` | —                   | Hedef        |
| `amount`     | `NUMERIC(12,2)` | `NOT NULL`, `CHECK (amount > 0)`               | —                   | Katkı tutarı |
| `created_at` | `TIMESTAMPTZ`   | `NOT NULL`                                     | `now()`             | Katkı zamanı |

> Hedef silindiğinde tüm katkı kayıtları da CASCADE ile silinir.

---

### 8. `public.user_preferences`

Kullanıcı bazlı uygulama tercihleri. Her kullanıcı için `handle_new_user()` trigger'ı tarafından varsayılan değerlerle otomatik oluşturulur.

| Kolon                    | Tip           | Constraint                                               | Varsayılan          | Açıklama                    |
| ------------------------ | ------------- | -------------------------------------------------------- | ------------------- | --------------------------- |
| `id`                     | `UUID`        | `PRIMARY KEY`                                            | `gen_random_uuid()` | Tercih ID                   |
| `user_id`                | `UUID`        | `NOT NULL`, `UNIQUE`, `FK → users(id) ON DELETE CASCADE` | —                   | Sahibi                      |
| `daily_reminder_enabled` | `BOOLEAN`     | `NOT NULL`                                               | `true`              | Günlük hatırlatıcı açık mı? |
| `reminder_time`          | `TIME`        | `NOT NULL`                                               | `'20:00'`           | Hatırlatma saati            |
| `dark_mode`              | `BOOLEAN`     | `NOT NULL`                                               | `false`             | Karanlık mod tercihi        |
| `expo_push_token`        | `TEXT`        | —                                                        | `NULL`              | Expo push bildirim token'ı  |
| `created_at`             | `TIMESTAMPTZ` | `NOT NULL`                                               | `now()`             | Oluşturulma zamanı          |
| `updated_at`             | `TIMESTAMPTZ` | `NOT NULL`                                               | `now()`             | Son güncelleme              |

> **`UNIQUE(user_id)`:** Her kullanıcının sadece bir tercih kaydı olabilir.

---

### 9. `public.ai_conversations`

AI sohbet oturumlarını tutar. Her oturum birden fazla mesaj içerir.

| Kolon        | Tip           | Constraint                                     | Varsayılan          | Açıklama                                                |
| ------------ | ------------- | ---------------------------------------------- | ------------------- | ------------------------------------------------------- |
| `id`         | `UUID`        | `PRIMARY KEY`                                  | `gen_random_uuid()` | Konuşma ID                                              |
| `user_id`    | `UUID`        | `NOT NULL`, `FK → users(id) ON DELETE CASCADE` | —                   | Sahibi                                                  |
| `title`      | `TEXT`        | —                                              | `NULL`              | Konuşma başlığı (ilk mesajdan otomatik oluşturulabilir) |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`                                     | `now()`             | Oluşturulma zamanı                                      |

---

### 10. `public.ai_messages`

AI sohbet mesajlarını (hem kullanıcı hem asistan) kronolojik sırayla tutar.

| Kolon             | Tip           | Constraint                                                | Varsayılan          | Açıklama                |
| ----------------- | ------------- | --------------------------------------------------------- | ------------------- | ----------------------- |
| `id`              | `UUID`        | `PRIMARY KEY`                                             | `gen_random_uuid()` | Mesaj ID                |
| `conversation_id` | `UUID`        | `NOT NULL`, `FK → ai_conversations(id) ON DELETE CASCADE` | —                   | Ait olduğu konuşma      |
| `role`            | `TEXT`        | `NOT NULL`, `CHECK (role IN ('user', 'assistant'))`       | —                   | Gönderen (kullanıcı/AI) |
| `content`         | `TEXT`        | `NOT NULL`                                                | —                   | Mesaj içeriği           |
| `created_at`      | `TIMESTAMPTZ` | `NOT NULL`                                                | `now()`             | Gönderim zamanı         |

**Index:**

```sql
CREATE INDEX idx_ai_messages_conversation_id ON ai_messages(conversation_id);
```

---

## Otomatik Mekanizmalar

### Trigger: `handle_new_user()`

```
auth.users INSERT → handle_new_user() → public.users INSERT
                                       → public.user_preferences INSERT
```

Bu trigger hem e-posta/şifre signup'larını hem OAuth (Google/Apple) girişlerini yakalar. OAuth'tan gelen `full_name` ve `avatar_url` bilgilerini `raw_user_meta_data` JSON'ından çeker.

### Trigger: `update_updated_at_column()`

`users`, `transactions`, `recurring_transactions`, `budgets`, `goals`, `user_preferences` tablolarında `UPDATE` öncesinde `updated_at` alanını otomatik olarak `now()` yapar.

### Cron Job: Tekrarlayan İşlem İşleyici

Her gün 00:05'te çalışır. `next_date <= today` olan aktif tekrarlayan işlemler için `transactions` tablosuna kayıt oluşturur ve `next_date`'i ilerletir.

### Cron Job: Günlük Hatırlatıcı

Her saat başı çalışır. O saatin hatırlatma zamanına sahip ve bildirimi açık olan kullanıcılara Expo Push Notification gönderir.

---

## Row Level Security (RLS)

Tüm tablolarda RLS aktiftir. Backend `supabase-js` client'ı `service_role` key ile çalıştığı için RLS'i bypass eder. Ancak ek güvenlik katmanı olarak her tabloda temel RLS politikaları tanımlıdır:

```sql
-- Örnek: transactions tablosu
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
  ON transactions FOR DELETE
  USING (auth.uid() = user_id);
```

> Backend kendi yetki kontrolünü zaten `authenticate` middleware + `WHERE user_id = req.userId` ile yapar. RLS burada savunma derinliği (defense in depth) sağlar.

---

## Veri Tipleri Özet Tablosu

| Kavram          | DB (snake_case) | TypeScript (camelCase) | Dönüşüm                    |
| --------------- | --------------- | ---------------------- | -------------------------- |
| `full_name`     | `TEXT`          | `fullName: string`     | Backend service katmanında |
| `avatar_url`    | `TEXT`          | `avatarUrl: string`    | Backend service katmanında |
| `is_system`     | `BOOLEAN`       | `isSystem: boolean`    | Backend service katmanında |
| `bg_color`      | `TEXT`          | `bgColor: string`      | Backend service katmanında |
| `parent_id`     | `UUID`          | `parentId: string`     | Backend service katmanında |
| `category_id`   | `UUID`          | `categoryId: string`   | Backend service katmanında |
| `limit_amount`  | `NUMERIC(12,2)` | `limitAmount: number`  | Backend service katmanında |
| `target_amount` | `NUMERIC(12,2)` | `targetAmount: number` | Backend service katmanında |
| `saved_amount`  | `NUMERIC(12,2)` | `savedAmount: number`  | Backend service katmanında |
| `target_date`   | `DATE`          | `targetDate: string`   | Backend service katmanında |
| `next_date`     | `DATE`          | `nextDate: string`     | Backend service katmanında |
| `start_date`    | `DATE`          | `startDate: string`    | Backend service katmanında |
| `is_active`     | `BOOLEAN`       | `isActive: boolean`    | Backend service katmanında |
| `created_at`    | `TIMESTAMPTZ`   | `createdAt: string`    | Backend service katmanında |
| `updated_at`    | `TIMESTAMPTZ`   | `updatedAt: string`    | Backend service katmanında |

> **Kural:** Veritabanında `snake_case`, TypeScript'te `camelCase`. Dönüşüm backend service katmanında yapılır. Frontend hiçbir zaman snake_case alan görmez.
