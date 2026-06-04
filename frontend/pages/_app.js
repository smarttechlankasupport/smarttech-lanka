/* ============================================
   frontend/pages/_app.js
   Purpose: Root app — wraps all pages with
            providers, toast, global styles
   ============================================ */
import '../styles/globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { DefaultSeo } from 'next-seo';

const SEO_CONFIG = {
  titleTemplate:   '%s | Smart Tech Lanka',
  defaultTitle:    'Smart Tech Lanka',
  description:     "Sri Lanka's #1 smart home solutions provider. Shop smart lights, CCTV, locks, automation & more.",
  canonical:       process.env.NEXT_PUBLIC_SITE_URL,
  openGraph: {
    type:        'website',
    locale:      'en_LK',
    url:         process.env.NEXT_PUBLIC_SITE_URL,
    siteName:    'Smart  Tech',
    title:       'Smart  Tech — Smart Home Solutions',
    description: "Sri Lanka's #1 smart home solutions provider.",
  },
  twitter: { cardType: 'summary_large_image' },
  additionalMetaTags: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'theme-color', content: '#070707' },
  ],
};

export default function App({ Component, pageProps }) {
  const getLayout = Component.getLayout || ((page) => page);
  return (
    <>
      <DefaultSeo {...SEO_CONFIG} />
      <AuthProvider>
        <CartProvider>
          {getLayout(<Component {...pageProps} />)}
          <Toaster
            position="top-right"
            gutter={8}
            toastOptions={{
              duration: 3500,
              className: 'toast-custom',
              style: { background: '#111111', color: '#f8f8f8', border: '1px solid rgba(255,255,255,0.08)', fontFamily: "'Inter', sans-serif" },
              success: { iconTheme: { primary: '#ffffff', secondary: '#111111' } },
              error:   { iconTheme: { primary: '#ffffff', secondary: '#111111' } },
            }}
          />
        </CartProvider>
      </AuthProvider>
    </>
  );
}
