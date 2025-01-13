"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, BarChart2, Clock, Shield } from 'lucide-react'
import { motion } from 'framer-motion'

const features = [
  {
    title: "Pemantauan Real-time",
    description: "Pantau kadar gula darah Anda secara real-time dengan antarmuka yang intuitif dan mudah digunakan.",
    icon: Activity,
  },
  {
    title: "Analisis Data Komprehensif",
    description: "Dapatkan wawasan mendalam tentang pola gula darah Anda melalui grafik dan laporan terperinci.",
    icon: BarChart2,
  },
  {
    title: "Riwayat & Pengingat",
    description: "Kelola riwayat pengukuran dan atur pengingat untuk pemeriksaan rutin gula darah Anda.",
    icon: Clock,
  },
  {
    title: "Keamanan Data",
    description: "Data Anda dilindungi dengan sistem keamanan tingkat tinggi dan enkripsi end-to-end.",
    icon: Shield,
  },
]

export default function Features() {
  return (
    <section id="fitur" className="py-20 px-4 bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-4xl font-bold text-center mb-12">Fitur Unggulan</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              whileHover={{ scale: 1.05 }}
            >
              <Card className="bg-white rounded-lg shadow-lg h-full">
                <CardHeader>
                  <feature.icon className="w-12 h-12 mb-4 text-green-400" />
                  <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
