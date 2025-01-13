"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Error Code */}
          <h1 className="text-9xl font-bold text-green-400 mb-4">404</h1>
          
          {/* Error Message */}
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">
            Halaman Tidak Ditemukan
          </h2>
          
          {/* Error Description */}
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Maaf, halaman yang Anda cari tidak dapat ditemukan.
          </p>

          {/* Back to Home Button */}
          <Link 
            href="/"
            className="inline-flex items-center gap-2 bg-green-400 hover:bg-green-500 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Beranda
          </Link>
        </motion.div>
      </div>
    </div>
  );
} 