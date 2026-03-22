# Git ve GitHub İş Akışı Kuralları (Git Workflow)

Projede çok kişi çalışıyoruz. Herkesin ne yaptığını anlayabilmesi, kod çakışmalarının (merge conflict) minimuma inmesi ve süreçlerin sorunsuz ilerlemesi için aşağıdaki kurallara **kesinlikle** uyulmalıdır.

## 1. Branch (Dallanma) İsimlendirme Kuralları

Her yeni özellik, hata düzeltmesi veya belge güncellemesi için **mutlaka yeni bir branch** açılmalıdır. `main` veya `master` branch'inde doğrudan çalışmak **yasaktır**.

### Format: `<tür>/<görev-kodu>-<kısa-açıklama>`

**Türler:**

- `feat/`: Yeni bir özellik (feature) geliştirilirken.
- `fix/`: Bir hata (bug) düzeltilirken.
- `chore/`: Kodda işlevsel değişiklik yapmayan (ör. konfigürasyon, paket güncellemesi) işler için.
- `docs/`: Sadece dokümantasyon, `.md` güncellemeleri için.
- `refactor/`: Mevcut kodun yapısını, işleyişini değiştirmeden iyileştirirken.
- `hotfix/`: Canlıdaki acil hataların çözümü için (Doğrudan main'den çıkılır).

**Örnekler:**

- ✅ `feat/auth-login-screen`
- ✅ `fix/user-profile-crash`
- ✅ `chore/update-pnpm-packages`
- ❌ `yeni-ozellik` (Tür belirtilmemiş)
- ❌ `bartu-calisma` (Kişi ismi kullanmayın, işin adını kullanın)

---

## 2. Commit Atma Kuralları (Conventional Commits)

Projede [Conventional Commits](https://www.conventionalcommits.org/) formatı zorunludur. `commitlint` aracı mesajları otomatik kontrol eder ve yanlışsa reddeder.

### Format: `<tip>(<kapsam>): <kısa-açıklama>`

**Tip:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`
**Kapsam (Scope):** `backend`, `mobile`, `shared`, `ai`, `db`, `ci`, `docs` vb. Değişikliğin yapıldığı ana klasör veya modül.

**Kurallar:**

1. Mesajın tamamı **küçük harfle** başlamalıdır. (İlk harf küçük)
2. Açıklama kısmı geniş zaman veya emir kipi gibi net olmalıdır (ör. "eklendi" demek yerine "add useAuth hook" veya "kullanici giris fonksiyonu eklendi").
3. Commit mesajları gereksiz uzun olmamalı (maksimum 72 karakter ideali), detaylı açıklama gerekiyorsa commit gövdesine (body) yazılmalıdır.

**Örnekler:**

- ✅ `feat(mobile): kullanıcı giriş ekranı tasarımı tamamlandı`
- ✅ `fix(backend): token doğrulamasındaki null hatası çözüldü`
- ✅ `refactor(shared): HealthDto arayüzü güncellendi`
- ❌ `Fix login` (Format yanlış, tip ve kapsam yok)
- ❌ `feat(Mobile): KULLANICI GİRİŞ EKLENDİ` (Büyük harfle başlanmaz ve yazılmaz)

---

## 3. Pull Request (PR) Açma ve Yönetme Kuralları

PR'lar, kodun `main` branch'ine dahil edilmeden önce gözden geçirildiği yerdir. Kaliteli kod için düzgün bir PR süreci şarttır.

1. **PR İsimlendirmesi:** Commit formatıyla aynı mantıkta olmalıdır. Ör: `feat(mobile): Kullanıcı Kayıt Ekranı ve Entegrasyonu`
2. **PR Açıklaması (Description):**
   - **Ne Yaptım?**: Bu PR neleri değiştiriyor/ekliyor? Kısaca açıklayın.
   - **Neden Yaptım?**: Amacı nedir? Varsa Jira/Trello iş kaydının linkini ekleyin.
   - **Nasıl Test Edilir?**: Review yapacak kişi bunu bilgisayarında nasıl test edebilir? Adım adım anlatın.
   - **Ekran Görüntüleri/Video**: Özellikle `mobile` tarafında yapılan arayüz değişiklikleri için mutlaka ekran kaydı veya ekran görüntüsü ekleyin (çok kişinin çalıştığı projede herkes her yeri ayağa kaldırıp göremez, görsel sunmak zaman kazandırır).

### Örnek PR Şablonu:

```markdown
## Ne Yaptım?

- Mobile tarafında giriş ekranı (LoginScreen) eklendi.
- Backend tarafına `/auth/login` endpoint'i bağlandı.

## Nasıl Test Edilir?

1. `pnpm dev` ile backend ve DB'yi ayağa kaldırın.
2. `pnpm dev:mobile` komutunu çalıştırın.
3. Giriş ekranına giderek `test@test.com` ve `123456` şifresi ile girin.

## Ekran Görüntüleri

(Arayüz değişikliği varsa buraya görsel ekleyin)
```

### Review (Gözden Geçirme) Kuralları

- Kendinize PR açtıktan sonra, projedeki ekipten en az **1 (tercihen 2) Developer'ı Reviewer olarak ekleyin**.
- CI kontrolleri (Github Actions, pnpm check vb.) geçmediyse o PR **merge edilemez**. Önce hataları düzeltin.
- Reviewer onay verdiğinde (Approve), kodu siz merge edin (veya branch stratejisine göre yetkili merge etsin). "Squash and Merge" yöntemini tercih etmeye çalışın ki main git log'u temiz kalsın.

---

## 4. Kod Yazarken Dikkat Edilecek Genel Pratikler

- **Sık ve Küçük Commitler:** Tüm haftalık işinizi tek bir `feat(mobile): her seyi yaptim` commiti ile göndermeyin. İşi küçük parçalara bölün (ör: ui tasarımı, api entegrasyonu, hata yönetimi).
- **Kodunuzu Yüklemeden Önce Kontrol Edin:** PR açmadan önce lokalde mutlaka `pnpm check` (veya `pnpm format`, `pnpm typecheck`) çalıştırın ve Terminalde hata olmadığını teyit edin.
- **`main` ile Senkronizasyon:** PR açmadan önce kendi branchinize `main` dalındaki son değişiklikleri çekin (`git pull origin main` veya `git rebase main`). Conflict varsa kendi branchinizde çözün, PR'da conflict olmamalı!
