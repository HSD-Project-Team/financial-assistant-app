# Python (FastAPI & AI Services) Geliştirme Kuralları

Bu belge, `ai-services/` klasörü altında Python, FastAPI ve Supabase teknolojilerini kullanan servislerin geliştirilme aşamasındaki dosya sınırlarını, mimarisini ve kurallarını içerir.

## 1. Klasör Yapısı ve Dosya Sınırları

Python servisinde proje organizasyonunun düzeni, modüller halinde çalışılmasını sağlar. (Package-based layout kavramını baz alır).

```text
ai-services/
├── app/                  # Asıl FastAPI uygulamasının dizini
│   ├── api/              # Tüm route'lar (endpointler)
│   │   ├── endpoints/    # Spesifik HTTP operasyonları
│   │   └── dependencies.py # Ortak bağımlılıklar (Özel auth vb.)
│   ├── core/             # Konfigürasyonlar (config.py), güvenlik (security.py)
│   ├── models/           # Veritabanı (SQLAlchemy veya Pydantic) modelleri
│   ├── schemas/          # Pydantic schemaları (Gelen giden veri validate için)
│   ├── services/         # İş mantığı (Business logic). LLM çağrıları, karmaşık hesaplamalar.
│   ├── .env              # Lokal ortam değişkenleri (gitignore dahilinde edilir)
│   └── main.py           # FastAPI uygulaması başlatma noktası
├── pyproject.toml        # Ruff, mypy ve python ayarları
├── requirements.txt      # Prod bağımlılıkları (pip install -r requirements.txt)
└── requirements-dev.txt  # Dev (Ruff, pytest vb.) bağımlılıkları
```

### Sınır (Boundary) Kuralları:

1. **API (Route) Katmanı:** `app/api/endpoints/` altındaki fonksiyonlarda sadece HTTP işlemleri yapılmalıdır. Bu fonksiyonlar `@router.get`, `@router.post` vb. taşır. İstemciden gelen veriyi `schema` ile yakalar ve **`service` katmanına aktarır**. Katmanlar arasına kesin sınır koyun. (Route = Controller).
2. **Service Katmanı:** Gerçek işlemler; örneğin yapay zeka modelini tetikleme, Langchain kullanma veya veritabanı CRUD işlemleri (Eğer arka uçtan farklıysa) sadece burada durur. İlgili `schemas` dan aldığı tipleri veya modelleri döndürür.
3. **Schemas Katmanı:** İstemciden dönen Pydantic nesneleri ve onlara ait tipler (Ör: `UserCreateResponse`, `AIDataRequest`).
4. **Virtual Environment Katı Zorunluluğudur**: Makinenin kendi Python globaline bağımlılık (_pandas, numpy vb._) kurmak **YASAKTIR**. Hep `ai-services/.venv` içine kurulmalı, repoya o yüklenmemelidir. (_Bağımlılıklar `requirements.txt` altına eklenir_).

---

## 2. Kodlama Pratikleri ve Performans

### A. Tip Güvenliği (Mypy zorunlu)

- Python dinamik bir dildir fakat "type hints" kullanmak bu projede **ZORUNLUDUR**. Return tiplerini, parametre tiplerini `int`, `str`, `List`, `Dict`, Pydantic `BaseModel` ile belirleyin.

  ```python
  from typing import List, Optional
  from pydantic import BaseModel

  def calculate_financial_health(score: int, user_id: str) -> Optional[List[str]]:
      pass
  ```

- Terminalden de PR öncesi format için `pnpm ai:lint` ve tipler için `pnpm ai:typecheck` yapıldığından emin olun. Hata veren bir PR geçirilmeyecektir.

### B. Stil ve Tema (Ruff / PEP8)

- Python standart formatlayıcısı olarak **Ruff** kullanıyoruz (`pyproject.toml` bazından okunur).
- Değişken isimleri ve fonksiyonlar için **snake_case** kullanılmalıdır (`calculate_score`, `user_data`).
- Sınıflar (Class) için **PascalCase** kullanılmalıdır (`AICalculationService`, `UserSchema`).
- Import'ların sırası:
  1. Standart Kütüphaneler (ör: `os`, `sys`, `typing`)
  2. 3. Parti kütüphaneler (ör: `fastapi`, `pydantic`)
  3. Proje içi (Lokal) Modüller (ör: `from app.core import config`)

### C. Hata Yönetimi (Error Handling)

- Python `try-except` kalıbı kullanılmalı. Backend projesindeki gibi kullanıcıya karmaşık hatalar yansıtılmaz.
- FastAPI'nin sunmuş olduğu `HTTPException` sayesinde standart hatalar fırlatılır. İç işlerde hatanın tipini (`ValueError`, `IndexError`) belirleyip döndürebilirsiniz ancak API'den istemciye fırlatırken özel bir durum mesajı ve code statüsü vermek gereklidir:

  ```python
  from fastapi import HTTPException

  if not text_to_analyze:
      raise HTTPException(status_code=400, detail="Metin verisi boş olamaz")
  ```

---

## 3. Asenkron Geliştirme (Async / Await)

Yapay zeka (AI) fonksiyonları veya dış ağ çağrıları yavaş tepki verdiğinden, I/O işlerinde FastAPI sunucusunun kilitlenmemesi hayati önemdedir:

- Eğer dosya okuma, veritabanına bağlanma (`asyncpg` veya httpx gibi asenkron driver/istek kütüphaneleri) yapılıyorsa bunlar **kesinlikle `async def`** ile yazılmalı ve `await` edilmelidir.
- Sadece saf bilgisayar/işlemci (CPU-bound / matematik) işlemi yapan fonskiyonları `def` olarak yazın.
