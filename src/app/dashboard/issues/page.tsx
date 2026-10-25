'use client';

import { useEffect, useState } from 'react';
import { ArrowUpRight, Plus, Trash2, XCircle } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

export default function IssuesPage() {
  const [issues, setIssues] = useState<any[]>([]);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState('Pha chế đồ uống hàng ngày');
  const [items, setItems] = useState([{ ingredientId: '', quantity: 1 }]);
  const [submitError, setSubmitError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [issRes, ingRes]: any = await Promise.all([
        apiClient.get('/api/stock-issues'),
        apiClient.get('/api/ingredients'),
      ]);
      setIssues(issRes.data || []);
      setIngredients(ingRes.data?.items || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddItem = () => {
    setItems([...items, { ingredientId: '', quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    try {
      await apiClient.post('/api/stock-issues', {
        reason,
        items,
      });
      setShowModal(false);
      setItems([{ ingredientId: '', quantity: 1 }]);
      fetchData();
    } catch (err: any) {
      setSubmitError(err.message || 'Tạo phiếu xuất kho thất bại');
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn hủy phiếu xuất kho này?')) return;
    try {
      await apiClient.post(`/api/stock-issues/${id}/cancel`);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Hủy phiếu thất bại');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Nhật Ký Xuất Kho (FEFO)</h2>
          <p className="text-sm text-slate-500">Tự động trừ số lượng theo thứ tự Lô gần hết hạn trước</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold text-sm shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo Phiếu Xuất Kho</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-8 text-center text-slate-500 font-mono text-sm">Đang tải nhật ký xuất kho...</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-semibold border-b">
              <tr>
                <th className="p-4">Mã Phiếu</th>
                <th className="p-4">Lý Do Xuất</th>
                <th className="p-4">Người Thực Hiện</th>
                <th className="p-4">Trạng Thái</th>
                <th className="p-4">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {issues.map((i) => (
                <tr key={i.id} className="hover:bg-slate-50">
                  <td className="p-4 font-mono font-bold text-slate-900">{i.code}</td>
                  <td className="p-4 text-slate-800">{i.reason}</td>
                  <td className="p-4 text-slate-600">{i.creator?.fullName}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                      i.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {i.status}
                    </span>
                  </td>
                  <td className="p-4">
                    {i.status === 'COMPLETED' && (
                      <button
                        onClick={() => handleCancel(i.id)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-semibold shadow-xs flex items-center space-x-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Hủy Phiếu</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Tạo Phiếu Xuất Kho */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Tạo Phiếu Xuất Kho Mới</h3>
            {submitError && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded border border-red-200">
                {submitError}
              </div>
            )}
            <form onSubmit={handleCreateIssue} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Lý Do Xuất Kho</label>
                <input
                  type="text"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-800">Chi Tiết Xuất Nguyên Liệu</span>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-xs text-amber-600 font-semibold flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm Món</span>
                  </button>
                </div>

                {items.map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border rounded-lg grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-7">
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
                        <option value="">-- Chọn Nguyên Liệu --</option>
                        {ingredients.map((ing) => (
                          <option key={ing.id} value={ing.id}>{ing.name} (Khả dụng: {ing.currentStock} {ing.baseUnit})</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-4">
                      <input
                        type="number"
                        required
                        min="0.001"
                        step="any"
                        placeholder="Số lượng xuất"
                        value={item.quantity}
                        onChange={(e) => {
                          const newItems = [...items];
                          newItems[idx].quantity = Number(e.target.value);
                          setItems(newItems);
                        }}
                        className="w-full px-2 py-1.5 border rounded text-xs"
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
                  className="px-4 py-2 border rounded-lg text-sm font-semibold text-slate-600"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-semibold shadow-sm"
                >
                  Xác Nhận Xuất FEFO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}