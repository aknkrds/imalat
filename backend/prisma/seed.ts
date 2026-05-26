import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ==========================================
  // 1. Organization
  // ==========================================
  const org = await prisma.organization.upsert({
    where: { slug: 'default' },
    update: {},
    create: {
      name: 'Demo Tekstil A.Ş.',
      slug: 'default',
      address: 'İstanbul, Türkiye',
      phone: '0212 555 00 00',
      taxNumber: '1234567890',
      taxOffice: 'İstanbul VD',
    },
  });
  console.log('✅ Organization created');

  // ==========================================
  // 2. Roles
  // ==========================================
  const rolesData = [
    { name: 'SUPER_ADMIN', displayName: 'Süper Admin', description: 'Tüm yetkilere sahip', isSystem: true },
    { name: 'ADMIN', displayName: 'Admin', description: 'Organizasyon yöneticisi', isSystem: true },
    { name: 'OPERATION', displayName: 'Operasyon', description: 'Sipariş ve iş akışı yönetimi', isSystem: true },
    { name: 'CUSTOMER_REP', displayName: 'Müşteri Temsilcisi', description: 'Müşteri ilişkileri ve teklifler', isSystem: true },
    { name: 'MODELIST', displayName: 'Modelist', description: 'Kalıp ve ölçü tablosu', isSystem: true },
    { name: 'CUTTING', displayName: 'Kesim Atölyesi', description: 'Kesim işlemleri', isSystem: true },
    { name: 'PRODUCTION', displayName: 'Dikim Atölyesi', description: 'Üretim/dikim işlemleri', isSystem: true },
    { name: 'IRONING_PACKING', displayName: 'Ütü & Paket', description: 'Ütü ve paketleme işlemleri', isSystem: true },
    { name: 'QUALITY_CONTROL', displayName: 'Kalite Kontrol', description: 'Kalite kontrol işlemleri', isSystem: true },
    { name: 'WAREHOUSE', displayName: 'Depo', description: 'Tedarik ve stok', isSystem: true },
    { name: 'SHIPPING', displayName: 'Sevkiyat', description: 'Sevkiyat işlemleri', isSystem: true },
    { name: 'ACCOUNTING', displayName: 'Muhasebe', description: 'Fatura ve cari hesap', isSystem: true },
  ];

  const roles: Record<string, any> = {};
  for (const roleData of rolesData) {
    const role = await prisma.role.upsert({
      where: { name: roleData.name },
      update: { displayName: roleData.displayName, description: roleData.description },
      create: roleData,
    });
    roles[role.name] = role;
  }
  console.log(`✅ ${rolesData.length} roles created`);

  // ==========================================
  // 3. Permissions
  // ==========================================
  const permissionsData = [
    // Orders
    { name: 'order:create', module: 'order', action: 'create', description: 'Sipariş oluşturma' },
    { name: 'order:read', module: 'order', action: 'read', description: 'Tüm siparişleri görme' },
    { name: 'order:read_own', module: 'order', action: 'read_own', description: 'Sadece atanan siparişleri görme' },
    { name: 'order:update', module: 'order', action: 'update', description: 'Sipariş güncelleme' },
    { name: 'order:delete', module: 'order', action: 'delete', description: 'Sipariş silme' },
    { name: 'order:transition', module: 'order', action: 'transition', description: 'Sipariş durum geçişi' },
    // Users
    { name: 'user:manage', module: 'user', action: 'manage', description: 'Kullanıcı yönetimi' },
    // Contacts
    { name: 'contact:manage', module: 'contact', action: 'manage', description: 'Müşteri/tedarikçi yönetimi' },
    // Accounting
    { name: 'accounting:manage', module: 'accounting', action: 'manage', description: 'Muhasebe yönetimi' },
    // Reports
    { name: 'report:view', module: 'report', action: 'view', description: 'Rapor görüntüleme' },
    { name: 'report:export', module: 'report', action: 'export', description: 'Rapor dışa aktarma' },
    // Issues
    { name: 'issue:create', module: 'issue', action: 'create', description: 'Sorun bildirme' },
    { name: 'issue:resolve', module: 'issue', action: 'resolve', description: 'Sorun çözme' },
    // Files
    { name: 'file:upload', module: 'file', action: 'upload', description: 'Dosya yükleme' },
    { name: 'file:delete', module: 'file', action: 'delete', description: 'Dosya silme' },
  ];

  for (const permData of permissionsData) {
    await prisma.permission.upsert({
      where: { name: permData.name },
      update: {},
      create: permData,
    });
  }
  console.log(`✅ ${permissionsData.length} permissions created`);

  // ==========================================
  // 4. Workflow States
  // ==========================================
  const statesData = [
    { code: 'ORDER_ENTRY', name: 'Sipariş Girişi', color: '#6366f1', icon: 'ClipboardList', sortOrder: 1, isInitial: true },
    { code: 'COSTING', name: 'Maliyet Hesabı', color: '#8b5cf6', icon: 'Calculator', sortOrder: 2 },
    { code: 'PRICING', name: 'Fiyatlandırma', color: '#a855f7', icon: 'Tag', sortOrder: 3 },
    { code: 'CUSTOMER_OFFER', name: 'Müşteri Teklifi', color: '#d946ef', icon: 'Send', sortOrder: 4 },
    { code: 'CUSTOMER_APPROVAL', name: 'Müşteri Onayı', color: '#ec4899', icon: 'CheckCircle', sortOrder: 5 },
    { code: 'SAMPLE_PATTERN', name: 'Numune Kalıbı', color: '#f43f5e', icon: 'Scissors', sortOrder: 6 },
    { code: 'SAMPLE_PRODUCTION', name: 'Numune Üretimi', color: '#ef4444', icon: 'FlaskConical', sortOrder: 7 },
    { code: 'SAMPLE_CRITIQUE', name: 'Numune Kritik', color: '#f97316', icon: 'MessageSquare', sortOrder: 8 },
    { code: 'ORDER_APPROVAL', name: 'Sipariş Onayı', color: '#f59e0b', icon: 'ShieldCheck', sortOrder: 9 },
    { code: 'PRODUCTION_PATTERN', name: 'Üretim Kalıbı', color: '#eab308', icon: 'Ruler', sortOrder: 10 },
    { code: 'PROCUREMENT', name: 'Tedarik', color: '#84cc16', icon: 'ShoppingCart', sortOrder: 11 },
    { code: 'CUTTING', name: 'Kesim', color: '#22c55e', icon: 'Scissors', sortOrder: 12 },
    { code: 'PRODUCTION', name: 'Üretim / Dikim', color: '#10b981', icon: 'Factory', sortOrder: 13 },
    { code: 'QUALITY_CONTROL', name: 'Kalite Kontrol', color: '#14b8a6', icon: 'Search', sortOrder: 14 },
    { code: 'IRONING_PACKING', name: 'Ütü & Paketleme', color: '#06b6d4', icon: 'Package', sortOrder: 15 },
    { code: 'INVOICING', name: 'Fatura & İrsaliye', color: '#0ea5e9', icon: 'FileText', sortOrder: 16 },
    { code: 'SHIPPING', name: 'Sevkiyat', color: '#3b82f6', icon: 'Truck', sortOrder: 17 },
    { code: 'COMPLETED', name: 'Tamamlandı', color: '#16a34a', icon: 'CheckCircle2', sortOrder: 18, isFinal: true },
    { code: 'CANCELLED', name: 'İptal', color: '#dc2626', icon: 'XCircle', sortOrder: 19, isFinal: true },
  ];

  const states: Record<string, any> = {};
  for (const stateData of statesData) {
    const state = await prisma.workflowState.upsert({
      where: { code: stateData.code },
      update: { name: stateData.name, color: stateData.color, icon: stateData.icon, sortOrder: stateData.sortOrder },
      create: { ...stateData, isInitial: stateData.isInitial || false, isFinal: stateData.isFinal || false },
    });
    states[state.code] = state;
  }
  console.log(`✅ ${statesData.length} workflow states created`);

  // ==========================================
  // 5. Workflow Transitions
  // ==========================================
  const transitionsData = [
    // Sipariş Girişi → Maliyet
    { from: 'ORDER_ENTRY', to: 'COSTING', name: 'Maliyetlere Geç', requiredRoles: ['ADMIN', 'OPERATION', 'CUSTOMER_REP'], sortOrder: 1 },
    // Maliyet → Fiyatlandırma
    { from: 'COSTING', to: 'PRICING', name: 'Fiyatlandırmaya Geç', requiredRoles: ['ADMIN', 'OPERATION', 'CUSTOMER_REP'], sortOrder: 1 },
    // Fiyatlandırma → Müşteri Teklifi
    { from: 'PRICING', to: 'CUSTOMER_OFFER', name: 'Teklifi Gönder', requiredRoles: ['ADMIN', 'OPERATION', 'CUSTOMER_REP'], sortOrder: 1 },
    // Müşteri Teklifi → Müşteri Onayı
    { from: 'CUSTOMER_OFFER', to: 'CUSTOMER_APPROVAL', name: 'Müşteriye İletildi', requiredRoles: ['ADMIN', 'OPERATION', 'CUSTOMER_REP'], sortOrder: 1 },
    // Müşteri Onayı → Numune Kalıbı (onay)
    { from: 'CUSTOMER_APPROVAL', to: 'SAMPLE_PATTERN', name: 'Müşteri Onayladı', requiredRoles: ['ADMIN', 'OPERATION', 'CUSTOMER_REP'], sortOrder: 1 },
    // Müşteri Onayı → Fiyatlandırma (revize)
    { from: 'CUSTOMER_APPROVAL', to: 'PRICING', name: 'Revize İstendi', requiredRoles: ['ADMIN', 'OPERATION', 'CUSTOMER_REP'], sortOrder: 2 },
    // Müşteri Onayı → İptal
    { from: 'CUSTOMER_APPROVAL', to: 'CANCELLED', name: 'Müşteri Reddetti', requiredRoles: ['ADMIN', 'OPERATION'], sortOrder: 3 },
    // Numune Kalıbı → Numune Üretimi
    { from: 'SAMPLE_PATTERN', to: 'SAMPLE_PRODUCTION', name: 'Numune Kalıbı Hazır', requiredRoles: ['ADMIN', 'OPERATION', 'MODELIST'], sortOrder: 1 },
    // Numune Üretimi → Numune Kritik
    { from: 'SAMPLE_PRODUCTION', to: 'SAMPLE_CRITIQUE', name: 'Numune Tamamlandı', requiredRoles: ['ADMIN', 'OPERATION'], sortOrder: 1 },
    // Numune Kritik → Numune Kalıbı (yeniden kalıp)
    { from: 'SAMPLE_CRITIQUE', to: 'SAMPLE_PATTERN', name: 'Yeniden Kalıp Gerekli', requiredRoles: ['ADMIN', 'OPERATION'], sortOrder: 2 },
    // Numune Kritik → Numune Üretimi (yeniden numune)
    { from: 'SAMPLE_CRITIQUE', to: 'SAMPLE_PRODUCTION', name: 'Yeniden Numune', requiredRoles: ['ADMIN', 'OPERATION'], sortOrder: 3 },
    // Numune Kritik → Sipariş Onayı
    { from: 'SAMPLE_CRITIQUE', to: 'ORDER_APPROVAL', name: 'Numune Onaylandı', requiredRoles: ['ADMIN', 'OPERATION'], sortOrder: 1 },
    // Sipariş Onayı → Üretim Kalıbı + Tedarik (paralel başlar)
    { from: 'ORDER_APPROVAL', to: 'PRODUCTION_PATTERN', name: 'Sipariş Onaylandı', requiredRoles: ['ADMIN', 'OPERATION'], sortOrder: 1 },
    // Sipariş Onayı → İptal
    { from: 'ORDER_APPROVAL', to: 'CANCELLED', name: 'Sipariş İptal', requiredRoles: ['ADMIN', 'OPERATION'], sortOrder: 2 },
    // Üretim Kalıbı → Tedarik
    { from: 'PRODUCTION_PATTERN', to: 'PROCUREMENT', name: 'Üretim Kalıbı Hazır', requiredRoles: ['ADMIN', 'OPERATION', 'MODELIST'], sortOrder: 1 },
    // Tedarik → Kesim
    { from: 'PROCUREMENT', to: 'CUTTING', name: 'Tedarik Tamamlandı', requiredRoles: ['ADMIN', 'OPERATION', 'WAREHOUSE'], sortOrder: 1 },
    // Kesim → Üretim
    { from: 'CUTTING', to: 'PRODUCTION', name: 'Kesim Tamamlandı', requiredRoles: ['ADMIN', 'OPERATION', 'CUTTING'], sortOrder: 1 },
    // Üretim → Kalite Kontrol
    { from: 'PRODUCTION', to: 'QUALITY_CONTROL', name: 'Üretim Tamamlandı', requiredRoles: ['ADMIN', 'OPERATION', 'PRODUCTION'], sortOrder: 1 },
    // Kalite Kontrol → Üretim (red)
    { from: 'QUALITY_CONTROL', to: 'PRODUCTION', name: 'Kalite Red', requiredRoles: ['ADMIN', 'OPERATION', 'QUALITY_CONTROL'], sortOrder: 2 },
    // Kalite Kontrol → Ütü Paket
    { from: 'QUALITY_CONTROL', to: 'IRONING_PACKING', name: 'Kalite Onay', requiredRoles: ['ADMIN', 'OPERATION', 'QUALITY_CONTROL'], sortOrder: 1 },
    // Ütü Paket → Fatura
    { from: 'IRONING_PACKING', to: 'INVOICING', name: 'Paketleme Tamamlandı', requiredRoles: ['ADMIN', 'OPERATION', 'IRONING_PACKING'], sortOrder: 1 },
    // Fatura → Sevkiyat
    { from: 'INVOICING', to: 'SHIPPING', name: 'Fatura Girildi', requiredRoles: ['ADMIN', 'OPERATION', 'ACCOUNTING'], sortOrder: 1 },
    // Sevkiyat → Tamamlandı
    { from: 'SHIPPING', to: 'COMPLETED', name: 'Teslim Edildi', requiredRoles: ['ADMIN', 'OPERATION', 'SHIPPING'], sortOrder: 1 },
  ];

  for (const td of transitionsData) {
    const fromState = states[td.from];
    const toState = states[td.to];
    if (!fromState || !toState) {
      console.warn(`⚠️ State not found: ${td.from} or ${td.to}`);
      continue;
    }
    await prisma.workflowTransitionDef.upsert({
      where: { fromStateId_toStateId: { fromStateId: fromState.id, toStateId: toState.id } },
      update: { name: td.name, requiredRoles: td.requiredRoles, sortOrder: td.sortOrder },
      create: {
        fromStateId: fromState.id,
        toStateId: toState.id,
        name: td.name,
        requiredRoles: td.requiredRoles,
        sortOrder: td.sortOrder,
      },
    });
  }
  console.log(`✅ ${transitionsData.length} workflow transitions created`);

  // ==========================================
  // 6. Demo Admin User
  // ==========================================
  const adminPassword = await bcrypt.hash('Admin123!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@imalat.com' },
    update: {},
    create: {
      organizationId: org.id,
      email: 'admin@imalat.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'Kullanıcı',
      phone: '05551234567',
    },
  });

  // Admin rolü ata
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: admin.id, roleId: roles['SUPER_ADMIN'].id } },
    update: {},
    create: { userId: admin.id, roleId: roles['SUPER_ADMIN'].id },
  });

  console.log('✅ Demo admin user created: admin@imalat.com / Admin123!');

  // ==========================================
  // 7. Demo departman kullanıcıları
  // ==========================================
  const demoUsers = [
    { email: 'operasyon@imalat.com', firstName: 'Operasyon', lastName: 'Kullanıcı', role: 'OPERATION' },
    { email: 'musteri@imalat.com', firstName: 'Müşteri', lastName: 'Temsilcisi', role: 'CUSTOMER_REP' },
    { email: 'modelist@imalat.com', firstName: 'Modelist', lastName: 'Kullanıcı', role: 'MODELIST' },
    { email: 'kesim@imalat.com', firstName: 'Kesim', lastName: 'Atölyesi', role: 'CUTTING' },
    { email: 'uretim@imalat.com', firstName: 'Üretim', lastName: 'Atölyesi', role: 'PRODUCTION' },
    { email: 'utupaket@imalat.com', firstName: 'Ütü', lastName: 'Paket', role: 'IRONING_PACKING' },
    { email: 'kalite@imalat.com', firstName: 'Kalite', lastName: 'Kontrol', role: 'QUALITY_CONTROL' },
    { email: 'depo@imalat.com', firstName: 'Depo', lastName: 'Kullanıcı', role: 'WAREHOUSE' },
    { email: 'sevkiyat@imalat.com', firstName: 'Sevkiyat', lastName: 'Kullanıcı', role: 'SHIPPING' },
    { email: 'muhasebe@imalat.com', firstName: 'Muhasebe', lastName: 'Kullanıcı', role: 'ACCOUNTING' },
  ];

  const demoPassword = await bcrypt.hash('Demo123!', 12);
  for (const userData of demoUsers) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        organizationId: org.id,
        email: userData.email,
        password: demoPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
      },
    });
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: user.id, roleId: roles[userData.role].id } },
      update: {},
      create: { userId: user.id, roleId: roles[userData.role].id },
    });
  }
  console.log(`✅ ${demoUsers.length} demo users created (password: Demo123!)`);

  console.log('\n🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
