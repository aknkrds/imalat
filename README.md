# Tekstil İmalat Takip ERP Sistemi

Bu proje, tekstil ve giyim üretim süreçlerinin uçtan uca takip edilmesini sağlayan modern ve ölçeklenebilir bir ERP (Kurumsal Kaynak Planlaması) sistemidir. Proje, güçlü bir NestJS backend altyapısı ve modern bir Next.js frontend arayüzünden oluşmaktadır.

Sistem; müşteri ve tedarikçi yönetiminden başlayıp, sipariş alma, numune hazırlama, kalıp ve ölçü yönetimi, satın alma, kesim, dikim, ütü-paket, sevkiyat, faturalandırma, cari hesap takibi ve sorun yönetimi gibi bir tekstil fabrikasındaki tüm süreçleri kapsar.

## Proje Klasör Yapısı

*   `backend/`: NestJS + Prisma ORM + PostgreSQL ile geliştirilmiş REST API servisleri.
*   `frontend/`: Next.js ile geliştirilmiş kullanıcı dostu yönetim paneli arayüzü.
*   `docker-compose.yml`: PostgreSQL veri tabanı ve diğer gerekli servislerin (MinIO vb.) konteyner konfigürasyonu.
*   `wsl-setup.sh` & `wsl-start.sh`: WSL (Windows Subsystem for Linux) ortamında projeyi kolayca kurmak ve çalıştırmak için betikler.

## Proje Durumu ve Planlar

Projenin mevcut durumu, devam eden işleri ve gelecek hedefleri aşağıdaki dokümanlarda detaylandırılmıştır:

1.  **[Tamamlanan Planlar / Yapılanlar (COMPLETED.md)](./COMPLETED.md)**: Sistemde halihazırda kurulmuş olan altyapıyı, veritabanı şemasını, tamamlanmış backend modüllerini ve mevcut frontend sayfalarını içerir.
2.  **[Yapılacaklar Listesi / Aktif Planlar (TODO.md)](./TODO.md)**: Yakın dönemde yapılması planlanan, özellikle frontend tarafında entegrasyonu bekleyen modülleri ve sistem geliştirmelerini içerir.
3.  **[Gelecek Yol Haritası / Yapılacak Olanlar (ROADMAP.md)](./ROADMAP.md)**: Projenin uzun vadeli vizyonunu, mobil/tarayıcı terminal uygulamalarını, müşteri portalını ve yapay zeka destekli özellikleri içerir.

---

## Başlangıç Kılavuzu

### Gereksinimler
*   Node.js (v18+)
*   Docker & Docker Compose
*   Git

### Kurulum ve Çalıştırma

1.  **Ortam Dosyalarını Hazırlayın:**
    Root klasöründeki `.env.example` dosyasını temel alarak `backend/` ve root dizininde `.env` dosyası oluşturun.

2.  **Veritabanı ve Servisleri Başlatın:**
    ```bash
    docker compose up -d
    ```

3.  **Backend'i Çalıştırın:**
    ```bash
    cd backend
    npm install
    npx prisma migrate dev
    npm run start:dev
    ```

4.  **Frontend'i Çalıştırın:**
    ```bash
    cd ../frontend
    npm install
    npm run dev
    ```
    Frontend uygulamasına tarayıcınızdan `http://localhost:3000` adresinden erişebilirsiniz.
