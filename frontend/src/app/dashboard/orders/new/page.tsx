'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, Save, Loader2, ClipboardList } from 'lucide-react';
import Link from 'next/link';

export default function NewOrderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState<any[]>([]);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    productName: '',
    productCode: '',
    description: '',
    quantity: '',
    unit: 'adet',
    colors: '',
    sizes: '',
    fabricType: '',
    fabricComposition: '',
    deadline: '',
    priority: 2,
    marketType: 'DOMESTIC',
    vatRate: 10,
    currency: 'TRY',
    contactId: '',
  });

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const res = await api.get('/contacts', { params: { type: 'CUSTOMER', limit: 100 } });
      setContacts(res.data.data || []);
    } catch {}
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    // İhracat seçildiğinde KDV otomatik 0
    if (name === 'marketType' && value === 'EXPORT') {
      setForm(prev => ({ ...prev, [name]: value, vatRate: 0 }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...form,
        quantity: parseInt(form.quantity),
        priority: parseInt(form.priority as any),
        vatRate: parseInt(form.vatRate as any),
        contactId: form.contactId || undefined,
      };
      const res = await api.post('/orders', payload);
      router.push(`/dashboard/orders/${res.data.data.id}`);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Sipariş oluşturulamadı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/orders" className="btn-ghost p-2 rounded-xl">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <ClipboardList className="w-7 h-7 text-primary" />
            Yeni Sipariş
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Sipariş bilgilerini girerek yeni sipariş oluşturun</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Müşteri & Pazar */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Müşteri & Pazar Bilgileri</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="form-label">Müşteri</label>
              <select name="contactId" value={form.contactId} onChange={handleChange} className="form-select">
                <option value="">Müşteri seçin...</option>
                {contacts.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Pazar Tipi *</label>
              <select name="marketType" value={form.marketType} onChange={handleChange} className="form-select" required>
                <option value="DOMESTIC">🇹🇷 İç Piyasa</option>
                <option value="EXPORT">🌍 İhracat</option>
              </select>
            </div>
            <div>
              <label className="form-label">Para Birimi *</label>
              <select name="currency" value={form.currency} onChange={handleChange} className="form-select" required>
                <option value="TRY">₺ TRY</option>
                <option value="EUR">€ EUR</option>
                <option value="USD">$ USD</option>
                <option value="GBP">£ GBP</option>
              </select>
            </div>
          </div>
        </div>

        {/* Ürün Bilgileri */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Ürün Bilgileri</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="form-label">Ürün Adı *</label>
              <input name="productName" value={form.productName} onChange={handleChange} className="form-input" placeholder="Örn: Basic T-Shirt" required />
            </div>
            <div>
              <label className="form-label">Ürün Kodu</label>
              <input name="productCode" value={form.productCode} onChange={handleChange} className="form-input" placeholder="Örn: TS-001" />
            </div>
            <div>
              <label className="form-label">Adet *</label>
              <input name="quantity" type="number" min="1" value={form.quantity} onChange={handleChange} className="form-input" placeholder="10000" required />
            </div>
            <div>
              <label className="form-label">Birim</label>
              <select name="unit" value={form.unit} onChange={handleChange} className="form-select">
                <option value="adet">Adet</option>
                <option value="kg">Kilogram</option>
                <option value="metre">Metre</option>
                <option value="takım">Takım</option>
              </select>
            </div>
            <div>
              <label className="form-label">Öncelik</label>
              <select name="priority" value={form.priority} onChange={handleChange} className="form-select">
                <option value={1}>🔴 Acil</option>
                <option value={2}>🔵 Normal</option>
                <option value={3}>⚪ Düşük</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="form-label">Renkler</label>
              <input name="colors" value={form.colors} onChange={handleChange} className="form-input" placeholder="Örn: Beyaz, Siyah, Lacivert" />
            </div>
            <div>
              <label className="form-label">Bedenler</label>
              <input name="sizes" value={form.sizes} onChange={handleChange} className="form-input" placeholder="Örn: S, M, L, XL" />
            </div>
          </div>
        </div>

        {/* Kumaş & Termin */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Kumaş & Termin</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="form-label">Kumaş Tipi</label>
              <input name="fabricType" value={form.fabricType} onChange={handleChange} className="form-input" placeholder="Örn: Penye" />
            </div>
            <div>
              <label className="form-label">Kumaş Kompozisyon</label>
              <input name="fabricComposition" value={form.fabricComposition} onChange={handleChange} className="form-input" placeholder="Örn: %100 Pamuk" />
            </div>
            <div>
              <label className="form-label">Termin Tarihi</label>
              <input name="deadline" type="date" value={form.deadline} onChange={handleChange} className="form-input" />
            </div>
            <div>
              <label className="form-label">KDV Oranı (%)</label>
              <select name="vatRate" value={form.vatRate} onChange={handleChange} className="form-select">
                <option value={0}>%0 (İhracat)</option>
                <option value={1}>%1</option>
                <option value={10}>%10</option>
                <option value={20}>%20</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="form-label">Açıklama</label>
              <textarea name="description" value={form.description} onChange={handleChange as any} className="form-input" rows={3} placeholder="Sipariş ile ilgili ek bilgiler..." />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Link href="/dashboard/orders" className="btn-ghost">İptal</Link>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Oluşturuluyor...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Sipariş Oluştur
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
