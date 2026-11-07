# MFÇ — Yazılım ve Yapay Zekâ Çözümleri

Hizmet sitesi: https://m-fatih-c.github.io/cozumler/

Kaynak, sahibinin `/web _sitesi` adlı önceki yerel tasarımından revize edilmiştir.
Orijinal klasör değiştirilmemiştir. Kişisel proje portföyü ayrı adreste kalır:
https://m-fatih-c.github.io/tr/

## Çalıştırma

Node 22.23.4 ile, ek npm bağımlılığı kurmadan:

```sh
npm run build
python3 -m http.server 4332 --bind 127.0.0.1 --directory dist
```

Üretimde GitHub Pages proje yolu `/cozumler/` kullanılır; site içi varlıklar
bu yolla uyumlu göreli adresler kullanır. Canonical, sosyal görsel ve sitemap
adresleri yayın yoluna göre tanımlıdır. Yayın workflow'u main dalından çalışır.

## İçerik ve etkileşimler

Hizmetler, portföye bağlı gerçek proje örnekleri, kapsam ve çalışma süreci.
Güncelliği teyit edilmemiş ücret/süre aralıkları ve yanıt süresi garantileri kaldırıldı.
Unvan ve teknik kapsam sahibinin paylaştığı CV ve proje açıklamalarına dayalıdır.

- Belge örneği: düzenlenebilir metni tarayıcıda kurallarla ayrıştırır, eksik/geçersiz
  alanları bildirir. PDF yükleme veya OCR değildir. Pozitif tutarlar tamsayı alt
  birimlerle tutulur. CSV çıktısı hücre formüllerini etkisizleştirir.
- Kaynakla yanıtlama: gösterimde görünen üç örnek belge maddesine bağlı sabit
  yanıtlar. Canlı AI/model/vektör araması yoktur; arayüzde açıkça belirtilir.
- Kayıt örneği: bellek içi tablolar, ekleme/sıfırlama ve görünen kayıtları CSV alma.
- Görüntü örneği: temsili iş akışı çizimi; kamera, yüz tanıma veya gerçek çıkarım yoktur.
- Görüşme aracı: e-posta taslağı üretir. Sunucuya gönderim veya başarı yanılsaması
  yoktur; ziyaretçi e-posta uygulamasını açar ve gönderimi orada yapar.

Ziyaretçi girdileri fetch, analytics, çerez veya tarayıcı depolamasına bağlanmaz.
Yerel metin işlemleri gerçek müşteri belgesiyle kullanılacak üretim uygulaması
olarak sunulmaz. Yazı tipleri yereldir. Animasyonlar kısa ve sonludur; azaltılmış
hareket tercihi korunur. İçerik JavaScript kapalıyken de görünür kalır.

## Kaynak ve lisanslar

Manrope ve Space Grotesk: SIL OFL 1.1, metinler `assets/licenses/` altında.
MFÇ görseli sahibi tarafından kullanım için sağlanmıştır. Önceki tasarım ve kaynak
sahibinindir; bu yayımla yeni bir yeniden kullanım lisansı verilmez.

`npm test`: ayrıştırma, tarih/tutar hataları, CSV güvenliği ve eklenen kayıtların
aktarımı için 7 test. `npm run check`: kaynak referansları, çapa/ARIA eşleşmeleri,
yapısal veri ve eski/özel değer kontrolleri. `npm run build` ikisini de çalıştırır.
