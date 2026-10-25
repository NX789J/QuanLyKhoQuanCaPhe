import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Aroma Coffee Inventory',
  description: 'Hệ thống quản lý kho nguyên liệu quán cà phê',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
