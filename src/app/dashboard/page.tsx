'use client';

import { useEffect, useState } from 'react';
import { Package, Coffee, AlertTriangle, Clock, DollarSign, RefreshCw } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { DashboardSummary } from '@/types';

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sumRes, lowRes]: any = await Promise.all([
        apiClient.get('/api/reports/summary'),
        apiClient.get('/api/alerts/low-stock'),
      ]);
      setSummary(sumRes.data);
      setLowStock(lowRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-mono">Đang tải số liệu tổng quan...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Tổng Quan Kho Hàng</h2>
          <p className="text-sm text-slate-500 mt-1">Số liệu trực tiếp từ PostgreSQL</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Làm mới</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tồn Kho Cảnh Báo</span>
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-amber-600">{summary?.lowStockCount}</div>
          <p className="text-xs text-slate-500 mt-1">Nguyên liệu chạm ngưỡng tối thiểu</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Lô Sắp Hết Hạn</span>
            <Clock className="w-5 h-5 text-red-500" />
          </div>
          <div className="text-3xl font-extrabold text-red-600">{summary?.expiringBatchCount}</div>
          <p className="text-xs text-slate-500 mt-1">Cần xuất kho trước trong 30 ngày</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng Nguyên Liệu</span>
            <Package className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{summary?.totalIngredients}</div>
          <p className="text-xs text-slate-500 mt-1">Đang quản lý trong hệ thống</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Giá Trị Kho Hàng</span>
            <DollarSign className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600">
            {summary?.totalStockValue.toLocaleString('vi-VN')} đ
          </div>
          <p className="text-xs text-slate-500 mt-1">Tính theo giá nhập của các lô active</p>
        </div>
      </div>

      {/* Warning Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <span>Danh Sách Nguyên Liệu Tồn Dưới Ngưỡng Tối Thiểu</span>
        </h3>

        {lowStock.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">Kho hàng an toàn! Không có nguyên liệu nào bị thiếu hụt.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-semibold border-b">
                <tr>
                  <th className="p-3">Mã SKU</th>
                  <th className="p-3">Tên Nguyên Liệu</th>
                  <th className="p-3">Danh Mục</th>
                  <th className="p-3">Tồn Hiện Tại</th>
                  <th className="p-3">Ngưỡng Tối Thiểu</th>
                  <th className="p-3">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lowStock.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-medium text-slate-900">{item.code}</td>
                    <td className="p-3 font-semibold text-slate-800">{item.name}</td>
                    <td className="p-3 text-slate-600">{item.category?.name}</td>
                    <td className="p-3 font-bold text-red-600">{item.currentStock} {item.baseUnit}</td>
                    <td className="p-3 text-slate-600">{item.minStockLevel} {item.baseUnit}</td>
                    <td className="p-3">
                      <span className="bg-red-100 text-red-800 text-xs px-2.5 py-1 rounded-full font-medium">Cần Nhập Hàng</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}