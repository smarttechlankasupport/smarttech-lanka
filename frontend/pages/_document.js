/* ============================================
   frontend/pages/_document.js
   Purpose: Custom HTML document — SEO meta,
            fonts, favicon, theme color
   ============================================ */
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="UTF-8" />
        <meta name="theme-color" content="#020810" />
        <meta name="color-scheme" content="dark" />
        <link rel="icon" href="/logo.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        {/* Preconnect for fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Exo+2:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* Structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Smart  Tech',
              url: 'https://smarttechlanka.lk',
              logo: 'https://smarttechlanka.lk/logo.png',
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+94-77-123-4567',
                contactType: 'customer service',
                availableLanguage: ['English', 'Sinhala'],
              },
              address: {
                '@type': 'PostalAddress',
                streetAddress: 'No 160, 1st floor, Wilgoda Road',
                addressLocality: 'Kurunegala',
                addressCountry: 'LK',
              },
              sameAs: [
                'https://facebook.com/smarttechlanka',
                'https://instagram.com/smarttechlanka',
              ],
            }),
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
