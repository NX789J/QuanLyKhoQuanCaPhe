import { Controller, Get, Res, Query } from '@nestjs/common';
import { Response } from 'express';

@Controller()
export class AppDocsController {
  private readonly endpointsDoc = [
    {
      group: 'Xác thực & Tài khoản (Auth)',
      items: [
        { method: 'POST', path: '/api/auth/register', auth: 'Public', desc: 'Tạo User', body: '{ email: "admin@coffee.com", password: "string", fullName: "string", roleName: STAFF or ADMIN or WAREHOUSE_MANAGER }', response: '{ accessToken: "...", user: {...} }' },
        { method: 'POST', path: '/api/auth/login', auth: 'Public', desc: 'Đăng nhập lấy JWT Access Token', body: '{ email: "admin@coffee.com", password: "..." }', response: '{ accessToken: "...", user: {...} }' },
        { method: 'GET', path: '/api/auth/me', auth: 'Bearer Token', desc: 'Lấy thông tin tài khoản đang đăng nhập', body: 'N/A', response: '{ id: "...", email: "...", role: "ADMIN" }' },
      ]
    },
    {
      group: 'Quản lý Nguyên liệu (Ingredients)',
      items: [
        { method: 'GET', path: '/api/ingredients', auth: 'Bearer Token', desc: 'Lấy danh sách nguyên liệu (phân trang, lọc, tìm kiếm)', body: 'Query params: search, categoryId, page, limit', response: '{ items: [...], total: 10 }' },
        { method: 'POST', path: '/api/ingredients', auth: 'ADMIN, WAREHOUSE_MANAGER', desc: 'Tạo mới nguyên liệu', body: '{ code: "ING-005", name: "Trà Đen", categoryId: "...", baseUnit: "g", minStockLevel: 500 }', response: '{ id: "...", code: "ING-005" }' },
        { method: 'PATCH', path: '/api/ingredients/:id', auth: 'ADMIN, WAREHOUSE_MANAGER', desc: 'Cập nhật nguyên liệu', body: '{ name: "Trà Đen Premium", minStockLevel: 600 }', response: '{ id: "...", name: "Trà Đen Premium" }' },
      ]
    },
    {
      group: 'Quản lý Đồ uống & Công thức (Beverages & Recipes)',
      items: [
        { method: 'GET', path: '/api/beverages', auth: 'Bearer Token', desc: 'Danh sách đồ uống kèm công thức & giá vốn ước tính', body: 'N/A', response: '{ items: [{ code: "BEV-001", estimatedCost: 12000, recipeItems: [...] }] }' },
        { method: 'POST', path: '/api/beverages', auth: 'ADMIN, WAREHOUSE_MANAGER', desc: 'Tạo đồ uống kèm định lượng công thức', body: '{ code: "BEV-003", name: "Espresso", sellingPrice: 35000, recipeItems: [{ ingredientId: "...", quantity: 18, unit: "g" }] }', response: '{ id: "...", code: "BEV-003" }' },
      ]
    },
    {
      group: 'Quản lý Nhập Kho (Stock Receipts)',
      items: [
        { method: 'POST', path: '/api/stock-receipts', auth: 'ADMIN, WAREHOUSE_MANAGER', desc: 'Tạo phiếu nhập kho dạng nháp (Draft)', body: '{ supplierId: "...", note: "...", items: [{ ingredientId: "...", quantity: 10, unitPrice: 150000, expirationDate: "2027-01-01" }] }', response: '{ id: "...", code: "IMP-...", status: "DRAFT" }' },
        { method: 'POST', path: '/api/stock-receipts/:id/confirm', auth: 'ADMIN, WAREHOUSE_MANAGER', desc: 'Xác nhận phiếu nhập, sinh Lô hàng & tăng tồn kho', body: 'N/A', response: '{ id: "...", status: "CONFIRMED" }' },
      ]
    },
    {
      group: 'Quản lý Xuất Kho (Stock Issues)',
      items: [
        { method: 'POST', path: '/api/stock-issues', auth: 'Bearer Token', desc: 'Tạo phiếu xuất kho (Tự động trừ lô theo thuật toán FEFO)', body: '{ reason: "Pha chế trong ngày", items: [{ ingredientId: "...", quantity: 2.5 }] }', response: '{ id: "...", code: "EXP-...", status: "COMPLETED" }' },
        { method: 'POST', path: '/api/stock-issues/:id/cancel', auth: 'ADMIN, WAREHOUSE_MANAGER', desc: 'Hủy phiếu xuất & hoàn trả tồn kho vào lô ban đầu', body: 'N/A', response: '{ id: "...", status: "CANCELLED" }' },
      ]
    },
    {
      group: 'Cảnh báo & Báo cáo (Alerts & Reports)',
      items: [
        { method: 'GET', path: '/api/alerts/low-stock', auth: 'Bearer Token', desc: 'Danh sách nguyên liệu chạm ngưỡng tồn tối thiểu', body: 'N/A', response: '[{ code: "ING-001", currentStock: 2, minStockLevel: 5 }]' },
        { method: 'GET', path: '/api/alerts/expiring-batches', auth: 'Bearer Token', desc: 'Cảnh báo các lô hàng sắp hết hạn trong N ngày', body: 'Query param: days=30', response: '[{ batchNumber: "BAT-...", expiryDate: "2026-11-15", currentQuantity: 10 }]' },
        { method: 'GET', path: '/api/reports/summary', auth: 'Bearer Token', desc: 'Thống kê tổng quan KPI cho Dashboard', body: 'N/A', response: '{ totalIngredients: 12, lowStockCount: 2, expiringBatchCount: 1, totalStockValue: 18500000 }' },
      ]
    }
  ];

