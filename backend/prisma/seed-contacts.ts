import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const org = await prisma.organization.findFirst();
  if (!org) {
    console.error('No organization found to attach contacts.');
    return;
  }

  const contacts = [
    {
      organizationId: org.id,
      type: 'CUSTOMER',
      name: 'Zara Global Sourcing',
      contactPerson: 'Marta Ortega',
      email: 'marta.ortega@zara.com',
      phone: '+34 981 180 000',
      address: 'Av. de la Diputación, Edificio Inditex',
      city: 'Arteixo',
      country: 'Spain',
      taxNumber: 'ESB12345678',
      taxOffice: 'Madrid Central',
      notes: 'İhracat müşterisi. Sipariş terminleri çok sıkı.',
    },
    {
      organizationId: org.id,
      type: 'CUSTOMER',
      name: 'LC Waikiki Mağazacılık',
      contactPerson: 'Ali Yılmaz',
      email: 'ali.yilmaz@lcwaikiki.com',
      phone: '0212 657 00 00',
      address: '15 Temmuz Mah. Gülbahar Cad. No: 41',
      city: 'Güneşli / İstanbul',
      country: 'Türkiye',
      taxNumber: '5820034891',
      taxOffice: 'Güneşli VD',
      notes: 'İç piyasa ana müşterisi. Ödemeler 60 gün vadeli.',
    },
    {
      organizationId: org.id,
      type: 'SUPPLIER',
      name: 'Bursa Kumaş Boyama Sanayi',
      contactPerson: 'Mehmet Demir',
      email: 'mehmet@bursaboyama.com',
      phone: '0224 443 00 00',
      address: 'DOSAB Karanfil Sokak No: 12',
      city: 'Bursa',
      country: 'Türkiye',
      taxNumber: '1910082341',
      taxOffice: 'Nilüfer VD',
      notes: 'Örme ve dokuma kumaş boyama tedarikçisi. Termin hızı mükemmel.',
    },
    {
      organizationId: org.id,
      type: 'SUPPLIER',
      name: 'YKK Fermuar Sanayi A.Ş.',
      contactPerson: 'Can Aksoy',
      email: 'can.aksoy@ykk.com.tr',
      phone: '0212 386 00 00',
      address: 'Maslak Ayazağa Cad. No: 2',
      city: 'Şişli / İstanbul',
      country: 'Türkiye',
      taxNumber: '9820031122',
      taxOffice: 'Zincirlikuyu VD',
      notes: 'Fermuar ve metal aksesuar tedarikçisi.',
    },
  ];

  for (const c of contacts) {
    // Check if contact already exists by name
    const exists = await prisma.contact.findFirst({
      where: { name: c.name, deletedAt: null }
    });
    if (exists) {
      console.log(`Contact '${c.name}' already exists. Skipping.`);
      continue;
    }

    const contact = await prisma.contact.create({ data: c });
    await prisma.account.create({
      data: {
        organizationId: org.id,
        contactId: contact.id,
        name: contact.name,
        type: contact.type,
        currency: 'TRY',
      }
    });
    console.log(`Created contact: ${contact.name}`);
  }
  console.log('Seeding contacts completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed contacts error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
