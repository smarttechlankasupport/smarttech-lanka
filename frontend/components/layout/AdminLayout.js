import Link from 'next/link';
import Navbar from './Navbar';

export default function AdminLayout({ title = 'Admin', children }) {
  return (
    <div className="min-h-screen flex flex-col bg-dark">
      <Navbar />
      <div className="flex-1 pt-16 lg:pl-64">
        <div className="fixed left-0 top-16 h-full w-64 bg-[#0b0b0b] border-r border-white/5 hidden lg:block">
          <div className="p-4">
            <h3 className="text-white font-bold mb-4">Admin</h3>
            <nav className="space-y-2 text-sm">
              <Link href="/admin" className="block px-3 py-2 rounded-md text-gray-300 hover:bg-white/5">Dashboard</Link>
              <Link href="/admin/products" className="block px-3 py-2 rounded-md text-gray-300 hover:bg-white/5">Products</Link>
              <Link href="/admin/orders" className="block px-3 py-2 rounded-md text-gray-300 hover:bg-white/5">Orders</Link>
              <Link href="/admin/customers" className="block px-3 py-2 rounded-md text-gray-300 hover:bg-white/5">Customers</Link>
              <Link href="/admin/categories" className="block px-3 py-2 rounded-md text-gray-300 hover:bg-white/5">Categories</Link>
              <Link href="/admin/services" className="block px-3 py-2 rounded-md text-gray-300 hover:bg-white/5">Services</Link>
              <Link href="/admin/coupons" className="block px-3 py-2 rounded-md text-gray-300 hover:bg-white/5">Coupons</Link>
            </nav>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-6">
          <div className="mb-6">
            <h1 className="text-white text-2xl font-bold">{title}</h1>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
