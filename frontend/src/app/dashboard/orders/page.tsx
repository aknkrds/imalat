'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';
import Link from 'next/link';
import {
  Plus, Search, Filter, ChevronLeft, ChevronRight,
  ClipboardList, Loader2, Calendar, Building2
} from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  productName: string;
  productCode?: string;
  quantity: number;
  currency: string;
  marketType: string;
  priority: number;
  currentState: { code: string; name: string; color: string };
  contact?: { name: string };
  createdBy?: { firstName: string; lastName: string };
  createdAt: string;
  deadline?: string;
  _count?: { issues: number };
}

export default function OrdersListPage() {
  const { hasAnyRole } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [marketFilter, setMarketFilter] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 0, hasNext: false, hasPrev: false });

  useEffect(() => {
    loadOrders();
  }, [page, stateFilter, marketFilter]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (search) params.search = search;
      if (stateFilter) params.stateCode = stateFilter;
      if (marketFilter) params.marketType = marketFilter;
      const res = await api.get('/orders', { params });
      setOrders(res.data.data || []);
      setMeta(res.data.meta || { total: 0, totalPages: 0, hasNext: false, hasPrev: false });
    } catch (err) {
      console.error('Orders load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadOrders();
  };

  const priorityLabel = (p: number) => {
    switch (p) {
      case 1: return { text: 'Acil', class: 'badge-danger' };
      case 2: return { text: 'Normal', class: 'badge-info' };
      case 3: return { text: 'Düşük', class: 'badge-neutral' };
      default: return { text: 'Normal', class: 'badge-info' };
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Siparişler</h1>
          <p className="text-sm text-muted-foreground mt-1">Toplam {meta.total} sipariş</p>
        </div>
        {hasAnyRole(['SUPER_ADMIN', 'ADMIN', 'OPERATION', 'CUSTOMER_REP']) && (
          <Link href="/dashboard/orders/new" className="btn-primary">
            <Plus className="w-4 h-4" />
            Yeni Sipariş
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="glass-card p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Sipariş no, ürün adı veya müşteri ara..."
              className="form-input pl-10"
            />
          </form>
          <select
            value={marketFilter}
            onChange={(e) => { setMarketFilter(e.target.value); setPage(1); }}
            className="form-select w-full md:w-48"
          >
            <option value="">Tüm Pazarlar</option>
            <option value="DOMESTIC">İç Piyasa</option>
            <option value="EXPORT">İhracat</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <ClipboardList className="w-16 h-16 text-muted-foreground/20 mb-4" />
            <p className="text-muted-foreground text-lg">Sipariş bulunamadı</p>
            <p className="text-muted-foreground/60 text-sm mt-1">Filtrelerinizi değiştirin veya yeni sipariş oluşturun</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Sipariş No</th>
                  <th>Ürün</th>
                  <th>Müşteri</th>
                  <th>Adet</th>
                  <th>Pazar</th>
                  <th>Durum</th>
                  <th>Öncelik</th>
                  <th>Termin</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, i) => (
                  <tr key={order.id} className="animate-slide-up" style={{ animationDelay: `${i * 30}ms` }}>
                    <td>
                      <Link
                        href={`/dashboard/orders/${order.id}`}
                        className="font-semibold text-primary hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td>
                      <div>
                        <p className="font-medium text-foreground">{order.productName}</p>
                        {order.productCode && <p className="text-xs text-muted-foreground">{order.productCode}</p>}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-sm">{order.contact?.name || '—'}</span>
                      </div>
                    </td>
                    <td className="font-medium">{order.quantity.toLocaleString('tr-TR')}</td>
                    <td>
                      <span className={order.marketType === 'EXPORT' ? 'badge-primary' : 'badge-neutral'}>
                        {order.marketType === 'EXPORT' ? '🌍 İhracat' : '🇹🇷 İç Piyasa'}
                      </span>
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{ backgroundColor: `${order.currentState.color}20`, color: order.currentState.color }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: order.currentState.color }} />
                        {order.currentState.name}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${priorityLabel(order.priority).class}`}>
                        {priorityLabel(order.priority).text}
                      </span>
                    </td>
                    <td>
                      {order.deadline ? (
                        <div className="flex items-center gap-1.5 text-sm">
                          <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                          {new Date(order.deadline).toLocaleDateString('tr-TR')}
                        </div>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Sayfa {page} / {meta.totalPages} ({meta.total} kayıt)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={!meta.hasPrev}
                className="btn-ghost btn-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={!meta.hasNext}
                className="btn-ghost btn-sm"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
