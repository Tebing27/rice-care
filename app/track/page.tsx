"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Badge } from "@/components/ui/badge";
import ChatBotIcon from "@/components/ChatBotIcon";

interface BloodSugarRecord {
id: string;
date: string;
time: string;
bloodSugar: number;
age: string;
type: string;
description: string;
condition: string;
}

// Tambahkan utility functions
const getLocalStorageSize = () => {
  let total = 0;
  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length * 2;
    }
  }
  return (total / 1024).toFixed(2); // dalam KB
};

const cleanOldData = () => {
  const records = JSON.parse(localStorage.getItem('bloodSugarRecords') || '[]');
  const latestRecords = records.slice(-100); // simpan 100 record terakhir
  localStorage.setItem('bloodSugarRecords', JSON.stringify(latestRecords));
};

export default function Home() {
const [formData, setFormData] = useState({
date: "",
time: "",
bloodSugar: "",
age: "",
type: "food",
description: "",
condition: "normal"
});

const [records, setRecords] = useState<BloodSugarRecord[]>([]);
const [dailyStats, setDailyStats] = useState({
average: 0,
min: 0,
max: 0,
status: "Normal"
});

const [storageSize, setStorageSize] = useState<string>('0');

// Fungsi untuk update storage size
const updateStorageSize = () => {
  const size = getLocalStorageSize();
  setStorageSize(size);
  
  // Warning jika mendekati batas
  if (parseFloat(size) > 4000) {
    alert('Peringatan: Penyimpanan hampir penuh! Silakan backup atau bersihkan data lama.');
  }
};

const getStatus = (value: number, age: string) => {
if (!age) return "Tidak dapat ditentukan";


const ageNum = parseInt(age);
if (ageNum < 6) {
  if (value < 100) return "Rendah";
  if (value > 200) return "Tinggi";
  return "Normal";
} else if (ageNum <= 12) {
  if (value < 70) return "Rendah";
  if (value > 150) return "Tinggi";
  return "Normal";
} else {
  if (value < 70) return "Rendah";
  if (value > 130) return "Tinggi";
  return "Normal";
}
};

const getStatusColor = (status: string) => {
switch (status) {
case "Rendah": return "text-blue-600";
case "Tinggi": return "text-red-600";
default: return "text-green-600";
}
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const newRecord = {
      ...formData,
      id: crypto.randomUUID(),
      bloodSugar: Number(formData.bloodSugar),
      createdAt: new Date().toISOString() // tambah timestamp untuk sorting
    };
    
    const existingRecords = JSON.parse(localStorage.getItem('bloodSugarRecords') || '[]');
    const updatedRecords = [...existingRecords, newRecord];
    
    localStorage.setItem('bloodSugarRecords', JSON.stringify(updatedRecords));
    setRecords(updatedRecords);
    
    // Reset form
    setFormData({
      date: "",
      time: "",
      bloodSugar: "",
      age: "",
      type: "food",
      description: "",
      condition: "normal"
    });

    // Update storage size setelah menambah data
    updateStorageSize();
  } catch (error) {
    console.error("Error saving record:", error);
    alert("Gagal menyimpan data");
  }
};

