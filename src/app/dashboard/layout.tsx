'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Layers, LayoutDashboard, Package, Coffee, Truck, ArrowDownLeft, ArrowUpRight, Bell, LogOut, User as UserIcon } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userInfo = localStorage.getItem('user_info');
    if (!userInfo) {
      router.push('/login');
    } else {
      setUser(JSON.parse(userInfo));
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_info');
    router.push('/login');
  };

const menuItems = [
  { name: 'Tổng Quan', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Danh Mục', href: '/dashboard/categories', icon: Layers },
  { name: 'Nguyên Liệu', href: '/dashboard/ingredients', icon: Package },
  { name: 'Đồ Uống & Công Thức', href: '/dashboard/beverages', icon: Coffee },
  { name: 'Nhà Cung Cấp', href: '/dashboard/suppliers', icon: Truck },
  { name: 'Nhập Kho', href: '/dashboard/receipts', icon: ArrowDownLeft },
  { name: 'Xuất Kho (FEFO)', href: '/dashboard/issues', icon: ArrowUpRight },
  { name: 'Cảnh Báo', href: '/dashboard/alerts', icon: Bell },
];

  return (
    <div className="min-h-screen bg-slate-100 flex">
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
          <Coffee className="w-7 h-7 text-amber-500" />
          <span className="font-bold text-lg text-white tracking-wide">Kho Cà Phê</span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'hover:bg-slate-800 hover:text-white text-slate-400'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center justify-between mb-3 px-2">
            <div className="flex items-center space-x-2">
              <UserIcon className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-300 font-semibold truncate max-w-[120px]">{user?.fullName}</span>
            </div>
            <span className="text-[10px] bg-slate-800 text-amber-400 px-2 py-0.5 rounded uppercase font-mono">{user?.role}</span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white text-xs font-semibold rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng Xuất</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
          <h1 className="text-xl font-bold text-slate-800">Cổng Quản Trị Hệ Thống</h1>
          <div className="text-xs text-slate-500 font-mono">Dữ liệu từ PostgreSQL Real-time</div>
        </header>

        <div className="p-8 flex-1">{children}</div>
      </main>
    </div>
  );
}