  @Get()
  getApiDocs(@Res() res: Response, @Query('format') format?: string) {
    if (format === 'json') {
      return res.json({
        system: 'Coffee Shop Inventory Management API',
        version: '1.0.0',
        endpoints: this.endpointsDoc,
      });
    }

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>API Documentation - Quản Lý Kho Quán Cà Phê</title>
      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
      <style>
        .badge-GET { background-color: #10B981; color: white; }
        .badge-POST { background-color: #3B82F6; color: white; }
        .badge-PATCH { background-color: #F59E0B; color: white; }
        .badge-DELETE { background-color: #EF4444; color: white; }
      </style>
    </head>
    <body class="bg-gray-50 text-gray-800 font-sans p-6">
      <div class="max-w-6xl mx-auto">
        <header class="mb-8 border-b pb-4 flex justify-between items-center">
          <div>
            <h1 class="text-3xl font-bold text-yellow-900">☕ HỆ THỐNG QUẢN LÝ KHO QUÁN CÀ PHÊ</h1>
            <p class="text-gray-600 mt-1">Tài liệu REST API Chuyên Nghiệp - Version 1.0.0</p>
          </div>
          <a href="/?format=json" target="_blank" class="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 text-sm font-semibold">Tải JSON Spec</a>
        </header>

        <div class="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <h3 class="font-bold text-blue-900">🔒 Hướng dẫn Xác thực & Phân quyền</h3>
          <p class="text-sm text-blue-800 mt-1">Đính kèm Header: <code class="bg-blue-100 px-2 py-0.5 rounded text-blue-900 font-mono">Authorization: Bearer &lt;YOUR_JWT_TOKEN&gt;</code> cho mọi request yêu cầu xác thực.</p>
        </div>

        ${this.endpointsDoc
          .map(
            (group) => `
          <div class="mb-8 bg-white rounded-lg shadow-sm border p-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4 border-b pb-2">${group.group}</h2>
            <div class="space-y-4">
              ${group.items
                .map(
                  (item) => `
                <div class="border rounded-md p-4 bg-gray-50 hover:bg-white transition shadow-xs">
                  <div class="flex items-center space-x-3 mb-2">
                    <span class="badge-${item.method} px-2.5 py-1 rounded text-xs font-bold font-mono">${item.method}</span>
                    <span class="font-mono font-semibold text-gray-900 text-md">${item.path}</span>
                    <span class="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded font-medium">Quyền: ${item.auth}</span>
                  </div>
                  <p class="text-sm text-gray-700 mb-3">${item.desc}</p>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                    <div class="bg-gray-900 text-green-400 p-3 rounded">
                      <div class="text-gray-400 font-sans mb-1 font-bold">Input / Body / Query:</div>
                      <pre class="whitespace-pre-wrap">${item.body}</pre>
                    </div>
                    <div class="bg-gray-900 text-blue-300 p-3 rounded">
                      <div class="text-gray-400 font-sans mb-1 font-bold">Sample Response (200 OK):</div>
                      <pre class="whitespace-pre-wrap">${item.response}</pre>
                    </div>
                  </div>
                </div>
              `,
                )
                .join('')}
            </div>
          </div>
        `,
          )
          .join('')}
      </div>
    </body>
    </html>
    `;

    return res.status(200).send(htmlContent);
  }
}