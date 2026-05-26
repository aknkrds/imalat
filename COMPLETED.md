# Tamamlanan Planlar / Yapılanlar

Bu dokümanda, Tekstil İmalat ERP projesinde bugüne kadar başarıyla tamamlanmış ve yayına alınmış mimari yapılar, veritabanı şemaları, backend modülleri ve frontend sayfaları listelenmiştir.

---

## 1. Veritabanı ve Mimari Altyapı (Prisma Şeması)
PostgreSQL üzerinde çalışan ve **Prisma ORM** ile yönetilen ilişkisel veritabanı modeli sıfırdan tasarlanıp kurulmuştur. Aşağıdaki tablolar ve ilişkiler tanımlanmıştır:

*   **Organizasyon (Multi-tenant):** `Organization` modeli ile gelecekte çoklu şirket desteği (SaaS) verilmesine hazır bir yapı kuruldu.
*   **Cari Rehber (Kişiler):** `Contact` tablosu üzerinden tek bir yerden hem Müşteri (CUSTOMER) hem de Tedarikçi (SUPPLIER) yönetimi sağlandı.
*   **Kullanıcı ve Rol Yönetimi (RBAC):** `User`, `Role`, `Permission`, `UserRole`, `RolePermission` tabloları ile rol bazlı yetkilendirme altyapısı hazırlandı.
*   **Dinamik İş Akışı (Workflow):** Siparişlerin hangi üretim aşamalarından geçeceğini tanımlayan `WorkflowState` ve `WorkflowTransitionDef` modelleri kuruldu.
*   **Sipariş Takibi (Orders):** Sipariş numarası, ürün detayları, termin, öncelik, iç piyasa/ihracat ayrımı, QR/barkod alanları ve toplam maliyet/fiyat özetlerini tutan ana `Order` tablosu oluşturuldu.
*   **Maliyet ve Fiyatlandırma:** Hammadde, işçilik vb. giderleri tutan `CostItem` ve kâr marjı, şirket gideri gibi kalemleri tutan `PricingItem` tabloları ilişkilendirildi.
*   **Numune ve Kritik Takibi:** Numune iterasyonları (`SampleRecord`) ve bunlara ait düzeltme/eleştiri kayıtları (`SampleCritique`) ilişkilendirildi.
*   **Kalıp ve Ölçü Tablosu:** Modelist notlarını içeren `PatternInfo` ile beden bazlı ölçü ve tolerans girişlerini tutan `MeasurementSet` / `MeasurementEntry` şeması kuruldu.
*   **Tedarik (Satın Alma):** Kumaş, aksesuar, iplik gibi malzemelerin tedarik durumunu (`ProcurementItem`) izleyen yapı kuruldu.
*   **Üretim Takibi (Kesim, Dikim, Ütü-Paket):**
    *   `CuttingRecord`: Kumaş serim pastal bilgisi, kesilen adet, kumaş firesi takibi.
    *   `ProductionRecord`: Günlük dikim adetleri, üretim hatları, hatalı ürün takibi.
    *   `IroningPackingRecord`: Ütülenen, paketlenen, koli sayısı vb. verilerin takibi.
*   **Sevkiyat ve Fatura:** Sevkiyat takip bilgileri (`ShippingRecord`) ve basitleştirilmiş fatura veri girişi (`Invoice`) tabloları tanımlandı.
*   **Cari Hesap Hareketleri:** Müşteri/tedarikçi borç-alacak durumlarını tutan `Account` ve `AccountTransaction` modelleri eklendi.
*   **Destek Yapıları:** Sorun yönetimi (`Issue`), Dosya ekleme (`FileAttachment`), siparişe dair geçmiş akış günlüğü (`TimelineEvent`), Bildirimler (`Notification`) ve loglama (`AuditLog`) şemaları tamamlandı.

---

## 2. Backend Modülleri (NestJS REST API)
Backend tarafında Prisma şemasındaki tüm tablolar için **NestJS modülleri** oluşturulmuş ve `AppModule` altına kaydedilmiştir. Aşağıdaki 24 modül aktif durumdadır:

1.  **Auth & Users & Roles:** Kullanıcı kaydı, JWT ile giriş-çıkış, rol/yetki atamaları.
2.  **Workflow:** Sipariş durumu geçiş kurallarını doğrulama ve yönetme.
3.  **Contacts:** Müşteri ve tedarikçilerin CRUD servisleri.
4.  **Orders:** Sipariş oluşturma, listeleme, güncelleme ve atama işlemleri.
5.  **Costing & Pricing:** Siparişe maliyet ekleme ve fiyatlandırma hesaplamaları.
6.  **Samples & Patterns:** Numune takip adımları ve kalıp bilgileri API'leri.
7.  **Procurement:** Malzeme satın alma durum güncelleme API'leri.
8.  **Cutting & Production & IroningPacking:** Kesim, dikim ve paketleme istasyonlarından veri girişi sağlayan servisler.
9.  **Shipping & Invoices & Accounting:** Sevkiyat oluşturma, fatura kaydı ve cari hesap hareketleri (debit/credit) yönetimi.
10. **Issues:** Üretim esnasında karşılaşılan sorunları bildirme, yorum yapma ve kapatma servisleri.
11. **Timeline & Notifications & Files & Audit:** Sistem içi olay akışı, bildirim gönderme, dosya yükleme (MinIO entegrasyonu hazırlığı) ve denetim izi günlükleri.
12. **Qrcode & Reports:** Siparişe özel QR kod üretimi ve yönetici istatistik raporları API'leri.

---

## 3. Frontend Geliştirmeleri (Next.js Arayüzü)
Frontend tarafında Next.js projesi kurulmuş ve temel yönetim paneli (dashboard) mimarisi oluşturulmuştur:

*   **Kimlik Doğrulama:** Giriş (Login) ekranı arayüzü tasarlandı.
*   **Yönetim Paneli Düzeni (Dashboard Layout):**
    *   Mobil uyumlu, daraltılabilir yan menü (Sidebar - Dashboard, Siparişler, Cari Rehber vb.).
    *   Üst bar (Topbar) - Kullanıcı profili, bildirim ikonu.
*   **Cari Rehber Sayfası (`/dashboard/contacts`):**
    *   Tüm müşterilerin ve tedarikçilerin listelendiği, arama ve filtreleme yapılabilen dinamik tablo.
    *   Yeni müşteri/tedarikçi ekleme ve mevcut kişileri düzenleme modalları/formları.
    *   Veritabanı entegrasyonu ve durum yönetimi.
*   **Sipariş Yönetimi Sayfası (`/dashboard/orders`):**
    *   Aktif siparişlerin listelendiği, öncelik ve aşama durumuna göre renkli etiketlerin kullanıldığı sipariş takip listesi.
    *   **Yeni Sipariş Ekleme Formu (`/dashboard/orders/new`):** Müşteri seçimi, ürün adı, adet, termin tarihi, pazar türü (iç piyasa/ihracat), kumaş bilgileri ve renk/beden gibi detayların girilebildiği form yapısı.
