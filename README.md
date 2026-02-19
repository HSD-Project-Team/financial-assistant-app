# Finance Assistant — Monorepo

Tam yığın (full-stack) finans asistanı uygulaması.

| Servis          | Teknoloji                            | Dizin          |
| --------------- | ------------------------------------ | -------------- |
| **Backend**     | Node.js · TypeScript · Express       | `backend/`     |
| **Mobile**      | React Native · TypeScript · Expo     | `mobile/`      |
| **AI Services** | Python · FastAPI                     | `ai-services/` |
| **Shared**      | TypeScript (ortak tipler & sabitler) | `shared/`      |
| **Database**    | Supabase (PostgreSQL)                | `supabase/`    |

## Hızlı Başlangıç

Detaylı kurulum ve günlük geliştirme rehberi için → **[DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)**

```bash
# 1) Repo'yu klonla
git clone <repo-url> && cd infra

# 2) Bağımlılıkları yükle
pnpm install

# 3) .env dosyasını oluştur
Copy-Item .env.example .env   # Windows
# cp .env.example .env        # macOS/Linux

# 4) Lokal veritabanını başlat (Docker gerekli)
pnpm db:start

# 5) Backend'i çalıştır
pnpm dev:backend
```

## Ortamlar

| Ortam       | Backend          | Mobile          | Database          |
| ----------- | ---------------- | --------------- | ----------------- |
| **Lokal**   | `localhost:3000` | Expo Dev Client | Supabase (Docker) |
| **Staging** | Render           | EAS Build       | Supabase Cloud    |

## Scriptler

```bash
pnpm dev           # DB + Backend
pnpm dev:all       # DB + Backend + Mobile (eşzamanlı)
pnpm check         # Format + Typecheck + Lint + Build (tümü)
pnpm db:start      # Lokal Supabase başlat
pnpm db:stop       # Lokal Supabase durdur
```

Tüm script listesi için `package.json` → `scripts` bölümüne bakın.

