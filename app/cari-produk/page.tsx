'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Head from 'next/head';
import { Card } from '@/components/ui/card';

const CariProdukPage = () => {
  return (
    <>
      <Head> 
        <meta 
          httpEquiv="Content-Security-Policy" 
          content="
            default-src 'self' https://nilaigizi.com https://*.nilaigizi.com https://www.googletagmanager.com https://www.google-analytics.com;
            script-src 'self' 'unsafe-inline' 'unsafe-eval' https://nilaigizi.com https://*.nilaigizi.com https://cdnjs.cloudflare.com https://cdn.jsdelivr.net https://unpkg.com https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net https://platform.twitter.com;
            style-src 'self' 'unsafe-inline' https://nilaigizi.com https://*.nilaigizi.com https://fonts.googleapis.com https://cdnjs.cloudflare.com https://platform.twitter.com;
            img-src 'self' data: blob: https: http: https://www.google-analytics.com https://stats.g.doubleclick.net https://www.googletagmanager.com;
            font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com https://fonts.googleapis.com;
            connect-src 'self' https://nilaigizi.com https://*.nilaigizi.com https://api.nilaigizi.com https://www.google-analytics.com https://stats.g.doubleclick.net https://www.googletagmanager.com wss: ws:;
            frame-src 'self' https://nilaigizi.com https://*.nilaigizi.com https://www.youtube.com https://www.google.com https://www.facebook.com https://platform.twitter.com;
            frame-ancestors 'self' https://nilaigizi.com https://*.nilaigizi.com;
            child-src 'self' https://nilaigizi.com https://*.nilaigizi.com;
            worker-src 'self' blob:;
            manifest-src 'self';
            media-src 'self' https: data: blob:;
            object-src 'none';
            base-uri 'self';
            form-action 'self' https://nilaigizi.com https://*.nilaigizi.com;
            upgrade-insecure-requests;
          " 
        />
        
        {/* Additional security headers */}
        <meta httpEquiv="X-Frame-Options" content="SAMEORIGIN" />
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta httpEquiv="Strict-Transport-Security" content="max-age=31536000; includeSubDomains" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta httpEquiv="Set-Cookie" content="SameSite=None; Secure; Partitioned" />
        
        <title>Cari Produk - Nilai Gizi</title>
      </Head>
      <Navbar />
      <main className="pt-16">
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <Card className="p-6">
              <h1 className="text-2xl font-bold mb-6">Cari Produk - Nilai Gizimu!</h1>
              <div
                id="nilaigizi-iframe"
                className="w-full h-[calc(100vh-200px)] border border-gray-300 rounded-lg shadow-lg mb-4"
              >
                <iframe
                  src="https://nilaigizi.com/gizi"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  allowFullScreen
                  loading="lazy"
                  sandbox="allow-same-origin allow-scripts allow-forms allow-navigation allow-top-navigation allow-popups allow-popups-to-escape-sandbox"
                  referrerPolicy="strict-origin-when-cross-origin"
                  title="Nilai Gizi Website"
                  className="rounded-lg"
                  allow="accelerometer; camera; encrypted-media; geolocation; gyroscope; microphone; midi; payment; usb"
                  //credentialless="true"
                />
              </div>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
};

export default CariProdukPage;