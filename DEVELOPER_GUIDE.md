# 🚀 Developer Guide — Finance Assistant Monorepo

Bu rehber, projeye sıfırdan başlayan bir geliştiricinin kurulumdan deployment'a kadar
her adımı takip edebilmesini sağlamak için yazılmıştır. **Adım adım** ilerleyin,
hiçbir adımı atlamayın.

---

## İçindekiler

1. [Gereksinimler](#1-gereksinimler)
2. [İlk Kurulum (Sadece 1 Kez)](#2-ilk-kurulum-sadece-1-kez)
3. [Günlük Geliştirme](#3-günlük-geliştirme)
4. [Proje Yapısı](#4-proje-yapısı)
5. [Ortam Değişkenleri (.env)](#5-ortam-değişkenleri-env)
6. [Veritabanı (Supabase)](#6-veritabanı-supabase)
7. [Script Referansı](#7-script-referansı)
8. [Git İş Akışı & Commit Kuralları](#8-git-i̇ş-akışı--commit-kuralları)
9. [CI/CD Pipeline](#9-cicd-pipeline)
10. [Deployment (Staging)](#10-deployment-staging)
11. [Sorun Giderme (FAQ)](#11-sorun-giderme-faq)

---

## 1. Gereksinimler

Aşağıdaki araçları bilgisayarınıza kurun. **Versiyonlar önemli**, farklı versiyonlarla
uyumsuzluk yaşanabilir.

| Araç               | Versiyon       | Kurulum                                                       | Kontrol Komutu                 |
| ------------------ | -------------- | ------------------------------------------------------------- | ------------------------------ |
| **Node.js**        | `20.20.0`      | [nodejs.org](https://nodejs.org/) veya `nvm install 20.20.0`  | `node -v`                      |
| **pnpm**           | `10.29.3`      | `corepack enable && corepack prepare pnpm@10.29.3 --activate` | `pnpm -v`                      |
| **Docker Desktop** | Son sürüm      | [docker.com](https://www.docker.com/products/docker-desktop/) | `docker -v`                    |
| **Git**            | Son sürüm      | [git-scm.com](https://git-scm.com/)                           | `git --version`                |
| **Python**         | `3.12.5`       | [python.org](https://www.python.org/downloads/)               | `python --version`             |
| **Supabase CLI**   | pnpm ile gelir | Otomatik (devDependency)                                      | `pnpm exec supabase --version` |

### nvm Kullanıyorsanız (Tavsiye Edilir)

```bash
# Repo kök dizininde çalıştırın — doğru Node versiyonunu aktif eder
nvm install 20.20.0
nvm use 20.20.0
# Kontrol için
node --version # 20.20.0 olmalı
```

### Python Virtual Environment

AI servisi için izole bir Python ortamı oluşturun:

```bash
# Repo kök dizininde çalıştırın
py -3.12 -m venv ai-services/.venv

# Aktif edin:
# Windows (PowerShell):
ai-services\.venv\Scripts\Activate.ps1

# macOS / Linux:
source ai-services/.venv/bin/activate

# Bağımlılıkları yükleyin:
pnpm ai:install
```

> ⚠️ **Önemli**: AI komutlarını (`pnpm ai:lint`, `pnpm ai:typecheck` vb.) çalıştırmadan
> önce venv'in aktif olduğundan emin olun.

---

## 2. İlk Kurulum (Sadece 1 Kez)

```bash
# 1) Repo'yu klonlayın
git clone <repo-url>
cd infra

# 2) Node bağımlılıklarını yükleyin
pnpm install

# 3) .env dosyasını oluşturun
cp .env.example .env          # Windows (PowerShell)
cd mobile
cp .env.example .env # Mobile klasörü için o klasördeki .env.example .env olarak kopyalayıp doldurmanız gerekiyor

# cp .env.example .env               # macOS / Linux

# 4) Docker Desktop'un çalıştığından emin olun, ardından:
pnpm db:start

# 5) Lokal Supabase key'lerini görün
pnpm db:status
# Çıktıdaki anon key ve service_role key değerlerini .env dosyanıza kopyalayın:
# SUPABASE_ANON_KEY= Authentication keys/Publishable
# SUPABASE_SERVICE_ROLE_KEY= Authentication keys/Secret

# 6) Shared paketini build edin (backend ve mobile bu pakete bağlı)
pnpm build:shared

# 7) Backend'i çalıştırın
pnpm dev:backend

# 8) Yeni terminal açıp: sağlık kontrolü yapın
curl http://localhost:3000/health
# Beklenen yanıt: {"ok":true}
```

Her şey çalıştıysa, tebrikler! 🎉 Ortamınız hazır.

---

## 3. Günlük Geliştirme

### Backend Geliştirme

```bash
# Terminal 1: Veritabanı + Backend birlikte
pnpm dev

# VEYA sadece backend (DB zaten çalışıyorsa):
pnpm dev:backend
```

Backend `tsx watch` ile çalışır — dosya kaydettiğinizde otomatik yeniden başlar.

### Mobile Geliştirme

```bash
# Terminal 1: Backend çalışıyor olmalı (pnpm dev)

# Terminal 2: Mobile
pnpm dev:mobile
```

Expo Dev Client açılacak. Fiziksel cihaz veya emülatör üzerinde test edin.

> 📱 **Emülatör IP adresleri:**
>
> - Android Emülatör → `http://10.0.2.2:3000`
> - iOS Simulator → `http://localhost:3000`
> - Gerçek cihaz → `http://<bilgisayar_IP>:3000`
>
> `.env` dosyasındaki `EXPO_PUBLIC_API_BASE_URL` değerini cihaz tipinize göre ayarlayın.

### AI Servisi

```bash
# Önce venv'i aktif edin:
ai-services\.venv\Scripts\Activate.ps1    # Windows
# source ai-services/.venv/bin/activate   # macOS/Linux

# Geliştirme sunucusu:
pnpm dev:ai       # FastAPI http://localhost:8000
```

---

## 4. Proje Yapısı

```
infra/                         ← Monorepo kökü
├── .env.example               ← Tüm servisler için tek env şablonu
├── .env                       ← Lokal env (gitignore'da, ASLA commitlenmeZ)
├── .github/workflows/              ← CI pipeline'ları
│   ├── pr-checks.yml               ← PR'da otomatik check
│   ├── staging-db-push.yml         ← main'e push'ta DB migration
│   └── staging-mobile-update.yml   ← main'e push'ta mobile OTA update
├── .husky/                    ← Git hook'ları
│   ├── pre-commit             ← lint-staged (format)
│   └── commit-msg             ← commitlint (mesaj formatı)
├── package.json               ← Root scriptler & devDependencies
├── pnpm-workspace.yaml        ← Workspace tanımları
│
├── backend/                   ← Express + TypeScript (Node.js servisi)
│   ├── src/
│   │   ├── index.ts           ← Ana giriş noktası
│   │   └── supabase.ts        ← Supabase client
│   ├── package.json
│   ├── tsconfig.json
│   └── eslint.config.mjs
│
├── mobile/                    ← React Native + Expo (TypeScript)
│   ├── App.tsx                ← Ana uygulama bileşeni
│   ├── src/
│   │   └── app.config.ts      ← Ortam bazlı API URL çözümleme
│   ├── app.json               ← Expo konfigürasyonu
│   ├── eas.json               ← EAS Build profilleri
│   ├── metro.config.js        ← Metro bundler (monorepo desteği)
│   ├── package.json
│   └── tsconfig.json
│
├── shared/                    ← Ortak TypeScript tipleri & sabitler
│   ├── src/
│   │   └── index.ts           ← Export'lar (HealthDto, APP_NAME vb.)
│   ├── package.json           ← @fa/shared
│   └── tsconfig.json
│
├── ai-services/               ← Python FastAPI servisi
│   ├── app/
│   │   ├── __init__.py
│   │   └── main.py            ← FastAPI giriş noktası
│   ├── requirements.txt       ← Prod bağımlılıkları
│   ├── requirements-dev.txt   ← Dev bağımlılıkları (ruff, mypy)
│   ├── pyproject.toml         ← ruff & mypy konfigürasyonu
│   ├── Dockerfile
│   └── .python-version
│
├── supabase/                  ← Supabase CLI projesi
│   ├── config.toml            ← Lokal Supabase konfigürasyonu
│   └── migrations/            ← SQL migration dosyaları
│
├── tools/                     ← Yardımcı scriptler
│   └── db-clean.mjs           ← Docker container temizleme
│
└── docs/                      ← Dokümantasyon
    ├── architecture/           ← Mimari kararlar (ADR)
    ├── engineering/
    └── ops/
```

### Workspace'ler Arası Bağımlılık

```
mobile ──depends on──▶ @fa/shared
backend ─depends on──▶ @fa/shared
```

`shared` paketi değiştiğinde, önce build edilmesi gerekir:

```bash
pnpm build:shared
```

---

## 5. Ortam Değişkenleri (.env)

Tüm ortam değişkenleri **kök dizindeki tek `.env` dosyasından** yönetilir.

| Değişken                    | Servis      | Açıklama              | Lokal Değer               |
| --------------------------- | ----------- | --------------------- | ------------------------- |
| `SUPABASE_URL`              | Backend, AI | Supabase API URL      | `http://127.0.0.1:54321`  |
| `SUPABASE_ANON_KEY`         | Backend     | Anonim (public) key   | `pnpm db:status` ile alın |
| `SUPABASE_SERVICE_ROLE_KEY` | Backend     | Admin key (**gizli**) | `pnpm db:status` ile alın |
| `PORT`                      | Backend     | Express port          | `3000`                    |
| `EXPO_PUBLIC_API_BASE_URL`  | Mobile      | Backend API adresi    | `http://10.0.2.2:3000`    |
| `AI_PORT`                   | AI Services | FastAPI port          | `8000`                    |

> 🔒 **Güvenlik kuralları:**
>
> - `.env` dosyası **ASLA** git'e commitlenmez
> - `EXPO_PUBLIC_*` prefix'li değişkenler herkese açıktır — **gizli bilgi koymayın**
> - `SUPABASE_SERVICE_ROLE_KEY` sadece backend'de kullanılır

---

## 6. Veritabanı (Supabase)

### Lokal Supabase (Docker)

```bash
pnpm db:start      # Container'ları başlat (ilk sefer biraz sürer)
pnpm db:status     # URL, portlar ve key'leri göster
pnpm db:stop       # Container'ları durdur
pnpm db:reset      # Tüm veritabanını sıfırla (migration'ları tekrar çalıştırır)
```

Lokal Supabase ayağa kalkınca şunlara erişebilirsiniz:

| Servis                 | URL                                                       |
| ---------------------- | --------------------------------------------------------- |
| **API**                | `http://127.0.0.1:54321`                                  |
| **Studio (GUI)**       | `http://127.0.0.1:54323`                                  |
| **Inbucket (E-posta)** | `http://127.0.0.1:54324`                                  |
| **PostgreSQL**         | `postgresql://postgres:postgres@127.0.0.1:54322/postgres` |

### Migration Oluşturma

Veritabanı şemasında değişiklik yaptığınızda:

```bash
# 1) Studio'dan (GUI) değişikliklerinizi yapın
# 2) Farkı SQL olarak çıkarın:
pnpm db:diff -f yeni_tablo_ekle

# Bu komut supabase/migrations/ altında yeni bir .sql dosyası oluşturur.
# 3) Dosyayı inceleyin, commit edin.
```

### Staging'e Push

Migration'lar `main` branch'e merge edildiğinde **otomatik olarak** staging Supabase'e
push edilir (GitHub Actions: `staging-db-push.yml`).

Manuel push gerekiyorsa:

```bash
pnpm db:link       # Staging projesine bağlan (ilk sefer)
pnpm db:push       # Migration'ları staging'e gönder
```

---

## 7. Script Referansı

### Geliştirme

| Komut              | Açıklama                          |
| ------------------ | --------------------------------- |
| `pnpm dev`         | DB başlat + Backend çalıştır      |
| `pnpm dev:backend` | Sadece backend (tsx watch)        |
| `pnpm dev:mobile`  | Expo Dev Client başlat            |
| `pnpm dev:ai`      | FastAPI dev sunucusu (port 8000)  |
| `pnpm dev:all`     | DB + Backend + Mobile (eşzamanlı) |

### Kalite Kontrol

| Komut               | Açıklama                                                   |
| ------------------- | ---------------------------------------------------------- |
| `pnpm check`        | **Tüm** kontrolleri sırayla çalıştır (CI'da da bu çalışır) |
| `pnpm format`       | Tüm dosyaları Prettier ile formatla                        |
| `pnpm format:check` | Format kontrolü (düzeltme yapmaz)                          |
| `pnpm typecheck`    | TypeScript tip kontrolü (shared + backend + mobile)        |
| `pnpm lint:backend` | Backend ESLint                                             |
| `pnpm lint:mobile`  | Mobile ESLint                                              |
| `pnpm lint`         | Backend + Mobile ESLint                                    |
| `pnpm ai:lint`      | Python Ruff lint                                           |
| `pnpm ai:format`    | Python Ruff format                                         |
| `pnpm ai:typecheck` | Python mypy tip kontrolü                                   |
| `pnpm ai:check`     | Python format + lint + typecheck                           |

### Veritabanı

| Komut            | Açıklama                                    |
| ---------------- | ------------------------------------------- |
| `pnpm db:start`  | Lokal Supabase başlat                       |
| `pnpm db:stop`   | Lokal Supabase durdur                       |
| `pnpm db:status` | Durum, URL'ler ve key'leri göster           |
| `pnpm db:reset`  | DB sıfırla + migration'ları tekrar çalıştır |
| `pnpm db:diff`   | Şema değişikliklerini SQL'e çevir           |
| `pnpm db:push`   | Migration'ları staging'e gönder             |
| `pnpm db:clean`  | Supabase Docker container'larını temizle    |

### Build & Deploy

| Komut                       | Açıklama                                     |
| --------------------------- | -------------------------------------------- |
| `pnpm build:shared`         | Shared paketi derle (backend/mobile bağımlı) |
| `pnpm deploy:backend:build` | Render build komutu                          |
| `pnpm deploy:backend:start` | Render start komutu                          |

---

## 8. Git İş Akışı & Commit Kuralları

### Branch Stratejisi

```
main (korumalı)
 └── feature/kisa-aciklama    ← buradan çalışın
```

```bash
# Yeni özellik başlatmak için:
git checkout main
git pull origin main
git checkout -b feature/kullanici-girisi
```

### Commit Mesajı Formatı

Bu proje [Conventional Commits](https://www.conventionalcommits.org/) kullanır.
`commitlint` git hook ile kontrol edilir — yanlış mesaj commit'i engeller.

```
<tip>(<kapsam>): <kısa açıklama>

Örnekler:
feat(backend): kullanıcı kayıt endpoint'i eklendi
fix(mobile): login ekranında crash düzeltildi
docs: developer guide güncellendi
chore: eslint kuralları güncellendi
refactor(shared): HealthDto tipine timestamp eklendi
```

**Geçerli tipler:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

**Kapsam (scope) örnekleri:** `backend`, `mobile`, `shared`, `ai`, `db`, `ci`

### Pre-commit Hook

Her commit'te otomatik olarak çalışır:

1. **lint-staged** → Değiştirdiğiniz `.js`, `.ts`, `.tsx`, `.json`, `.md` dosyalarını Prettier ile formatlar
2. **commitlint** → Commit mesajınızın Conventional Commits formatına uygun olup olmadığını kontrol eder

> 💡 Eğer commit reddedilirse, hata mesajını okuyup mesajı düzeltin.

### Pull Request Süreci

1. Feature branch'inize commit'lerinizi yapın
2. GitHub'da Pull Request açın (`feature/xxx` → `main`)
3. CI otomatik çalışır: `pnpm check` (format + typecheck + lint + build + AI check)
4. CI geçerse ve review alırsanız, merge edin

---

## 9. CI/CD Pipeline

### PR Checks (Her PR'da)

`.github/workflows/pr-checks.yml` — Otomatik kalite kontrolü:

```
✅ Prettier format kontrolü
✅ Shared build
✅ Backend typecheck + lint + build
✅ Mobile typecheck + lint
✅ AI format + lint + typecheck
```

Herhangi biri başarısız olursa PR merge edilemez.

### Staging DB Push (main'e merge'de)

`.github/workflows/staging-db-push.yml` — `supabase/migrations/**` değiştiğinde:

```
✅ Supabase CLI ile staging veritabanına migration push
```

### Staging Mobile OTA Update (main'e merge'de)

`.github/workflows/staging-mobile-update.yml` — `mobile/**` veya `shared/**` değiştiğinde:

```
✅ EAS Update ile staging channel'a OTA güncelleme yayınla
```

Telefonunuzdaki staging build (preview profili) otomatik olarak yeni JS kodunu indirir.
Yeni native kütüphane eklenmediyse yeniden build gerekmez.

### Gerekli GitHub Secrets

Repo Settings → Secrets and variables → Actions:

| Secret                  | Açıklama                     |
| ----------------------- | ---------------------------- |
| `SUPABASE_ACCESS_TOKEN` | Supabase CLI access token    |
| `SUPABASE_PROJECT_REF`  | Staging proje referans ID'si |
| `SUPABASE_DB_PASSWORD`  | Staging DB şifresi           |
| `EXPO_TOKEN`            | EAS CLI access token         |

---

## 10. Deployment (Staging)

### Backend → Render

Render, `main` branch'e push'ta otomatik deploy eder.

| Ayar              | Değer                       |
| ----------------- | --------------------------- |
| **Build Command** | `pnpm deploy:backend:build` |
| **Start Command** | `pnpm deploy:backend:start` |
| **Node Version**  | `20.20.0`                   |

Render Dashboard → Environment Variables:

```
PORT=3000
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<staging service role key>
```

### Mobile → EAS

```bash
# Development build (dahili test):
eas build --profile development --platform android

# Staging/Preview build (ilk kurulumda 1 kez gerekli):
eas build --profile preview --platform android
```

İlk preview build alındıktan sonra `mobile/` veya `shared/` değişikliklerinde
otomatik OTA update yayınlanır (yeni build gerekmez).

EAS Secrets (`eas secret:create`):

```
EXPO_PUBLIC_API_BASE_URL_STAGING=https://backend-staging-ws0f.onrender.com
```

> ⚠️ Yeni native kütüphane eklediyseniz (kamera, push notification vb.)
> yeni bir `eas build --profile preview` almanız gerekir.

### AI Services → (Gelecekte)

`ai-services/Dockerfile` hazır. Deploy platformu henüz belirlenmedi.

---

## 11. Sorun Giderme (FAQ)

### ❌ `pnpm db:start` — "Cannot connect to the Docker daemon"

**Çözüm**: Docker Desktop'u başlatın ve çalıştığından emin olun.

```bash
docker info   # Docker çalışıyorsa bilgi gösterir
```

---

### ❌ `pnpm dev:backend` — "SUPABASE_URL is missing" veya "SUPABASE_SERVICE_ROLE_KEY is missing"

**Çözüm**: `.env` dosyanızda bu değişkenler boş veya eksik.

```bash
pnpm db:status   # key'leri buradan kopyalayın
```

---

### ❌ `pnpm install` — "ERR_PNPM_UNSUPPORTED_ENGINE"

**Çözüm**: Yanlış Node versiyonu kullanıyorsunuz.

```bash
node -v          # 20.20.0 olmalı
nvm use          # .nvmrc'den doğru versiyonu yükler
```

---

### ❌ Mobile'da "Network request failed"

**Çözüm**: `.env` dosyanızdaki `EXPO_PUBLIC_API_BASE_URL` yanlış.

- Android Emülatör: `http://10.0.2.2:3000`
- iOS Simulator: `http://localhost:3000`
- Gerçek cihaz: `http://<bilgisayar_IP>:3000` (aynı Wi-Fi ağında olmalı)

---

### ❌ `pnpm ai:lint` — "ruff: command not found"

**Çözüm**: Python venv aktif değil.

```bash
# Windows:
ai-services\.venv\Scripts\Activate.ps1

# macOS/Linux:
source ai-services/.venv/bin/activate

# Sonra tekrar:
pnpm ai:lint
```

---

### ❌ Commit reddedildi — "commitlint"

**Çözüm**: Mesaj formatınız yanlış. Conventional Commits formatını kullanın:

```bash
# ❌ Yanlış:
git commit -m "login düzeltildi"

# ✅ Doğru:
git commit -m "fix(mobile): login ekranında crash düzeltildi"
```

---

### ❌ `pnpm build:shared` — Hata veriyor

**Çözüm**: `shared/src/index.ts` dosyasında TypeScript hatası olabilir.

```bash
pnpm -C shared typecheck   # Hatayı detaylı görmek için
```

---

### ❌ `pnpm -C backend build` başarısız, ama `typecheck` geçiyor

**Çözüm**: `shared` paketi build edilmemiş olabilir (backend, shared'ın `dist/` çıktısına bağlı).

```bash
pnpm build:shared   # Önce shared'ı build edin
pnpm -C backend build
```

---

### ❌ Metro bundler crash / "Unable to resolve module @fa/shared"

**Çözüm**: Shared paketi build edilmemiş veya Metro cache bozulmuş.

```bash
pnpm build:shared
# Metro cache temizle:
pnpm -C mobile start --clear
```

---

> 📬 Başka bir sorunla karşılaşırsan, ekip kanalında paylaş.
> Bu rehber, karşılaşılan sorunlarla birlikte güncellenecektir.
