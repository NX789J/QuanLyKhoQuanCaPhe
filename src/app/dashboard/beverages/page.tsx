'use client';

import { useEffect, useState } from 'react';
import { Coffee, Plus, Edit2, Trash2, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { Beverage } from '@/types';

export default function BeveragesPage() {
  const [beverages, setBeverages] = useState<Beverage[]>([]);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingBeverage, setEditingBeverage] = useState<Beverage | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    sellingPrice: 0,
    recipeItems: [{ ingredientId: '', quantity: 1, unit: 'g' }],
  });
  const [submitError, setSubmitError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bevRes, ingRes]: any = await Promise.all([
        apiClient.get('/api/beverages'),
        apiClient.get('/api/ingredients'),
      ]);
      setBeverages(bevRes.data || []);
      setIngredients(ingRes.data?.items || []);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tải dữ liệu đồ uống');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    setEditingBeverage(null);
    setFormData({
      code: '',
      name: '',
      sellingPrice: 30000,
      recipeItems: [{ ingredientId: '', quantity: 1, unit: 'g' }],
    });
    setSubmitError('');
    setShowModal(true);
  };

  const handleOpenEdit = (bev: Beverage) => {
    setEditingBeverage(bev);
    setFormData({
      code: bev.code,
      name: bev.name,
      sellingPrice: bev.sellingPrice,
      recipeItems: bev.recipeItems && bev.recipeItems.length > 0
        ? bev.recipeItems.map(ri => ({ ingredientId: ri.ingredientId, quantity: ri.quantity, unit: ri.unit }))
        : [{ ingredientId: '', quantity: 1, unit: 'g' }],
    });
    setSubmitError('');
    setShowModal(true);
  };

  const handleAddRecipeRow = () => {
    setFormData({
      ...formData,
      recipeItems: [...formData.recipeItems, { ingredientId: '', quantity: 1, unit: 'g' }],
    });
  };

  const handleRemoveRecipeRow = (idx: number) => {
    setFormData({
      ...formData,
      recipeItems: formData.recipeItems.filter((_, i) => i !== idx),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    try {
      if (editingBeverage) {
        await apiClient.patch(`/api/beverages/${editingBeverage.id}`, formData);
      } else {
        await apiClient.post('/api/beverages', formData);
      }
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      setSubmitError(err.message || 'Thao tác thất bại');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa đồ uống này?')) return;
    try {
      await apiClient.delete(`/api/beverages/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xóa đồ uống');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Menu Đồ Uống & Công Thức Pha Chế</h2>
          <p className="text-sm text-slate-500">Giá vốn (COGS) tự động cập nhật theo đơn giá lô mới nhất</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center space-x-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold text-sm shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Đồ Uống Mới</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm flex items-center space-x-2 rounded">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-8 text-center text-slate-500 font-mono text-sm">Đang tải danh sách đồ uống...</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-semibold border-b">
              <tr>
                <th className="p-4">Mã Món</th>
                <th className="p-4">Tên Đồ Uống</th>
                <th className="p-4">Giá Bán</th>
                <th className="p-4">Ước Tính Giá Vốn</th>
                <th className="p-4">Thành Phần Công Thức</th>
                <th className="p-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {beverages.map((bev) => (
                <tr key={bev.id} className="hover:bg-slate-50">
                  <td className="p-4 font-mono font-bold text-slate-900">{bev.code}</td>
                  <td className="p-4 font-bold text-slate-800">{bev.name}</td>
                  <td className="p-4 text-emerald-600 font-semibold">{bev.sellingPrice.toLocaleString('vi-VN')} đ</td>
                  <td className="p-4 text-amber-600 font-semibold">{bev.estimatedCost.toLocaleString('vi-VN')} đ</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {bev.recipeItems?.map((ri) => (
                        <span key={ri.id} className="bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded border border-slate-200">
                          {ri.ingredient?.name}: <b>{ri.quantity} {ri.unit}</b>
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEdit(bev)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(bev.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              {editingBeverage ? 'Sửa Đồ Uống & Công Thức' : 'Tạo Đồ Uống Mới'}
            </h3>
            {submitError && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded border border-red-200">
                {submitError}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mã Món (SKU)</label>
                  <input
                    type="text"
                    required
                    placeholder="BEV-003"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Giá Bán Niêm Yết</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tên Đồ Uống</label>
                <input
                  type="text"
                  required
                  placeholder="Cà Phê Muối"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              {/* Recipe Section */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-800">Định Lượng Công Thức Pha Chế</span>
                  <button
                    type="button"
                    onClick={handleAddRecipeRow}
                    className="text-xs text-amber-600 font-semibold flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm Thành Phần</span>
                  </button>
                </div>

                {formData.recipeItems.map((ri, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border rounded-lg grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-6">
                      <select
                        required
                        value={ri.ingredientId}
                        onChange={(e) => {
                          const newItems = [...formData.recipeItems];
                          newItems[idx].ingredientId = e.target.value;
                          setFormData({ ...formData, recipeItems: newItems });
                        }}
                        className="w-full px-2 py-1.5 border rounded text-xs bg-white"
                      >
                        <option value="">-- Chọn Nguyên Liệu --</option>
                        {ingredients.map((ing) => (
                          <option key={ing.id} value={ing.id}>{ing.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-3">
                      <input
                        type="number"
                        required
                        min="0.0001"
                        step="any"
                        placeholder="Số lượng"
                        value={ri.quantity}
                        onChange={(e) => {
                          const newItems = [...formData.recipeItems];
                          newItems[idx].quantity = Number(e.target.value);
                          setFormData({ ...formData, recipeItems: newItems });
                        }}
                        className="w-full px-2 py-1.5 border rounded text-xs"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="text"
                        required
                        placeholder="g, ml..."
                        value={ri.unit}
                        onChange={(e) => {
                          const newItems = [...formData.recipeItems];
                          newItems[idx].unit = e.target.value;
                          setFormData({ ...formData, recipeItems: newItems });
                        }}
                        className="w-full px-2 py-1.5 border rounded text-xs"
                      />
                    </div>
                    <div className="col-span-1 text-center">
                      {formData.recipeItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveRecipeRow(idx)}
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
                  Lưu Đồ Uống
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}