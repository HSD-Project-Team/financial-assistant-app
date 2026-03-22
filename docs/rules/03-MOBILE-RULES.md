# Mobile (React Native & Expo) Geliştirme Kuralları

Bu belge, `mobile/` klasörü altında Expo, React Native ve TypeScript kullanarak uygulama geliştirirken ekibin uyması gereken dosya sınırlarını, adlandırma kurallarını ve performans pratiklerini içerir.

## 1. Klasör Yapısı ve Dosya Sınırları

Tüm ekranlar, bileşenler ve yardımcı araçlar `mobile/src/` altında kendi klasörlerinde tutulur. Sayfalar (Screens) ayrı, onlara ait küçük bileşenler (Components) ayrı olarak yönetilmelidir.

```text
mobile/src/
├── screens/        # Uygulama ekranları (Ör: LoginScreen.tsx, DashboardScreen.tsx)
├── components/     # Tekrar kullanılabilen UI bileşenleri (Ör: FeatureButton.tsx)
├── navigation/     # React Navigation (veya Expo Router) tanımları
├── hooks/          # Özel (Custom) React hooksları (Ör: useAuth.ts)
├── store/          # Zustand / Redux / Context API gibi global state yönetimi
├── utils/          # Yardımcı fonksiyonlar (tarih formatlama, para birimi vb.)
├── services/       # Backend API isteklerinin (Axios/Fetch) yapıldığı servisler
└── theme/          # Renk, font, aralık (spacing) ve genel stil sabitleri (Ör: colors.ts)
```

### Sınır (Boundary) Kuralları:

1. **Screens:** İlgili sayfanın iskeletini çizer. Ekranda çok fazla Logic (if/else ağaçları vb.) bulundurmaktan kaçının; bu tür işlemleri `hooks/` veya `store/` tarafına aktarın.
2. **Components:** Sayfa (Screen) içinde kullanılan buton, kart, input gibi görsel öğelerdir. Verileri "props" aracılığıyla almalıdır (Dumb Component). **Kendi içlerinde servise (Backend'e) istek atmamaları tercih edilir (istisnalar hariç).**
3. **Services (API Çağrıları):** Komponentin içinde direkt `axios.get` veya `fetch` kullanmayın. `src/services/api.ts` veya ilgili `hooks` üzerinden asenkron çağırma işlemi yapın.
4. **Types (Shared):** Eğer `interface User { ... }` backend ve mobil için ortaktır diyorsanız, `mobile/src/types` içine yazmak yerine dış paket `shared/` içine ekleyin. Sadece mobil tasarımsal props ve tipleri (ör: `ButtonProps`) kendi `components/` klasörünüzde tanımlayın.

---

## 2. Kodlama Pratikleri ve Performans

### A. Tip Güvenliği (TypeScript)

- `any` kesinlikle yasaktır, tipi bilinmeyen yerlerde `unknown` veya `Generics` kullanılmalıdır.
- Props tanımlarında mutlaka `interface` veya `type` kullanılmalıdır.
  ```tsx
  interface ICardProps {
    title: string;
    description?: string; // Opsiyonel
    onPress: () => void;
  }
  const CustomCard = ({ title, description, onPress }: ICardProps) => { ... };
  ```

### B. Stil ve Tema (Styling)

- Ekran içerisine sabit renk kodları (ör: `#FF5733`) yazmak yasaktır. Tamamı `theme/colors.ts` gibi bir yapıda saklanıp oradan çağrılmalıdır. Aksi halde karanlık / aydınlık mod (Dark/Light Mode) veya marka değişikliği saatler alır.
- İç satırlık (`inline-style`) kullanımlardan (`style={{ margin: 10 }}`) kaçının; çünkü her render'da yeniden obje oluşturulmasına yol açar. Her zaman `StyleSheet.create` kullanın.

  ```tsx
  import { StyleSheet } from 'react-native';
  import { colors } from '../theme/colors';

  const styles = StyleSheet.create({
    container: { backgroundColor: colors.background, padding: 16 },
  });
  ```

### C. State (Durum) Yönetimi

- **React.useState** sadece o componenti (sayfayı) ilgilendiren kısa süreli durumlar (Ör: "input değeri", "loading görünümü") için kullanılmalıdır.
- Ekranlar arası gezilecek veri (Ör: Oturum açmış kullanıcının ID'si, sepet bilgisi) için Global State (`store/`) kullanılmalıdır.

---

## 3. Expo & Geliştirme İpuçları

- Uygulamanın Backend ile haberleşebilmesi için `mobile/` klasörü altına da ilgili ortam değişkenlerinizi (`.env`) koymayı unutmayın.
- Log, uyarı veya hata ayıklamak için `console.log` kullanabilirsiniz, ancak PR açmadan önce gereksiz logların temizlendiğinden emin olun.
- Asset (resim, ikon vb.) kullanımında, orijinal dosya boyutlarına (KB) dikkat edin (büyük dosyalar uygulamanın indirme boyutunu ve render süresini ciddi arttırır). Görseller `assets/` klasöründe düzenli tutulmalıdır.
