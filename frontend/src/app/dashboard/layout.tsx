'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import Link from 'next/link';
import {
  Factory, LayoutDashboard, ClipboardList, Users, Building2,
  Calculator, Tag, FlaskConical, Scissors, Ruler, ShoppingCart,
  Package, Truck, FileText, Wallet, Bell, Settings, LogOut,
  ChevronLeft, ChevronRight, Search, Moon, Sun, Menu, X,
  UserCircle2, ChevronDown
} from 'lucide-react';

const menuItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard', roles: ['SUPER_ADMIN', 'ADMIN', 'OPERATION'] },
  { label: 'Siparişler', icon: ClipboardList, href: '/dashboard/orders', roles: [] },
  { label: 'Müşteri / Tedarikçi', icon: Building2, href: '/dashboard/contacts', roles: ['SUPER_ADMIN', 'ADMIN', 'OPERATION', 'CUSTOMER_REP', 'ACCOUNTING'] },
  {
    label: 'Üretim',
    icon: Factory,
    roles: [],
    children: [
      { label: 'Kesim', href: '/dashboard/cutting', icon: Scissors },
      { label: 'Dikim / Üretim', href: '/dashboard/production', icon: Package },
      { label: 'Ütü & Paket', href: '/dashboard/ironing-packing', icon: Package },
    ]
  },
  { label: 'Kalıp & Ölçü', icon: Ruler, href: '/dashboard/patterns', roles: ['SUPER_ADMIN', 'ADMIN', 'OPERATION', 'MODELIST'] },
  { label: 'Tedarik', icon: ShoppingCart, href: '/dashboard/procurement', roles: ['SUPER_ADMIN', 'ADMIN', 'OPERATION', 'WAREHOUSE'] },
  { label: 'Sevkiyat', icon: Truck, href: '/dashboard/shipping', roles: ['SUPER_ADMIN', 'ADMIN', 'OPERATION', 'SHIPPING'] },
  { label: 'Faturalar', icon: FileText, href: '/dashboard/invoices', roles: ['SUPER_ADMIN', 'ADMIN', 'ACCOUNTING', 'OPERATION'] },
  { label: 'Cari Hesaplar', icon: Wallet, href: '/dashboard/accounting', roles: ['SUPER_ADMIN', 'ADMIN', 'ACCOUNTING', 'OPERATION'] },
  { label: 'Kullanıcılar', icon: Users, href: '/dashboard/users', roles: ['SUPER_ADMIN', 'ADMIN'] },
  { label: 'Ayarlar', icon: Settings, href: '/dashboard/settings', roles: ['SUPER_ADMIN', 'ADMIN'] },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, loadUser, logout, hasAnyRole } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  useEffect(() => {
    loadUser().then(() => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
      }
    });
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const filteredMenu = menuItems.filter(item => {
    if (item.roles && item.roles.length > 0) {
      return hasAnyRole(item.roles);
    }
    return true;
  });

  if (!isAuthenticated && typeof window !== 'undefined') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-card border-r border-border transition-all duration-300 ${sidebarOpen ? 'w-[280px]' : 'w-[72px]'} max-lg:${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0`}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 flex-shrink-0">
              <Factory className="w-5 h-5 text-white" />
            </div>
            {sidebarOpen && <span className="font-bold text-foreground text-lg tracking-tight">İmalat Takip</span>}
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex w-7 h-7 rounded-lg bg-muted items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto scrollbar-thin">
          {filteredMenu.map((item) => {
            if (item.children) {
              const isExpanded = expandedMenu === item.label;
              const isChildActive = item.children.some(c => pathname.startsWith(c.href));
              return (
                <div key={item.label}>
                  <button
                    onClick={() => setExpandedMenu(isExpanded ? null : item.label)}
                    className={`sidebar-link w-full justify-between ${isChildActive ? 'text-foreground bg-accent/50' : ''}`}
                  >
                    <span className="flex items-center gap-3">
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {sidebarOpen && <span>{item.label}</span>}
                    </span>
                    {sidebarOpen && <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />}
                  </button>
                  {isExpanded && sidebarOpen && (
                    <div className="ml-4 pl-4 border-l border-border space-y-0.5 mt-1">
                      {item.children.map(child => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`sidebar-link text-xs py-2 ${pathname.startsWith(child.href) ? 'active' : ''}`}
                        >
                          <child.icon className="w-4 h-4 flex-shrink-0" />
                          <span>{child.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href!}
                className={`sidebar-link ${pathname === item.href ? 'active' : ''}`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Card */}
        {sidebarOpen && user && (
          <div className="p-3 border-t border-border">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                {user.firstName[0]}{user.lastName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-muted-foreground truncate">{user.roles[0]}</p>
              </div>
              <button onClick={handleLogout} className="text-muted-foreground hover:text-destructive transition-colors" title="Çıkış">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Main */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-border flex items-center justify-between px-4 md:px-6 bg-card/80 backdrop-blur-xl sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden text-muted-foreground hover:text-foreground">
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/50 w-72">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Sipariş ara... (SIP-2026-XXXXX)"
                className="bg-transparent text-sm text-foreground placeholder-muted-foreground outline-none w-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
            </button>
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-muted cursor-pointer transition-colors">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold text-xs">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <span className="text-sm font-medium text-foreground">{user?.firstName}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
