'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Clock } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

export default function AlertsPage() {
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [expiring, setExpiring] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiClient.get('/api/alerts/low-stock'),
      apiClient.get('/api/alerts/expiring-batches?days=30'),
    ]).then(([lowRes, expRes]: any) => {
      setLowStock(lowRes.data || []);
      setExpiring(expRes.data || []);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Trung Tâm Cảnh Báo Kho</h2>
        <p className="text-sm text-slate-500">Giám sát các rủi ro về hết hạn sử dụng và thiếu hụt tồn kho</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Low Stock Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <h3 className="text-lg font-bold text-amber-700 mb-4 flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <span>Tồn Kho Dưới Ngưỡng Tối Thiểu ({lowStock.length})</span>
          </h3>
          <div className="space-y-3">
            {lowStock.map((item) => (
              <div key={item.id} className="p-3 bg-amber-50 rounded-lg border border-amber-200 flex justify-between items-center text-sm">
                <div>
                  <div className="font-bold text-slate-900">{item.name} ({item.code})</div>
                  <div className="text-xs text-amber-800">Cần nhập thêm để duy trì pha chế</div>
                </div>
                <div className="font-bold text-red-600">{item.currentStock} / {item.minStockLevel} {item.baseUnit}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Expiring Batches Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <h3 className="text-lg font-bold text-red-700 mb-4 flex items-center space-x-2">
            <Clock className="w-5 h-5 text-red-500" />
            <span>Lô Sắp Hết Hạn Trong 30 Ngày ({expiring.length})</span>
          </h3>
          <div className="space-y-3">
            {expiring.map((batch) => (
              <div key={batch.id} className="p-3 bg-red-50 rounded-lg border border-red-200 flex justify-between items-center text-sm">
                <div>
                  <div className="font-bold text-slate-900">{batch.ingredient?.name}</div>
                  <div className="text-xs text-red-700">Mã Lô: {batch.batchNumber} | HSD: {new Date(batch.expiryDate).toLocaleDateString('vi-VN')}</div>
                </div>
                <div className="font-bold text-red-800">{batch.currentQuantity} {batch.ingredient?.baseUnit}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}