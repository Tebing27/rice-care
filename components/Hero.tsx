"use client";

import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

export default function Hero() {
  const controls = useAnimation();
  const [ref, inView] = useInView();
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const rect = element.getBoundingClientRect();
    
    // Menghitung posisi mouse relatif terhadap elemen
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Menghitung rotasi berdasarkan posisi mouse
    const rotateX = ((y - rect.height / 2) / rect.height) * 30;
    const rotateY = ((x - rect.width / 2) / rect.width) * 30;
    
    setRotateX(-rotateX);
    setRotateY(rotateY);
  };

  const handleMouseLeave = () => {
    // Reset rotasi ketika mouse meninggalkan elemen
    setRotateX(0);
    setRotateY(0);
  };

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center pt-16 md:pt-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-green-50 to-white pointer-events-none" />
      <div className="max-w-7xl mx-auto px-0 sm:px-16 lg:px-8 py-6 md:py-12 relative z-10">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={controls}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8"
        >
          <motion.div 
            variants={itemVariants}
            className="w-full lg:w-1/2 lg:pr-8 mt-16 md:mt-0"
          >
            <motion.h1 
              className="text-3xl md:text-4xl font-bold text-gray-900 sm:text-5xl pl-4"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              Halo, Selamat Datang di Rise and Care Tracker App
              <span className="text-green-500 block mt-2"> #JagaKesehatanAnda</span>
            </motion.h1>
            <motion.p
              className="mt-4 text-base md:text-lg text-gray-600 pl-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Pantau kesehatan Anda dengan mudah dan akurat menggunakan Rise and Care Tracker.
            </motion.p>
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-6 md:mt-8"
            >
              </motion.div>
              <div className="pl-4">
                <Link href="/dashboard">
                  <Button size="lg" variant="green" className="text-xl px-8 py-4">
                    Tracking Sekarang
                  </Button>
                </Link>
              </div>
              
              </motion.div>
          <motion.div
            className="mt-8 lg:mt-0 lg:w-1/2 perspective-1000 h-[300px] md:h-[500px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <motion.div
              className="relative w-full h-full"
              animate={{
                rotateX,
                rotateY,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
              style={{
                transformStyle: "preserve-3d",
                perspective: "1000px"
              }}
            >
              <Image 
                src="/images/produk.png"
                alt="Produk Rise and Care"
                fill
                className="object-contain transition-transform duration-300"
                style={{
                  backfaceVisibility: "hidden",
                  transform: `translateZ(50px)`
                }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Efek dekorasi - sesuaikan ukuran untuk mobile */}
      <motion.div
        className="absolute -bottom-10 -left-10 md:-bottom-20 md:-left-20 w-48 md:w-72 h-48 md:h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.7, 0.4, 0.7],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
        }}
      />
      <motion.div
        className="absolute -top-10 -right-10 md:-top-20 md:-right-20 w-48 md:w-72 h-48 md:h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.7, 0.4, 0.7],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          delay: 2,
        }}
      />
    </main>
  );
}