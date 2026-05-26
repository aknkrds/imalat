# Gelecek Yol Haritası / Yapılacak Olanlar

Bu dokümanda, Tekstil İmalat ERP sisteminin orta ve uzun vadeli gelişim hedefleri, sisteme eklenecek ileri düzey özellikler ve teknolojik genişleme planları listelenmiştir.

---

## 1. Atölye İçin Mobil / El Terminali Arayüzü (PWA)
Atölye zeminindeki kesim, dikim ve paketleme personellerinin bilgisayar kullanması zor olduğu için mobil cihazlara uyumlu el terminali ekranları tasarlanacaktır.
*   **Barkod/QR Okuyucu:** Telefon kamerası üzerinden kumaş toplarının veya kesim demetlerinin üzerindeki QR kodları taratarak durum güncellemesi yapma.
*   **Hızlı Üretim Girişi:** İşçilerin sadece kendi istasyonlarını seçip "Bugün 50 adet dikildi" gibi hızlı veri girişi yapabileceği sadeleştirilmiş mobil arayüz.
*   **Çevrimdışı Mod (Offline Sync):** İnternet bağlantısı kesildiğinde verileri yerelde tutup bağlantı sağlandığında backend ile senkronize etme yeteneği.

## 2. Müşteri Takip ve Onay Portalı (Client Portal)
Müşterilerin kendi siparişlerinin durumunu şeffaf bir şekilde izleyebileceği dışarıya açık bir panel geliştirilecektir.
*   **Sipariş Durum İzleme:** Müşterinin siparişinin o an kesimde mi, dikimde mi yoksa sevkiyatta mı olduğunu canlı grafiklerle görmesi.
*   **Numune Eleştiri (Critique) Girişi:** Müşterinin gönderilen numuneleri inceleyip doğrudan sistem üzerinden "Kol boyu 2 cm uzatılacak" gibi yorum ve onay girmesi.
*   **Fatura & İrsaliye İndirme:** Müşterinin cari hesap durumunu görmesi ve kendi faturalarını PDF olarak indirebilmesi.

## 3. AI Destekli Maliyet ve Fire Tahminleme (AI Costing)
Sistemde biriken geçmiş üretim verileri kullanılarak yapay zeka tabanlı tahminleme algoritmaları entegre edilecektir.
*   **Hammadde İhtiyacı Tahmini:** Yeni bir model girildiğinde, benzer modellerin geçmiş verilerine dayanarak ne kadar kumaş ve aksesuar harcanacağını tahmin etme.
*   **Optimum Fire Oranı:** Kumaş türüne ve beden dağılımına göre oluşabilecek fire oranını önceden hesaplayarak maliyet tablolarını optimize etme.
*   **Zaman Tahminleme:** Siparişin dikim süresini ve teslim tarihini fabrikadaki mevcut iş yoğunluğuna ve geçmiş çalışan performanslarına bakarak yapay zeka ile tahmin etme.

## 4. Mesajlaşma Servisleri Entegrasyonu (WhatsApp & SMS)
Sistem içi kritik olayların anlık olarak ilgili kişilere dış kanallar üzerinden iletilmesi sağlanacaktır.
*   **Müşteriye WhatsApp Bildirimleri:** "Siparişiniz yola çıktı, takip numarası: ..." gibi bilgilendirmelerin otomatik WhatsApp mesajı olarak müşteriye gönderilmesi.
*   **Yöneticiye Gecikme Alarmları:** Termini yaklaşan fakat üretimi geciken siparişlerin yöneticilere SMS veya Slack bildirimi olarak gönderilmesi.
*   **Tedarikçi Sipariş Formu:** Tedarikçilere onaylanan satın alma listelerinin otomatik PDF formatında e-posta veya mesajla gönderilmesi.

## 5. İleri Düzey İş Zekası (BI) ve Performans Raporları
Yöneticilerin fabrikanın finansal ve operasyonel verimliliğini analiz edebileceği gelişmiş raporlama araçları eklenecektir.
*   **Hattın Verimlilik Analizi (OEE):** Dikim hatlarının günlük hedeflere ulaşma oranları ve makine duruş sürelerinin analizi.
*   **Tedarikçi Performans Skoru:** Tedarikçilerin teslimat süreleri, gelen malzemelerdeki hata oranları ve fiyat kararlılık puanlarının raporlanması.
*   **Finansal Kârlılık Analizi:** Sipariş bazlı tahmini maliyet ile gerçekleşen maliyetlerin karşılaştırılması, net kâr marjı analiz grafikleri.

## 6. SaaS ve Çoklu Şirket Altyapısı (Multi-tenancy Isolation)
ERP sisteminin diğer tekstil firmalarına bulut tabanlı bir hizmet (SaaS) olarak sunulabilmesi için altyapı iyileştirmesi yapılacaktır.
*   **Veri İzolasyonu:** Her firmanın veritabanı seviyesinde veya mantıksal şema seviyesinde güvenli bir şekilde ayrıştırılması.
*   **Abonelik ve Ödeme Entegrasyonu:** Stripe veya iyzico gibi ödeme sistemlerinin entegre edilerek aylık/yıllık paket satışı altyapısının kurulması.
