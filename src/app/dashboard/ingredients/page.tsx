'use client';

import { useEffect, useState } from 'react';
import { Package, Plus, Search, Edit2, Trash2, AlertCircle, Calendar } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { Ingredient, IngredientCategory } from '@/types';

export default function IngredientsPage() {
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [categories, setCategories] = useState<IngredientCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    categoryId: '',
    baseUnit: 'kg',
    minStockLevel: 0,
    initialStock: 0,
    expiryDate: '',
  });
  const [submitError, setSubmitError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (selectedCategory) params.append('categoryId', selectedCategory);
      const queryString = params.toString() ? `?${params.toString()}` : '';

      const [ingRes, catRes]: any = await Promise.all([
        apiClient.get(`/api/ingredients${queryString}`),
        apiClient.get('/api/categories'),
      ]);

      setIngredients(ingRes?.data?.items || []);
      setCategories(catRes?.data || []);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tải dữ liệu nguyên liệu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, selectedCategory]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      code: '',
      name: '',
      categoryId: '',
      baseUnit: 'kg',
      minStockLevel: 0,
      initialStock: 0,
      expiryDate: '',
    });
    setSubmitError('');
    setShowModal(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      code: item.code,
      name: item.name,
      categoryId: item.categoryId,
      baseUnit: item.baseUnit,
      minStockLevel: item.minStockLevel,
      initialStock: item.currentStock,
      expiryDate: '',
    });
    setSubmitError('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    try {
      if (editingItem) {
        await apiClient.patch(`/api/ingredients/${editingItem.id}`, {
          code: formData.code,
          name: formData.name,
          categoryId: formData.categoryId,
          baseUnit: formData.baseUnit,
          minStockLevel: formData.minStockLevel,
        });
      } else {
        await apiClient.post('/api/ingredients', formData);
      }
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      setSubmitError(err.message || 'Thao tác thất bại');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa nguyên liệu này?')) return;
    try {
      await apiClient.delete(`/api/ingredients/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xóa nguyên liệu');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Danh Sách Nguyên Liệu</h2>
          <p className="text-sm text-slate-500">Quản lý định lượng, hạn sử dụng và ngưỡng tồn kho</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center space-x-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold text-sm shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Nguyên Liệu</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm flex items-center space-x-2 rounded">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Tìm theo mã SKU hoặc tên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="">Tất cả danh mục</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-8 text-center text-slate-500 font-mono text-sm">Đang tải danh sách...</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-semibold border-b">
              <tr>
                <th className="p-4">Mã SKU</th>
                <th className="p-4">Tên Nguyên Liệu</th>
                <th className="p-4">Danh Mục</th>
                <th className="p-4">Tồn Hiện Tại</th>
                <th className="p-4">HSD Gần Nhất</th>
                <th className="p-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ingredients.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="p-4 font-mono font-bold text-slate-900">{item.code}</td>
                  <td className="p-4 font-semibold text-slate-800">{item.name}</td>
                  <td className="p-4 text-slate-600">{item.category?.name || 'N/A'}</td>
                  <td className={`p-4 font-bold ${Number(item.currentStock) <= Number(item.minStockLevel) ? 'text-red-600' : 'text-emerald-600'}`}>
                    {item.currentStock} {item.baseUnit}
                  </td>
                  <td className="p-4 font-mono text-slate-600">
                    {item.nearestExpiryDate ? (
                      <span className="inline-flex items-center space-x-1 text-xs bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded">
                        <Calendar className="w-3 h-3 text-amber-600" />
                        <span>{new Date(item.nearestExpiryDate).toLocaleDateString('vi-VN')}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Chưa có lô</span>
                    )}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
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
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              {editingItem ? 'Sửa Nguyên Liệu' : 'Tạo Nguyên Liệu Mới'}
            </h3>
            {submitError && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded border border-red-200">
                {submitError}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mã SKU</label>
                  <input
                    type="text"
                    required
                    placeholder="ING-005"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Đơn Vị Tính</label>
                  <input
                    type="text"
                    required
                    placeholder="kg, ml, hop..."
                    value={formData.baseUnit}
                    onChange={(e) => setFormData({ ...formData, baseUnit: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tên Nguyên Liệu</label>
                <input
                  type="text"
                  required
                  placeholder="Siro Dâu Monin"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Danh Mục</label>
                <select
                  required
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ngưỡng Tồn Min</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minStockLevel}
                    onChange={(e) => setFormData({ ...formData, minStockLevel: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                {!editingItem && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Tồn Khai Báo Đầu</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.initialStock}
                      onChange={(e) => setFormData({ ...formData, initialStock: Number(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                )}
              </div>

              {!editingItem && Number(formData.initialStock) > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Hạn Sử Dụng Ban Đầu</label>
                  <input
                    type="date"
                    required
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-lg text-sm text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-semibold shadow-sm"
                >
                  Lưu Dữ Liệu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}