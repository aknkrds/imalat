'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';
import {
  Plus, Search, Building2, User, Mail, Phone,
  MapPin, FileText, StickyNote, Edit, Trash2,
  Loader2, X, AlertCircle, ShieldAlert
} from 'lucide-react';

interface Contact {
  id: string;
  type: 'CUSTOMER' | 'SUPPLIER';
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  taxNumber?: string;
  taxOffice?: string;
  notes?: string;
  isActive: boolean;
  _count?: {
    orders: number;
    procurementItems: number;
  };
}

export default function ContactsPage() {
  const { hasAnyRole } = useAuthStore();
  const canEdit = hasAnyRole(['SUPER_ADMIN', 'ADMIN', 'OPERATION', 'CUSTOMER_REP', 'ACCOUNTING']);
  const canDelete = hasAnyRole(['SUPER_ADMIN', 'ADMIN']);

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'CUSTOMER' | 'SUPPLIER'>('ALL');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form states
  const [formType, setFormType] = useState<'CUSTOMER' | 'SUPPLIER'>('CUSTOMER');
  const [formName, setFormName] = useState('');
  const [formContactPerson, setFormContactPerson] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formCountry, setFormCountry] = useState('Türkiye');
  const [formTaxNumber, setFormTaxNumber] = useState('');
  const [formTaxOffice, setFormTaxOffice] = useState('');
  const [formNotes, setFormNotes] = useState('');

  useEffect(() => {
    loadContacts();
  }, [typeFilter]);

  const loadContacts = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (typeFilter !== 'ALL') {
        params.type = typeFilter;
      }
      if (search) {
        params.search = search;
      }
      const res = await api.get('/contacts', { params });
      setContacts(res.data.data || []);
    } catch (err) {
      console.error('Contacts load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadContacts();
  };

  const openAddModal = () => {
    setSelectedContact(null);
    setFormType('CUSTOMER');
    setFormName('');
    setFormContactPerson('');
    setFormEmail('');
    setFormPhone('');
    setFormAddress('');
    setFormCity('');
    setFormCountry('Türkiye');
    setFormTaxNumber('');
    setFormTaxOffice('');
    setFormNotes('');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const openEditModal = (contact: Contact) => {
    setSelectedContact(contact);
    setFormType(contact.type);
    setFormName(contact.name);
    setFormContactPerson(contact.contactPerson || '');
    setFormEmail(contact.email || '');
    setFormPhone(contact.phone || '');
    setFormAddress(contact.address || '');
    setFormCity(contact.city || '');
    setFormCountry(contact.country || 'Türkiye');
    setFormTaxNumber(contact.taxNumber || '');
    setFormTaxOffice(contact.taxOffice || '');
    setFormNotes(contact.notes || '');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const openDeleteModal = (contact: Contact) => {
    setSelectedContact(contact);
    setIsDeleteOpen(true);
  };

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setErrorMsg('Firma Ünvanı zorunludur.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    const payload = {
      type: formType,
      name: formName.trim(),
      contactPerson: formContactPerson.trim() || null,
      email: formEmail.trim() || null,
      phone: formPhone.trim() || null,
      address: formAddress.trim() || null,
      city: formCity.trim() || null,
      country: formCountry.trim() || null,
      taxNumber: formTaxNumber.trim() || null,
      taxOffice: formTaxOffice.trim() || null,
      notes: formNotes.trim() || null,
    };

    try {
      if (selectedContact) {
        // Edit flow
        await api.put(`/contacts/${selectedContact.id}`, payload);
      } else {
        // Add flow
        await api.post('/contacts', payload);
      }
      setIsModalOpen(false);
      loadContacts();
    } catch (err: any) {
      console.error('Contact save error:', err);
      setErrorMsg(err.response?.data?.message || 'Kayıt sırasında bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteContact = async () => {
    if (!selectedContact) return;
    setIsSubmitting(true);
    try {
      await api.delete(`/contacts/${selectedContact.id}`);
      setIsDeleteOpen(false);
      loadContacts();
    } catch (err: any) {
      console.error('Contact delete error:', err);
      alert('Silme işlemi başarısız: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Müşteri & Tedarikçi Kartları</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sistemde kayıtlı cari firma ve tedarikçilerin yönetim alanı
          </p>
        </div>
        {canEdit && (
          <button onClick={openAddModal} className="btn btn-primary shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4" />
            Yeni Firma / Tedarikçi Ekle
          </button>
        )}
      </div>

      {/* Tabs and Search Filters */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
        {/* Switch tabs */}
        <div className="flex bg-card border border-border p-1 rounded-xl">
          <button
            onClick={() => setTypeFilter('ALL')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              typeFilter === 'ALL'
                ? 'bg-primary text-primary-foreground shadow'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Tümü
          </button>
          <button
            onClick={() => setTypeFilter('CUSTOMER')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              typeFilter === 'CUSTOMER'
                ? 'bg-primary text-primary-foreground shadow'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            🏢 Müşteriler
          </button>
          <button
            onClick={() => setTypeFilter('SUPPLIER')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              typeFilter === 'SUPPLIER'
                ? 'bg-primary text-primary-foreground shadow'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            📦 Tedarikçiler
          </button>
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="w-full lg:w-96 relative flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Firma ünvanı, yetkili veya telefon ara..."
              className="form-input pl-10"
            />
          </div>
          <button type="submit" className="btn btn-primary btn-sm px-4">
            Ara
          </button>
        </form>
      </div>

      {/* Grid view of Cards */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Kayıtlar yükleniyor...</p>
        </div>
      ) : contacts.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center h-72 text-center p-6">
          <Building2 className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground text-lg font-medium">Hiç kayıt bulunamadı</p>
          <p className="text-muted-foreground/60 text-sm mt-1 max-w-md">
            Aradığınız kriterlere uygun müşteri veya tedarikçi bulunamadı. Yeni bir tane ekleyebilir veya filtreleri sıfırlayabilirsiniz.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {contacts.map((contact, i) => (
            <div
              key={contact.id}
              className="glass-card flex flex-col overflow-hidden relative hover:shadow-xl hover:border-primary/20 transition-all duration-300 animate-slide-up group"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              {/* Top Accent Bar based on type */}
              <div
                className={`h-1.5 w-full ${
                  contact.type === 'CUSTOMER'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-600'
                }`}
              />

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                {/* Header Title & Type Badge */}
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <span
                      className={`badge text-[10px] uppercase font-bold tracking-wider ${
                        contact.type === 'CUSTOMER' ? 'badge-info' : 'badge-success'
                      }`}
                    >
                      {contact.type === 'CUSTOMER' ? 'Müşteri' : 'Tedarikçi'}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">
                      ID: {contact.id.slice(-6).toUpperCase()}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-foreground mt-2 line-clamp-2 min-h-[3rem] group-hover:text-primary transition-colors">
                    {contact.name}
                  </h3>
                </div>

                {/* Contact details */}
                <div className="space-y-2.5 text-sm border-t border-border/40 pt-4 flex-1">
                  {contact.contactPerson && (
                    <div className="flex items-center gap-2.5 text-muted-foreground">
                      <User className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="truncate text-foreground/90 font-medium">
                        {contact.contactPerson}
                      </span>
                    </div>
                  )}

                  {contact.phone && (
                    <div className="flex items-center gap-2.5 text-muted-foreground">
                      <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                      <a href={`tel:${contact.phone}`} className="hover:underline hover:text-foreground">
                        {contact.phone}
                      </a>
                    </div>
                  )}

                  {contact.email && (
                    <div className="flex items-center gap-2.5 text-muted-foreground">
                      <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                      <a
                        href={`mailto:${contact.email}`}
                        className="truncate hover:underline hover:text-foreground"
                      >
                        {contact.email}
                      </a>
                    </div>
                  )}

                  {(contact.taxNumber || contact.taxOffice) && (
                    <div className="flex items-start gap-2.5 text-muted-foreground bg-muted/20 p-2 rounded-lg border border-border/20">
                      <FileText className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <div className="text-xs space-y-0.5">
                        <p className="font-semibold text-foreground/80">Vergi Bilgileri</p>
                        <p>
                          {contact.taxOffice ? `${contact.taxOffice} V.D.` : ''}{' '}
                          {contact.taxNumber ? `No: ${contact.taxNumber}` : ''}
                        </p>
                      </div>
                    </div>
                  )}

                  {(contact.address || contact.city) && (
                    <div className="flex items-start gap-2.5 text-muted-foreground">
                      <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-xs line-clamp-2">
                        {contact.address}
                        {contact.city && `, ${contact.city}`}
                        {contact.country && `, ${contact.country}`}
                      </span>
                    </div>
                  )}

                  {contact.notes && (
                    <div className="flex items-start gap-2.5 text-muted-foreground bg-accent/20 p-2 rounded-lg border border-border/20">
                      <StickyNote className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <span className="text-xs italic line-clamp-2">
                        {contact.notes}
                      </span>
                    </div>
                  )}
                </div>

                {/* Operations */}
                <div className="flex justify-between items-center border-t border-border/40 pt-4 mt-auto">
                  <div className="text-xs text-muted-foreground">
                    {contact.type === 'CUSTOMER' ? (
                      <span>Siparişler: <strong>{contact._count?.orders || 0}</strong></span>
                    ) : (
                      <span>Tedarik Kalemleri: <strong>{contact._count?.procurementItems || 0}</strong></span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {canEdit && (
                      <button
                        onClick={() => openEditModal(contact)}
                        className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary transition-all"
                        title="Düzenle"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => openDeleteModal(contact)}
                        className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-destructive transition-all"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-2xl overflow-hidden shadow-2xl border border-border/80 max-h-[90vh] flex flex-col animate-scale-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-border/80">
              <h2 className="text-lg font-bold text-foreground">
                {selectedContact ? 'Firma / Tedarikçi Düzenle' : 'Yeni Firma / Tedarikçi Ekle'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <form onSubmit={handleSaveContact} className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin">
              {errorMsg && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Company Info section */}
              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-primary uppercase tracking-wider">
                  Firma Tipi & Ünvanı
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div>
                    <label className="form-label">Firma Tipi</label>
                    <select
                      value={formType}
                      onChange={(e: any) => setFormType(e.target.value)}
                      className="form-select"
                      disabled={!!selectedContact}
                    >
                      <option value="CUSTOMER">Müşteri</option>
                      <option value="SUPPLIER">Tedarikçi</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="form-label">
                      Firma Ünvanı <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="form-input"
                      placeholder="Örn: ABC Tekstil Sanayi Ltd. Şti."
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Contact details section */}
              <div className="space-y-4 pt-4 border-t border-border/40">
                <h3 className="text-xs font-semibold text-primary uppercase tracking-wider">
                  İletişim Bilgileri (Opsiyonel)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Yetkili Kişi</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        value={formContactPerson}
                        onChange={(e) => setFormContactPerson(e.target.value)}
                        className="form-input pl-10"
                        placeholder="Örn: Ahmet Yılmaz"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Telefon</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                        className="form-input pl-10"
                        placeholder="Örn: 0555 123 45 67"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="form-label">E-posta</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="email"
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        className="form-input pl-10"
                        placeholder="Örn: info@abctekstil.com"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="form-label">Adres</label>
                    <input
                      type="text"
                      value={formAddress}
                      onChange={(e) => setFormAddress(e.target.value)}
                      className="form-input"
                      placeholder="Mahalle, cadde, no..."
                    />
                  </div>

                  <div>
                    <label className="form-label">İl</label>
                    <input
                      type="text"
                      value={formCity}
                      onChange={(e) => setFormCity(e.target.value)}
                      className="form-input"
                      placeholder="Örn: İstanbul"
                    />
                  </div>

                  <div>
                    <label className="form-label">Ülke</label>
                    <input
                      type="text"
                      value={formCountry}
                      onChange={(e) => setFormCountry(e.target.value)}
                      className="form-input"
                      placeholder="Örn: Türkiye"
                    />
                  </div>
                </div>
              </div>

              {/* Tax Details section */}
              <div className="space-y-4 pt-4 border-t border-border/40">
                <h3 className="text-xs font-semibold text-primary uppercase tracking-wider">
                  Vergi Bilgileri (Opsiyonel)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Vergi Numarası</label>
                    <input
                      type="text"
                      value={formTaxNumber}
                      onChange={(e) => setFormTaxNumber(e.target.value)}
                      className="form-input"
                      placeholder="10 Haneli vergi no"
                    />
                  </div>

                  <div>
                    <label className="form-label">Vergi Dairesi</label>
                    <input
                      type="text"
                      value={formTaxOffice}
                      onChange={(e) => setFormTaxOffice(e.target.value)}
                      className="form-input"
                      placeholder="Örn: İkitelli V.D."
                    />
                  </div>
                </div>
              </div>

              {/* Additional notes section */}
              <div className="space-y-4 pt-4 border-t border-border/40">
                <h3 className="text-xs font-semibold text-primary uppercase tracking-wider">
                  Diğer (Opsiyonel)
                </h3>

                <div>
                  <label className="form-label">Özel Notlar</label>
                  <textarea
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className="form-input min-h-[80px]"
                    placeholder="Firma ile ilgili ek notlar veya özel durumlar..."
                  />
                </div>
              </div>

              {/* Form Actions footer */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border/80">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-ghost"
                  disabled={isSubmitting}
                >
                  Vazgeç
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Kaydediliyor...
                    </>
                  ) : (
                    'Kaydet'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteOpen && selectedContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-md p-6 space-y-6 shadow-2xl border border-border/80 animate-scale-in">
            <div className="flex items-center gap-3 text-destructive">
              <ShieldAlert className="w-8 h-8" />
              <h2 className="text-lg font-bold text-foreground">Kaydı Sil?</h2>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong>{selectedContact.name}</strong> isimli{' '}
              {selectedContact.type === 'CUSTOMER' ? 'müşteri' : 'tedarikçi'} kaydını silmek istediğinizden
              emin misiniz? Bu işlem geri alınamaz.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                className="btn btn-ghost"
                disabled={isSubmitting}
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={handleDeleteContact}
                className="btn bg-destructive hover:bg-destructive/90 text-white font-semibold shadow-lg shadow-destructive/20"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Siliniyor...
                  </>
                ) : (
                  'Evet, Sil'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
