"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

const About = () => {
  return (
    <section id="profil" className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4 text-center">Tentang Rise and Care</h2>
          <p className="text-xl text-gray-600">Solusi Modern untuk Pemantauan Kesehatan Anda</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Image
              src="/images/produk.png"
              alt="About Rise and Care"
              width={500}
              height={400}
              className="rounded-lg shadow-xl"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <h3 className="text-2xl font-semibold text-gray-900">
              Mengapa Memilih Rise and Care?
            </h3>
            <p className="text-lg text-gray-700">
              Rise and Care adalah platform inovatif yang dirancang khusus untuk membantu Anda mengelola dan memantau kadar gula darah dengan lebih efektif. Dengan teknologi modern dan antarmuka yang user-friendly, kami berkomitmen untuk memberikan pengalaman terbaik dalam perjalanan kesehatan Anda.
            </p>
            <div className="grid grid-cols-2 gap-6 mt-8">
              <div className="text-center">
                <h4 className="text-4xl font-bold text-green-500">1000+</h4>
                <p className="text-gray-600">Pengguna Aktif</p>
              </div>
              <div className="text-center">
                <h4 className="text-4xl font-bold text-green-500">98%</h4>
                <p className="text-gray-600">Tingkat Kepuasan</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default About;