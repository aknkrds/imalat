# Yapılacaklar Listesi / Aktif Planlar

Bu dokümanda, ERP sisteminin tamamlanması için yakın dönemde yapılması planlanan, ağırlıklı olarak backend servislerinin frontend (Next.js) arayüzüne entegre edilmesini kapsayan aktif görevler listelenmiştir.

---

## 1. Frontend Arayüz Entegrasyonları (Dashboard Modülleri)

### [ ] Sipariş Detay ve İş Akışı (Workflow Board)
*   **Amaç:** Siparişlerin durumunu izlemek ve değiştirmek.
*   **Görevler:**
    *   Sipariş detay sayfası (`/dashboard/orders/[id]`) oluşturulması.
    *   Sipariş durumunu değiştirecek dinamik durum geçiş butonlarının eklenmesi.
    *   İş akışı kurallarına göre geçiş sırasında not veya fotoğraf yükleme zorunluluğu doğrulamalarının yapılması.
    *   Tüm siparişlerin aşamalarına göre listelendiği sürükle-bırak (Kanban Board) arayüzünün yapılması.

### [ ] Maliyet ve Fiyatlandırma Paneli (Costing & Pricing)
*   **Amaç:** Sipariş maliyet girdilerini ve müşteriye verilecek teklif tutarını hesaplamak.
*   **Görevler:**
    *   Sipariş detayında "Maliyet Hesaplama" sekmesi eklenmesi.
    *   Kumaş, aksesuar, kesim işçiliği, dikim işçiliği, ütü-paket, nakliye gibi kategorilerde dinamik satır ekleme/silme yapılabilen maliyet tablosu.
    *   Şirket genel gider payı (%) ve kâr marjı (%) eklenerek birim teklif fiyatının otomatik hesaplanması.

### [ ] Kalıp ve Ölçü Tablosu Editörü (Patterns & Measurements)
*   **Amaç:** Ürün ölçü tablosunun (Beden kartı) ve modelist kalıp bilgilerinin girilmesi.
*   **Görevler:**
    *   Bedenlere göre (XS, S, M, L, XL vb.) ve ölçü yerlerine göre (göğüs, bel, boy vb.) ± tolerans değerlerini içeren dinamik veri tablosu grid yapısının kurulması.
    *   Modelist notları, birim ürün kumaş sarfiyatı (metre/adet) gibi kalıp bilgilerinin girilebileceği formlar.

### [ ] Malzeme Talep ve Tedarik Takibi (Procurement)
*   **Amaç:** Üretim için gerekli olan malzemelerin tedarik sürecini yönetmek.
*   **Görevler:**
    *   Satın alma departmanı için onaylanan siparişlerden otomatik düşen malzeme talep listesi arayüzü.
    *   Tedarikçilere sipariş geçildiğinde durumun "PENDING"den "ORDERED"a çekilmesi.
    *   Gelen malzemelerin depo girişini yapmak için miktar güncelleme ekranı ("RECEIVED QTY").

### [ ] Üretim Takip Giriş Ekranları (Cutting, Production, Ironing-Packing)
*   **Amaç:** Atölye çalışanlarının veya şeflerin üretim adetlerini sisteme girmesi.
*   **Görevler:**
    *   **Kesim Ekranı:** Pastal sayısı, kesim adeti ve kumaş fire oranının girildiği form.
    *   **Dikim Ekranı:** Günlük dikilen adet ve hatalı ürün adetlerinin girildiği üretim hattı takip arayüzü.
    *   **Ütü-Paket Ekranı:** Ütülenen, katlanan ve paketlenen adetler ile koli/kutu sayılarının girildiği alanlar.

### [ ] Sevkiyat ve Fatura Bilgi Girişi (Shipping & Invoices)
*   **Amaç:** Tamamlanan ürünlerin sevk edilme ve faturalanma bilgilerini kaydetmek.
*   **Görevler:**
    *   Sevkiyat yöntemi (kargo, konteyner vb.), takip numarası, paket sayısı ve nakliye maliyetinin girildiği form.
    *   Satış ve alış fatura bilgilerinin (kDV hariç, kDV dahil tutar, fatura no, fatura tarihi) girilebileceği fatura kayıt paneli.

### [ ] Cari Hesap & Finans Yönetimi (Accounts)
*   **Amaç:** Müşteri ve tedarikçilerin borç/alacak ve ödemelerini takip etmek.
*   **Görevler:**
    *   Cari Hesap Kartları listesi.
    *   Ödeme alma (Tahsilat) ve ödeme yapma işlemlerinin kaydedildiği cari hareket ekranı.
    *   Bakiye durumlarının EUR, USD, TRY cinsinden gösterilmesi.

### [ ] Hata ve Sorun Yönetimi (Issues)
*   **Amaç:** Üretimde çıkan kalite problemlerini veya gecikmeleri raporlamak.
*   **Görevler:**
    *   Üretim esnasında karşılaşılan sorunları görsel (fotoğraf) yükleyerek bildirme formu.
    *   Sorunlara yorum yazma ve durumunu (Açık, Çözülüyor, Çözüldü) güncelleme paneli.

---

## 2. Sistem Geliştirmeleri ve Entegrasyonlar

### [ ] MinIO / S3 Dosya Yükleme Entegrasyonu
*   **Backend:** Upload controller'ının MinIO sunucusu ile entegre edilmesi.
*   **Frontend:** Sipariş, numune kritik ve sorun ekranlarında sürükle-bırak (drag-and-drop) dosya yükleme bileşeninin yapılması.

### [ ] QR Kod Üretimi ve Yazdırma Servisi
*   **Backend:** Sipariş kartı oluşturulduğunda benzersiz QR kod üreten servisin tamamlanması.
*   **Frontend:** İlgili siparişin atölye takip kartının (refakat kartı) QR kod ile birlikte yazdırılabilir (Print-friendly PDF) çıktısının hazırlanması.

### [ ] WebSocket ile Canlı Bildirimler
*   **Backend:** NestJS Gateway kurulumu.
*   **Frontend:** Kritik durum değişikliklerinde (örn: yeni sorun bildirildiğinde veya numune onaylandığında) ekranın sağ üstünde canlı bildirim (toast message) gösterilmesi.
