'use client';

import { useEffect, useState } from 'react';
import { ArrowDownLeft, CheckCircle2, Plus, Trash2 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [supplierId, setSupplierId] = useState('');
  const [note, setNote] = useState('');
  const [items, setItems] = useState([
    { ingredientId: '', quantity: 1, unitPrice: 0, expirationDate: '' },
  ]);
  const [submitError, setSubmitError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [recRes, supRes, ingRes]: any = await Promise.all([
        apiClient.get('/api/stock-receipts'),
        apiClient.get('/api/suppliers'),
        apiClient.get('/api/ingredients'),
      ]);
      setReceipts(recRes.data || []);
      setSuppliers(supRes.data || []);
      setIngredients(ingRes.data?.items || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddItem = () => {
    setItems([...items, { ingredientId: '', quantity: 1, unitPrice: 0, expirationDate: '' }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleConfirm = async (id: string) => {
    try {
      await apiClient.post(`/api/stock-receipts/${id}/confirm`);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Xác nhận thất bại');
    }
  };

  const handleCreateReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    try {
      await apiClient.post('/api/stock-receipts', {
        supplierId,
        note,
        items,
      });
      setShowModal(false);
      setItems([{ ingredientId: '', quantity: 1, unitPrice: 0, expirationDate: '' }]);
      setNote('');
      fetchData();
    } catch (err: any) {
      setSubmitError(err.message || 'Tạo phiếu nhập thất bại');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Lịch Sử & Phiếu Nhập Kho</h2>
          <p className="text-sm text-slate-500">Tạo phiếu nhập và xác nhận để tăng kho</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold text-sm shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo Phiếu Nhập Kho</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-8 text-center text-slate-500 font-mono text-sm">Đang tải phiếu nhập...</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-semibold border-b">
              <tr>
                <th className="p-4">Mã Phiếu</th>
                <th className="p-4">Nhà Cung Cấp</th>
                <th className="p-4">Tổng Tiền</th>
                <th className="p-4">Trạng Thái</th>
                <th className="p-4">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {receipts.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="p-4 font-mono font-bold text-slate-900">{r.code}</td>
                  <td className="p-4 text-slate-800 font-medium">{r.supplier?.name}</td>
                  <td className="p-4 font-semibold text-emerald-600">{Number(r.totalAmount).toLocaleString('vi-VN')} đ</td>
                  <td className="p-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                      r.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="p-4">
                    {r.status === 'DRAFT' && (
                      <button
                        onClick={() => handleConfirm(r.id)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold shadow-xs flex items-center space-x-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Xác Nhận Nhập</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Tạo Phiếu Nhập */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl my-8">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Tạo Phiếu Nhập Kho Mới</h3>
            {submitError && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded border border-red-200">
                {submitError}
              </div>
            )}
            <form onSubmit={handleCreateReceipt} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nhà Cung Cấp</label>
                <select
                  required
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                >
                  <option value="">-- Chọn Nhà Cung Cấp --</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ghi Chú</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ghi chú đợt nhập..."
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-800">Chi Tiết Hàng Nhập</span>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-xs text-amber-600 hover:text-amber-700 font-semibold flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm Dòng</span>
                  </button>
                </div>

                {items.map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border rounded-lg grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-4">
                      <select
                        required
                        value={item.ingredientId}
                        onChange={(e) => {
                          const newItems = [...items];
                          newItems[idx].ingredientId = e.target.value;
                          setItems(newItems);
                        }}
                        className="w-full px-2 py-1.5 border rounded text-xs bg-white"
                      >
                        <option value="">-- Nguyên Liệu --</option>
                        {ingredients.map((ing) => (
                          <option key={ing.id} value={ing.id}>{ing.name} ({ing.baseUnit})</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        required
                        min="0.001"
                        step="any"
                        placeholder="Số lượng"
                        value={item.quantity}
                        onChange={(e) => {
                          const newItems = [...items];
                          newItems[idx].quantity = Number(e.target.value);
                          setItems(newItems);
                        }}
                        className="w-full px-2 py-1.5 border rounded text-xs"
                      />
                    </div>
                    <div className="col-span-3">
                      <input
                        type="number"
                        required
                        min="0"
                        placeholder="Đơn giá"
                        value={item.unitPrice}
                        onChange={(e) => {
                          const newItems = [...items];
                          newItems[idx].unitPrice = Number(e.target.value);
                          setItems(newItems);
                        }}
                        className="w-full px-2 py-1.5 border rounded text-xs"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="date"
                        required
                        value={item.expirationDate}
                        onChange={(e) => {
                          const newItems = [...items];
                          newItems[idx].expirationDate = e.target.value;
                          setItems(newItems);
                        }}
                        className="w-full px-1 py-1.5 border rounded text-xs"
                      />
                    </div>
                    <div className="col-span-1 text-center">
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-lg text-sm text-slate-600 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-semibold shadow-sm"
                >
                  Lưu Phiếu Nháp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}