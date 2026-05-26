'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';
import Link from 'next/link';
import {
  ClipboardList, CheckCircle2, XCircle, AlertTriangle,
  TrendingUp, Users, Building2, Clock, ArrowRight,
  Package, Loader2
} from 'lucide-react';

interface DashboardData {
  stats: {
    totalOrders: number;
    activeOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    openIssues: number;
    totalContacts: number;
  };
  recentOrders: any[];
  delayedOrders: any[];
}

const statCards = [
  { key: 'totalOrders', label: 'Toplam Sipariş', icon: ClipboardList, gradient: 'from-indigo-500 to-purple-600', shadow: 'shadow-indigo-500/20' },
  { key: 'activeOrders', label: 'Aktif Sipariş', icon: Package, gradient: 'from-sky-500 to-blue-600', shadow: 'shadow-sky-500/20' },
  { key: 'completedOrders', label: 'Tamamlanan', icon: CheckCircle2, gradient: 'from-emerald-500 to-green-600', shadow: 'shadow-emerald-500/20' },
  { key: 'openIssues', label: 'Açık Sorunlar', icon: AlertTriangle, gradient: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-500/20' },
];

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await api.get('/reports/dashboard');
      setData(res.data.data);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Günaydın';
    if (hour < 18) return 'İyi günler';
    return 'İyi akşamlar';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Demo data fallback
  const stats = data?.stats || { totalOrders: 0, activeOrders: 0, completedOrders: 0, cancelledOrders: 0, openIssues: 0, totalContacts: 0 };
  const recentOrders = data?.recentOrders || [];
  const delayedOrders = data?.delayedOrders || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          {getGreeting()}, <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">{user?.firstName}</span> 👋
        </h1>
        <p className="text-muted-foreground mt-1">Bugünkü üretim durumunuza genel bakış</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div key={card.key} className="stat-card animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {(stats as any)[card.key] || 0}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg ${card.shadow}`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Son Siparişler</h2>
            <Link href="/dashboard/orders" className="text-sm text-primary hover:underline flex items-center gap-1">
              Tümünü Gör <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardList className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">Henüz sipariş bulunmuyor.</p>
              <Link href="/dashboard/orders/new" className="btn-primary mt-4 inline-flex">
                İlk Siparişi Oluştur
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.slice(0, 6).map((order: any) => (
                <Link
                  key={order.id}
                  href={`/dashboard/orders/${order.id}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: order.currentState?.color || '#6b7280' }} />
                    <div>
                      <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                        {order.orderNumber}
                      </p>
                      <p className="text-xs text-muted-foreground">{order.productName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="badge" style={{ backgroundColor: `${order.currentState?.color}20`, color: order.currentState?.color }}>
                      {order.currentState?.name}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">{order.contact?.name || '—'}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Stats / Delayed Orders */}
        <div className="space-y-6">
          {/* Delayed Orders */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              Geciken Siparişler
            </h2>
            {delayedOrders.length === 0 ? (
              <div className="text-center py-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-500/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Geciken sipariş yok 🎉</p>
              </div>
            ) : (
              <div className="space-y-2">
                {delayedOrders.slice(0, 5).map((order: any) => (
                  <Link
                    key={order.id}
                    href={`/dashboard/orders/${order.id}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{order.orderNumber}</p>
                      <p className="text-xs text-red-400">{order.contact?.name}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Özet
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">İptal Edilen</span>
                <span className="text-sm font-medium text-foreground">{stats.cancelledOrders}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Toplam Firma</span>
                <span className="text-sm font-medium text-foreground">{stats.totalContacts}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tamamlanma Oranı</span>
                <span className="text-sm font-semibold text-emerald-500">
                  {stats.totalOrders > 0 ? Math.round((stats.completedOrders / stats.totalOrders) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
