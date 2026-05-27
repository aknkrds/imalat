import os
import sys
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle, PageBreak, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

def build_pdf(filename="ARCHITECTURE_PLAN.pdf"):
    # 1. Register fonts for Turkish characters support
    try:
        pdfmetrics.registerFont(TTFont('Arial', r'C:\Windows\Fonts\arial.ttf'))
        pdfmetrics.registerFont(TTFont('Arial-Bold', r'C:\Windows\Fonts\arialbd.ttf'))
        font_name = 'Arial'
        font_bold = 'Arial-Bold'
    except Exception as e:
        print(f"Arial font not found: {e}. Falling back to default Helvetica (Turkish characters might not render correctly).")
        font_name = 'Helvetica'
        font_bold = 'Helvetica-Bold'

    # 2. Setup document geometry
    # A4 dimensions: 595.27 x 841.89 points
    margin = 54 # 0.75 inch margin
    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        rightMargin=margin,
        leftMargin=margin,
        topMargin=margin,
        bottomMargin=margin
    )

    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName=font_bold,
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#1e293b'), # slate-800
        alignment=1, # Center
        spaceAfter=10
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName=font_bold,
        fontSize=14,
        leading=18,
        textColor=colors.HexColor('#0284c7'), # sky-600
        alignment=1, # Center
        spaceAfter=30
    )
    
    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Heading1'],
        fontName=font_bold,
        fontSize=15,
        leading=19,
        textColor=colors.HexColor('#0f172a'), # slate-900
        spaceBefore=15,
        spaceAfter=10,
        keepWithNext=True
    )
    
    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Heading2'],
        fontName=font_bold,
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#334155'), # slate-700
        spaceBefore=10,
        spaceAfter=6,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName=font_name,
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#334155'), # slate-700
        spaceAfter=8
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=body_style,
        leftIndent=20,
        firstLineIndent=-10,
        spaceAfter=4
    )

    code_style = ParagraphStyle(
        'Code_Custom',
        parent=styles['Normal'],
        fontName=font_name,
        fontSize=8,
        leading=11,
        textColor=colors.HexColor('#0f172a'),
        backColor=colors.HexColor('#f8fafc'),
        borderColor=colors.HexColor('#e2e8f0'),
        borderWidth=0.5,
        borderPadding=6,
        spaceAfter=10
    )

    story = []

    # Title & Header
    story.append(Spacer(1, 10))
    story.append(Paragraph("Tekstil Üretim Takip ve Operasyon Yönetim Sistemi", title_style))
    story.append(Paragraph("Güncellenmiş Mimari Plan", subtitle_style))
    story.append(Spacer(1, 10))

    # Intro
    intro_text = (
        "Bu dokümanda, sistemin veri tabanı mimarisi, modüler yapısı, ilişkisel veri şemaları (Prisma modelleri) ve "
        "operasyonel iş akışları detaylandırılmıştır. Sistem; ölçeklenebilir, rol bazlı yetkilendirmeye (RBAC) sahip, "
        "multi-tenant (çoklu şirket) uyumlu ve uçtan uca izlenebilirlik sağlayan modern bir ERP mimarisi üzerine kurulmuştur."
    )
    story.append(Paragraph(intro_text, body_style))
    story.append(Spacer(1, 10))

    # 1. Genel Sistem Mimarisi
    story.append(Paragraph("1. Genel Sistem Mimarisi", h1_style))
    story.append(Paragraph(
        "Sistem 3 ana katmandan oluşmaktadır:<br/>"
        "1. <b>Frontend (Arayüz):</b> Next.js (TypeScript) + TailwindCSS tabanlı modern yönetim paneli arayüzü.<br/>"
        "2. <b>Backend (API Servisi):</b> NestJS (TypeScript) tabanlı modüler, güvenli ve performanslı REST API servisi.<br/>"
        "3. <b>Database (Veri Depolama):</b> PostgreSQL ilişkisel veri tabanı, <b>Prisma ORM</b> ile yönetilmektedir.",
        body_style
    ))
    
    # Image 1: System Architecture
    arch_img_path = "docs/images/system_architecture.png"
    if os.path.exists(arch_img_path):
        # A4 width is 595, margins are 54*2=108, remaining width = 487
        # Image aspect ratio is roughly 1.5:1 to 2:1
        img = Image(arch_img_path, width=420, height=260)
        img.hAlign = 'CENTER'
        story.append(Spacer(1, 10))
        story.append(img)
        story.append(Spacer(1, 10))
    else:
        story.append(Paragraph("<i>[Sistem Mimarisi Şeması: docs/images/system_architecture.png bulunamadı]</i>", body_style))

    story.append(PageBreak())

    # 2. Mimari Katmanlar ve Modüller
    story.append(Paragraph("2. Mimari Katmanlar ve Modüller", h1_style))
    story.append(Paragraph("Sistemin veri tabanı mimarisi altı ana dikey bileşene ayrılmıştır:", body_style))

    story.append(Paragraph("<b>A. Organizasyon ve Yetkilendirme (Auth & RBAC)</b>", h2_style))
    story.append(Paragraph("• <b>Organization:</b> Çoklu şirket desteği (Multi-tenancy) için verilerin izole edildiği çatı model.", bullet_style))
    story.append(Paragraph("• <b>User & Role & Permission:</b> Kullanıcıların sisteme güvenli giriş yapmasını ve rol bazlı yetki kontrolünü (order:create vb.) sağlayan RBAC modelleri.", bullet_style))

    story.append(Paragraph("<b>B. Dinamik İş Akışı (Workflow)</b>", h2_style))
    story.append(Paragraph("• <b>WorkflowState:</b> Siparişlerin aşamaları (Maliyet, Numune, Kesim, Dikim vb.). Arayüz için renk ve ikon bilgileri burada tutulur.", bullet_style))
    story.append(Paragraph("• <b>WorkflowTransitionDef:</b> Aşamalar arası geçiş kuralları (örn: Numune -> Kesim için fotoğraf yükleme veya not zorunluluğu).", bullet_style))
    story.append(Paragraph("• <b>WorkflowTransition:</b> Siparişlerin aşama değiştirme geçmişinin loglandığı günlük tablosu.", bullet_style))

    story.append(Paragraph("<b>C. Sipariş Yönetimi (Order Management)</b>", h2_style))
    story.append(Paragraph("• <b>Order (Ana Entity):</b> Ürün adı, adeti, termin tarihi, QR kodu ve maliyet/fiyat özetlerini tutan merkezi tablo.", bullet_style))
    story.append(Paragraph("• <b>OrderAssignment:</b> Siparişteki belirli rollere (Modelist, Müşteri Temsilcisi) yapılan kullanıcı atamaları.", bullet_style))

    story.append(Paragraph("<b>D. Üretim ve Takip (Production Floor Tracking)</b>", h2_style))
    story.append(Paragraph("• <b>SampleRecord & SampleCritique:</b> Numune aşamaları ve tasarım/ölçü kritiklerinin (revizyonlarının) yönetimi.", bullet_style))
    story.append(Paragraph("• <b>PatternInfo & MeasurementSet:</b> Kalıp hazırlama notları, sarfiyat verileri ve beden bazlı ölçü tabloları.", bullet_style))
    story.append(Paragraph("• <b>ProcurementItem:</b> Kumaş, iplik, fermuar vb. malzemelerin tedarik durum takibi.", bullet_style))
    story.append(Paragraph("• <b>CuttingRecord / ProductionRecord / IroningPackingRecord:</b> Kesim (pastal sayısı, fire), Dikim (günlük dikilen ve defolu ürün) ile Ütü-Paket adetlerinin istasyon bazlı takibi.", bullet_style))
    story.append(Paragraph("• <b>ShippingRecord:</b> Sevkiyat yöntemi, takip numarası, paket sayısı ve ağırlık detayları.", bullet_style))

    story.append(Paragraph("<b>E. Maliyet ve Finans (Costing & Accounting)</b>", h2_style))
    story.append(Paragraph("• <b>CostItem:</b> Hammadde, aksesuar ve işçilik maliyet kalemleri.", bullet_style))
    story.append(Paragraph("• <b>PricingItem:</b> Maliyete eklenen şirket genel gider payları, kâr marjları ve indirimler.", bullet_style))
    story.append(Paragraph("• <b>Account & AccountTransaction:</b> Müşteri ve tedarikçilerin borç/alacak takibini yapan Cari Hesap modülü.", bullet_style))

    story.append(Paragraph("<b>F. Destekleyici Modüller (Support Modules)</b>", h2_style))
    story.append(Paragraph("• <b>Issue / Comment:</b> Üretimdeki kalite, gecikme veya eksik malzeme sorunlarının görsel yüklenebilir takibi.", bullet_style))
    story.append(Paragraph("• <b>FileAttachment / TimelineEvent:</b> Dosya saklama (MinIO) ve siparişe dair tüm tarihsel işlem akışı.", bullet_style))

    story.append(PageBreak())

    # 3. İlişkisel Veritabanı Şeması (ERD)
    story.append(Paragraph("3. İlişkisel Veritabanı Şeması (ERD)", h1_style))
    story.append(Paragraph(
        "Aşağıdaki şema, veri tabanındaki tabloların birbiriyle olan ilişkilerini ve siparişin (Order) "
        "nasıl bir merkezde konumlandığını göstermektedir:",
        body_style
    ))

    # Image 2: Database ERD
    erd_img_path = "docs/images/database_erd.png"
    if os.path.exists(erd_img_path):
        img2 = Image(erd_img_path, width=440, height=330)
        img2.hAlign = 'CENTER'
        story.append(Spacer(1, 10))
        story.append(img2)
        story.append(Spacer(1, 10))
    else:
        story.append(Paragraph("<i>[Veritabanı ERD Şeması: docs/images/database_erd.png bulunamadı]</i>", body_style))

    story.append(PageBreak())

    # 4. Kritik Veri Tabanı Modelleri (Prisma Detayları)
    story.append(Paragraph("4. Kritik Veri Tabanı Modelleri (Prisma Detayları)", h1_style))
    story.append(Paragraph("Sistemin temelini oluşturan kritik Prisma modellerinin şema yapıları aşağıda sunulmuştur:", body_style))

    # Order Model Snippet
    story.append(Paragraph("Sipariş Modeli (Order)", h2_style))
    order_code = (
        "model Order {\n"
        "  id               String    @id @default(cuid())\n"
        "  orderNumber      String    @unique // SIP-2026-00001\n"
        "  productName      String\n"
        "  quantity         Int\n"
        "  deadline         DateTime?\n"
        "  marketType       String    @default(\"DOMESTIC\") // DOMESTIC / EXPORT\n"
        "  totalCost        Decimal?  @db.Decimal(12,2) // Toplam maliyet\n"
        "  offerUnitPrice   Decimal?  @db.Decimal(12,2) // Teklif birim fiyatı\n"
        "  offerTotalPrice  Decimal?  @db.Decimal(12,2) // Teklif toplam fiyatı\n"
        "  currentState     WorkflowState @relation(fields: [currentStateId], references: [id])\n"
        "  costItems        CostItem[]\n"
        "  productionRecords ProductionRecord[]\n"
        "  issues           Issue[]\n"
        "}"
    )
    story.append(Paragraph(order_code.replace("\n", "<br/>").replace(" ", "&nbsp;"), code_style))

    # WorkflowTransitionDef Model Snippet
    story.append(Paragraph("İş Akışı Durum Geçişleri Modeli (WorkflowTransitionDef)", h2_style))
    workflow_code = (
        "model WorkflowTransitionDef {\n"
        "  id               String   @id @default(cuid())\n"
        "  fromStateId      String\n"
        "  toStateId        String\n"
        "  name             String            // Örn: \"Kesime Gönder\"\n"
        "  requiredRoles    String[]          // Yetkili roller\n"
        "  requiresPhoto    Boolean  @default(false)\n"
        "  requiresNote     Boolean  @default(false)\n"
        "  fromState        WorkflowState @relation(\"FromState\", fields: [fromStateId], references: [id])\n"
        "  toState          WorkflowState @relation(\"ToState\", fields: [toStateId], references: [id])\n"
        "}"
    )
    story.append(Paragraph(workflow_code.replace("\n", "<br/>").replace(" ", "&nbsp;"), code_style))

    # Account Model Snippet
    story.append(Paragraph("Cari Hesap Modeli (Account)", h2_style))
    account_code = (
        "model Account {\n"
        "  id              String    @id @default(cuid())\n"
        "  name            String\n"
        "  type            String    // CUSTOMER veya SUPPLIER\n"
        "  balance         Decimal   @default(0) @db.Decimal(12,2) // Cari bakiye\n"
        "  currency        String    @default(\"TRY\")\n"
        "  transactions    AccountTransaction[]\n"
        "  invoices        Invoice[]\n"
        "}"
    )
    story.append(Paragraph(account_code.replace("\n", "<br/>").replace(" ", "&nbsp;"), code_style))

    # Build PDF
    doc.build(story)
    print("PDF build successful.")

if __name__ == "__main__":
    build_pdf()
