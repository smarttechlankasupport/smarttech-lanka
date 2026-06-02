/* ============================================
   frontend/components/layout/Layout.js
   Purpose: Main layout wrapper for public pages
   ============================================ */
import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-dark">
      <Navbar />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
    </div>
  );
}

export function withLayout(Component) {
  Component.getLayout = (page) => <Layout>{page}</Layout>;
  return Component;
}