// Tambahkan fungsi untuk export data
const handleExportData = () => {
  const records = JSON.parse(localStorage.getItem('bloodSugarRecords') || '[]');
  const dataStr = JSON.stringify(records, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `blood-sugar-records-${new Date().toISOString()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Tambahkan fungsi untuk membersihkan data
const handleCleanData = () => {
  if (window.confirm('Apakah Anda yakin ingin membersihkan data lama? Hanya 100 record terakhir yang akan disimpan.')) {
    cleanOldData();
    const updatedRecords = JSON.parse(localStorage.getItem('bloodSugarRecords') || '[]');
    setRecords(updatedRecords);
    updateStorageSize();
    alert('Data lama telah dibersihkan');
  }
};

useEffect(() => {
  // Load data saat komponen dimuat
  const savedRecords = JSON.parse(localStorage.getItem('bloodSugarRecords') || '[]');
  setRecords(savedRecords);
  updateStorageSize();
}, []);

useEffect(() => {
if (records.length > 0) {
// Get today's date in YYYY-MM-DD format
const today = new Date().toISOString().split('T')[0];


  // Filter records for today only
  const todayRecords = records.filter(record => record.date === today);
  
  if (todayRecords.length > 0) {
    const values = todayRecords.map(r => r.bloodSugar);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const status = getStatus(avg, todayRecords[0].age);
    
    setDailyStats({
      average: Math.round(avg),
      min: Math.min(...values),
      max: Math.max(...values),
      status
    });
  } else {
    // Reset stats if no records for today
    setDailyStats({
      average: 0,
      min: 0,
      max: 0,
      status: "Normal"
    });
  }
}
}, [records]);

const chartData = records.map(record => ({
time: record.time,
value: record.bloodSugar
}));

return (
<div className="min-h-screen bg-gray-50 p-4 md:p-8">
<div className="max-w-4xl mx-auto space-y-8">
<Card className="p-6">
<h1 className="text-2xl font-bold mb-6">Pencatatan Gula Darah</h1>


      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="date">Tanggal</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="time">Waktu</Label>
            <Input
              id="time"
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bloodSugar">Kadar Gula Darah (mg/dL)</Label>
            <Input
              id="bloodSugar"
              type="number"
              placeholder="Contoh: 100"
              value={formData.bloodSugar}
              onChange={(e) => setFormData({ ...formData, bloodSugar: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="age">Usia (tahun)</Label>
            <Input
              id="age"
              type="number"
              placeholder="Masukkan usia"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Jenis</Label>
            <RadioGroup
              value={formData.type}
              onValueChange={(value: string | null) => setFormData({ ...formData, type: value || '' })}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="food" id="food" />
                <Label htmlFor="food">Makanan</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="drink" id="drink" />
                <Label htmlFor="drink">Minuman</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Deskripsi Makanan/Minuman</Label>
            <Textarea
              id="description"
              placeholder="Masukkan deskripsi makanan atau minuman"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Kondisi</Label>
            <Select
              value={formData.condition}
              onValueChange={(value: string | null) => setFormData({ ...formData, condition: value || '' })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih kondisi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Sewaktu (Tanpa Puasa)</SelectItem>
                <SelectItem value="fasting">Puasa</SelectItem>
                <SelectItem value="after-meal">Setelah Makan</SelectItem>
                <SelectItem value="before-sleep">Sebelum Tidur</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button type="submit" className="w-90% bg-green-400 text-black">Simpan Data</Button>
      </form>
    </Card>


    {records.length > 0 && (
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Statistik 24 Jam</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-500">Rata-rata</div>
            <div className="text-2xl font-bold">{dailyStats.average} mg/dL</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-500">Minimum</div>
            <div className="text-2xl font-bold">{dailyStats.min} mg/dL</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-500">Maximum</div>
            <div className="text-2xl font-bold">{dailyStats.max} mg/dL</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-500">Status</div>
            <div className={`text-2xl font-bold ${getStatusColor(dailyStats.status)}`}>
              {dailyStats.status}
            </div>
          </div>
        </div>

        <div className="h-[300px] mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Waktu</TableHead>
                <TableHead>Nilai</TableHead>
                <TableHead>Kondisi</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.time}</TableCell>
                  <TableCell>{record.bloodSugar} mg/dL</TableCell>
                  <TableCell>{record.condition}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={getStatus(record.bloodSugar, record.age) === "Normal" ? "default" : "destructive"}
                    >
                      {getStatus(record.bloodSugar, record.age)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    )}

    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Kadar Gula Darah Normal</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Usia</TableHead>
            <TableHead>Gula Darah Sewaktu</TableHead>
            <TableHead>Gula Darah Puasa</TableHead>
            <TableHead>Setelah Makan & Sebelum Tidur</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>&lt; 6 tahun</TableCell>
            <TableCell>100-200 mg/dL</TableCell>
            <TableCell>± 100 mg/dL</TableCell>
            <TableCell>± 200 mg/dL</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>6-12 tahun</TableCell>
            <TableCell>70-150 mg/dL</TableCell>
            <TableCell>± 70 mg/dL</TableCell>
            <TableCell>± 150 mg/dL</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>&gt; 12 tahun</TableCell>
            <TableCell>&lt; 100 mg/dL</TableCell>
            <TableCell>70-130 mg/dL</TableCell>
            <TableCell>
              &lt; 180 mg/dL (setelah makan)<br />
              100-140 mg/dL (sebelum tidur)
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <p className="text-sm text-gray-500 mt-4">
        Jumlah kadar gula darah normal tersebut dapat bervariasi untuk setiap orang tergantung aktivitas fisik, jenis makanan, efek samping obat, dan lainnya. Bagi anak akan cenderung lebih tinggi dan mudah berubah karena perubahan hormon tertentu.
      </p>
    </Card>

    {/* <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Konsultasi Live</h2>
    </Card> */}
    <ChatBotIcon />

    <div className="mb-4 p-4 bg-gray-100 rounded-lg">
      <p className="text-sm">Penggunaan Penyimpanan: {storageSize} KB</p>
      <div className="mt-2 space-x-2">
        <button
          onClick={handleExportData}
          className="bg-green-500 text-black px-3 py-1 rounded text-sm"
        >
          Export Data
        </button>
        <button
          onClick={handleCleanData}
          className="bg-red-500 text-white px-3 py-1 rounded text-sm"
        >
          Bersihkan Data Lama
        </button>
      </div>
    </div>
  </div>
</div>
);
}