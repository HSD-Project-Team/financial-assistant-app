# AI Services - Financial Assistant 🤖💸

Bu dizin, finans asistanı mobil uygulamamızın yapay zeka tabanlı (LLM) özelliklerini besleyen Python/FastAPI tabanlı mikro servistir. Kullanıcı harcamalarını analiz edip finansal tavsiyeler üretmek amacıyla tasarlanmıştır.

## 🏗️ Proje Mimarisi (Dizin Yapısı)

- `app/main.py`: Uygulamanın giriş noktası (CORS ve Health Check burada).
- `app/routers/`: API endpoint'lerinin (örn: `/chat`) tanımlandığı yer.
- `app/services/`: İş mantığının ve dış servis (OpenAI vb.) entegrasyonlarının yapıldığı yer.
- `app/models/`: Pydantic ile veri doğrulama şemalarının (Request/Response) tutulduğu yer.

## 🛠️ Kullanılan Teknolojiler

- **FastAPI:** Yüksek performanslı asenkron web çatısı.
- **Uvicorn:** ASGI web sunucusu.
- **Pydantic:** Veri doğrulama (Data validation).
- **HTTPX:** Asenkron HTTP istemcisi (LLM API çağrıları için).

## 🚀 Geliştirme Ortamı Kurulumu (Lokal)

Bu servisi lokalinizde çalıştırmak için aşağıdaki adımları sırasıyla uygulayın. (Tüm komutlar `ai-services` dizini içinde çalıştırılmalıdır).

**1. Sanal Ortamı (Virtual Environment) Oluşturun ve Aktif Edin:**
\`\`\`bash

# Mac/Linux için

python3 -m venv venv
source venv/bin/activate

# Windows için

python -m venv venv
venv\Scripts\activate
\`\`\`

**2. Bağımlılıkları Yükleyin:**
\`\`\`bash
pip install -r requirements.txt
\`\`\`

**3. Çevresel Değişkenleri Ayarlayın:**
\`.env.example\` dosyasını kopyalayarak \`.env\` dosyası oluşturun ve içindeki API anahtarlarını kendinize göre düzenleyin.
\`\`\`bash
cp .env.example .env
\`\`\`

**4. Sunucuyu Başlatın:**
\`\`\`bash
uvicorn app.main:app --reload
\`\`\`

## 🩺 Servis Durumu Kontrolü (Health Check)

Sunucu başarıyla başladığında, tarayıcınızdan veya terminalden servisin ayakta olup olmadığını kontrol edebilirsiniz:

- **URL:** `http://127.0.0.1:8000/health`
- **Beklenen Yanıt:** `{"status": "ok"}`
