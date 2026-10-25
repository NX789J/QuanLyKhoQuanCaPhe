import Link from 'next/link';
import { Coffee, ShieldCheck, Warehouse, ArrowRight } from 'lucide-react';

export default function PublicHomePage() {
  return (
    <div className="min-h-screen bg-amber-50/40 text-gray-800 font-sans">
      <header className="bg-amber-900 text-amber-50 px-8 py-4 flex justify-between items-center shadow-md">
        <div className="flex items-center space-x-3">
          <Coffee className="w-8 h-8 text-amber-400" />
          <span className="text-xl font-bold tracking-wide">Aroma Coffee Inventory</span>
        </div>
        <Link
          href="/login"
          className="bg-amber-500 hover:bg-amber-600 text-amber-950 font-semibold px-5 py-2 rounded-lg transition duration-200 flex items-center space-x-2"
        >
          <span>Quản Trị Kho</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-amber-950 mb-4 leading-tight">
            Hệ Thống Quản Lý Kho Nguyên Liệu Quán Cà Phê
          </h1>
          <p className="text-lg text-amber-800">
            Giải pháp theo dõi tồn kho real-time, tự động trừ lô theo FEFO, cảnh báo hạn sử dụng và kiểm soát giá vốn pha chế chính xác.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-amber-100 flex flex-col items-center text-center">
            <div className="p-4 bg-amber-100 text-amber-800 rounded-full mb-4">
              <Warehouse className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Quy Tắc FEFO Chuẩn Xác</h3>
            <p className="text-sm text-gray-600">Ưu tiên xuất nguyên liệu sắp hết hạn trước, giảm thiểu hao hụt nguyên liệu nguyên chất.</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-amber-100 flex flex-col items-center text-center">
            <div className="p-4 bg-amber-100 text-amber-800 rounded-full mb-4">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Chống Xung Đột Đồng Thời</h3>
            <p className="text-sm text-gray-600">Khóa giao dịch cơ sở dữ liệu ngăn chặn việc xuất trùng kho hoặc double confirmation.</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-amber-100 flex flex-col items-center text-center">
            <div className="p-4 bg-amber-100 text-amber-800 rounded-full mb-4">
              <Coffee className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Ước Tính Giá Vốn (COGS)</h3>
            <p className="text-sm text-gray-600">Tự động tính chi phí nguyên liệu cho từng ly đồ uống dựa theo đơn giá lô nhập gần nhất.</p>
          </div>
        </div>
      </main>
    </div>
  );
}