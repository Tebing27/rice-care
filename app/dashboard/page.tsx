"use client";

import React, { useEffect, useCallback, useMemo, useState, memo } from "react";
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
import { useUser } from "@clerk/nextjs";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import * as XLSX from 'xlsx';
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";


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

// Update interface untuk statistik
interface DailyStats {
  average: number;
  min: number;
  max: number;
  status: string;
  count: number;
}

// Tambahkan interface untuk hasil analisis
interface AnalysisResult {
  recommendation: string;
  trend: string;
  risk: string;
}

// Pisahkan FilterSection menjadi komponen terpisah
const FilterSection = ({ 
  searchQuery, 
  setSearchQuery, 
  dateFilter, 
  setDateFilter, 
  conditionFilter, 
  setConditionFilter,
}: {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  dateFilter: string;
  setDateFilter: (value: string) => void;
  conditionFilter: string;
  setConditionFilter: (value: string) => void;
}) => {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <div>
        <Label>Cari</Label>
        <Input
          placeholder="Cari data..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div>
        <Label>Filter Tanggal</Label>
        <Input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        />
      </div>
      <div>
        <Label>Filter Kondisi</Label>
        <Select value={conditionFilter} onValueChange={setConditionFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Pilih kondisi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unassigned">Semua</SelectItem>
            <SelectItem value="normal">Sewaktu</SelectItem>
            <SelectItem value="fasting">Puasa</SelectItem>
            <SelectItem value="after-meal">Setelah Makan</SelectItem>
            <SelectItem value="before-sleep">Sebelum Tidur</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

// Tambahkan fungsi untuk memformat data grafik
const formatChartData = (data: BloodSugarRecord[]) => {
  return data.map(record => ({
    time: record.time,
    value: Number(record.bloodSugar)
  })).sort((a, b) => {
    const timeA = new Date(`2000/01/01 ${a.time}`).getTime();
    const timeB = new Date(`2000/01/01 ${b.time}`).getTime();
    return timeA - timeB;
  });
};

export default function Home() {
const { user } = useUser();

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
const [dailyStats, setDailyStats] = useState<DailyStats>({
average: 0,
min: 0,
max: 0,
status: "Normal",
count: 0
});

const [searchQuery, setSearchQuery] = useState("");
const [dateFilter, setDateFilter] = useState("");
const [conditionFilter, setConditionFilter] = useState("all");
const [isLoading, setIsLoading] = useState(false);
const [allRecords] = useState<BloodSugarRecord[]>([]);
const [isEditModalOpen, setIsEditModalOpen] = useState(false);
const [selectedRecord, setSelectedRecord] = useState<BloodSugarRecord | null>(null);
const [latestRecord, setLatestRecord] = useState<BloodSugarRecord | null>(null);
const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
const [realtimeAnalysis, setRealtimeAnalysis] = useState("");

const clearForm = () => {
  setFormData({
    date: "",
    time: "",
    bloodSugar: "",
    age: "",
    type: "food",
    description: "",
    condition: "normal"
  });
};

const getStatus = useCallback((value: number, age: string) => {
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
}, []);

const getStatusColor = (status: string) => {
switch (status) {
case "Rendah": return "text-blue-600";
case "Tinggi": return "text-red-600";
default: return "text-green-600";
}
};

// Fungsi untuk menghitung statistik
const calculateStats = useCallback((data: BloodSugarRecord[]) => {
  if (data.length > 0) {
    const values = data.map(r => r.bloodSugar);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const status = getStatus(avg, data[0].age);
    
    return {
      average: Math.round(avg),
      min: Math.min(...values),
      max: Math.max(...values),
      status,
      count: data.length
    };
  }
  return {
    average: 0,
    min: 0,
    max: 0,
    status: "Normal",
    count: 0
  };
}, [getStatus]);

// Update fetchRecords
const fetchRecords = useCallback(async () => {
  if (!user?.id) {
    console.log("User ID tidak ditemukan");
    return;
  }
  
  try {
    setIsLoading(true);
    console.log("Fetching records for user:", user.id);
    
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.append('search', searchQuery);
    if (dateFilter) params.append('date', dateFilter);
    if (conditionFilter && conditionFilter !== 'all') params.append('condition', conditionFilter);
    
    const response = await fetch(`/api/blood-sugar?${params.toString()}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch records');
    }
    
    const responseData = await response.json();
    
    // Pastikan data adalah array
    const records = Array.isArray(responseData) ? responseData : responseData.data || [];
    
    setRecords(records);
    setDailyStats(calculateStats(records));
    
  } catch (error) {
    console.error("Error fetching records:", error);
    toast.error("Gagal mengambil data", {
      description: error instanceof Error ? error.message : "Silakan coba lagi"
    });
    setRecords([]);
    setDailyStats({
      average: 0,
      min: 0,
      max: 0,
      status: "Normal",
      count: 0
    });
  } finally {
    setIsLoading(false);
  }
}, [searchQuery, dateFilter, conditionFilter, user?.id, calculateStats]);

// Pastikan useEffect dipanggil dengan benar
useEffect(() => {
  if (user?.id) {
    fetchRecords();
  }
}, [fetchRecords, user?.id]);

useEffect(() => {
  const delayDebounceFn = setTimeout(() => {
    fetchRecords();
  }, 1000);

  return () => clearTimeout(delayDebounceFn);
},  [searchQuery, dateFilter, conditionFilter, user?.id, fetchRecords]);

// Update handleSubmit untuk merefresh data setelah submit
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!user?.id) {
    toast.error("Silakan login terlebih dahulu", {
      description: "Anda harus login untuk menyimpan data",
    });
    return;
  }

  if (!formData.date || !formData.time || !formData.bloodSugar || !formData.age) {
    toast.error("Data tidak lengkap", {
      description: "Mohon lengkapi semua field yang diperlukan",
    });
    return;
  }

  try {
    const requestData = {
      ...formData,
      bloodSugar: Number(formData.bloodSugar),
      userId: user.id,
      description: formData.description || ''
    };

    console.log("Mengirim data:", requestData);

    const response = await fetch('/api/blood-sugar', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    const responseData = await response.json().catch(() => null);
    console.log("Response data:", responseData);

    if (!response.ok) {
      throw new Error(responseData?.error || 'Gagal menyimpan data: ' + response.status);
    }

    if (!responseData?.data) {
      throw new Error('Data response tidak valid');
    }

    const record = responseData.data;
    setLatestRecord({
      id: record.id,
      date: formData.date,
      time: formData.time,
      bloodSugar: Number(formData.bloodSugar),
      age: formData.age,
      type: formData.type,
      description: formData.description || '',
      condition: formData.condition
    });

    clearForm();
    await fetchRecords();
    
    // Jalankan analisis setelah data baru disimpan
    await analyzeData();
    
    toast.success('Data berhasil disimpan!');

  } catch (error) {
    console.error('Error submitting data:', error);
    toast.error('Gagal menyimpan data', {
      description: error instanceof Error ? error.message : 'Silakan coba lagi'
    });
  }
};

// Tambahkan console.log untuk debugging
useEffect(() => {
  console.log('Latest Record:', latestRecord);
}, [latestRecord]);

useEffect(() => {
if (allRecords.length > 0) {
  const today = new Date().toISOString().split('T')[0];
  const todayRecords = allRecords.filter(record => record.date === today);
  
  if (todayRecords.length > 0) {
    const values = todayRecords.map(r => r.bloodSugar);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const status = getStatus(avg, todayRecords[0].age);
    
    setDailyStats({
      average: Math.round(avg),
      min: Math.min(...values),
      max: Math.max(...values),
      status,
      count: todayRecords.length
    });
  } else {
    setDailyStats({
      average: 0,
      min: 0,
      max: 0,
      status: "Normal",
      count: 0
    });
  }
} else {
  setDailyStats({
    average: 0,
    min: 0,
    max: 0,
    status: "Normal",
    count: 0
  });
}
}, [allRecords, getStatus]);

const chartData = useMemo(() => {
  return allRecords
    .filter(record => record.date === dateFilter || !dateFilter)
    .map(record => ({
      time: record.time,
      value: record.bloodSugar,
    }));
}, [allRecords, dateFilter]);


// Update tampilan statistik dan grafik
const StatisticsSection = memo(() => (
  <>
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
            <LineChart data={formatChartData(records)}>
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

    <div className="mb-4 text-sm text-gray-500">
      {conditionFilter === 'all' && !searchQuery && !dateFilter
        ? `Menampilkan statistik dari semua data (${records.length} catatan)`
        : `Menampilkan statistik dari hasil pencarian (${records.length} catatan)`}
    </div>
  </>
));

// Fungsi untuk menghapus data
const handleDelete = async (id: string) => {
  if (window.confirm('Apakah Anda yakin ingin menghapus data ini?')) {
    try {
      const response = await fetch(`/api/blood-sugar?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Gagal menghapus data');
      }

      toast.success('Data berhasil dihapus');
      fetchRecords(); // Refresh data
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menghapus data');
    }
  }
};

// Fungsi untuk mengupdate data
const handleUpdate = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!selectedRecord) return;

  try {
    const response = await fetch('/api/blood-sugar', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: selectedRecord.id,
        ...formData,
        bloodSugar: Number(formData.bloodSugar),
        age: formData.age
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Gagal mengupdate data');
    }

    toast.success('Data berhasil diupdate');
    setIsEditModalOpen(false);
    setSelectedRecord(null);
    clearForm();
    fetchRecords();
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Gagal mengupdate data');
  }
};

// Tambahkan juga di fungsi handleCancel
const handleCancel = () => {
  setIsEditModalOpen(false);
  setSelectedRecord(null);
  clearForm();
};

// Fungsi untuk membuka modal edit
const handleEdit = (record: BloodSugarRecord) => {
  setSelectedRecord(record);
  setFormData({
    date: record.date,
    time: record.time,
    bloodSugar: record.bloodSugar.toString(),
    age: record.age,
    type: record.type,
    description: record.description || '',
    condition: record.condition
  });
  setIsEditModalOpen(true);
};

// Pindahkan fungsi ekspor ke dalam komponen
const exportToExcel = () => {
  // Siapkan data untuk ekspor
  const exportData = records.map(record => ({
    Tanggal: record.date,
    Waktu: record.time,
    'Gula Darah (mg/dL)': record.bloodSugar,
    'Usia (tahun)': record.age,
    Jenis: record.type === 'food' ? 'Makanan' : 'Minuman',
    Deskripsi: record.description,
    Kondisi: record.condition === 'normal' ? 'Sewaktu' :
             record.condition === 'fasting' ? 'Puasa' :
             record.condition === 'after-meal' ? 'Setelah Makan' : 'Sebelum Tidur',
    Status: record.bloodSugar > 200 ? 'Tinggi' : 'Normal'
  }));

  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Catatan Gula Darah");
  XLSX.writeFile(wb, "catatan-gula-darah.xlsx");
};

const exportToPDF = () => {
  const doc = new jsPDF();
  
  // Tambahkan judul
  doc.setFontSize(16);
  doc.text("Catatan Gula Darah", 14, 15);
  
  // Siapkan data untuk tabel
  const tableData = records.map(record => [
    record.date,
    record.time,
    record.bloodSugar.toString(),
    record.age,
    record.type === 'food' ? 'Makanan' : 'Minuman',
    record.description,
    record.condition === 'normal' ? 'Sewaktu' :
    record.condition === 'fasting' ? 'Puasa' :
    record.condition === 'after-meal' ? 'Setelah Makan' : 'Sebelum Tidur',
    record.bloodSugar > 200 ? 'Tinggi' : 'Normal'
  ]);

  doc.autoTable({
    head: [['Tanggal', 'Waktu', 'Gula Darah', 'Usia', 'Jenis', 'Deskripsi', 'Kondisi', 'Status']],
    body: tableData,
    startY: 25,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [18, 225, 37] },
  });

  // Simpan PDF
  doc.save("catatan-gula-darah.pdf");
};

// Tambahkan fungsi untuk menganalisis data
const analyzeData = useCallback(async () => {
  if (!user?.id || records.length === 0) return;

  try {
    setAnalysisResult(null); // Reset hasil analisis sebelumnya
    
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user.id,
        records: records
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Gagal menganalisis data');
    }

    const data = await response.json();
    setAnalysisResult(data);
  } catch (error) {
    console.error('Error analyzing data:', error);
    toast.error('Gagal menganalisis data', {
      description: error instanceof Error ? error.message : 'Silakan coba lagi'
    });
  }
}, [records, user?.id]);

// Update useEffect untuk analisis
useEffect(() => {
  const runAnalysis = async () => {
    if (records.length > 0 && user?.id) {
      await analyzeData();
    } else {
      setAnalysisResult(null);
    }
  };

  runAnalysis();
}, [records.length, analyzeData, user?.id]);

// Tambahkan fungsi untuk analisis real-time
const analyzeInput = useCallback(() => {
  if (!formData.bloodSugar || !formData.age) {
    setRealtimeAnalysis("");
    return;
  }

  const bloodSugar = Number(formData.bloodSugar);
  const age = Number(formData.age);
  let analysis = "";

  // Analisis berdasarkan usia dan kadar gula darah
  if (age < 6) {
    if (bloodSugar < 100) {
      analysis = "Kadar gula darah Anda terlalu rendah untuk anak usia di bawah 6 tahun. Disarankan untuk mengonsumsi makanan atau minuman manis.";
    } else if (bloodSugar > 200) {
      analysis = "Kadar gula darah Anda terlalu tinggi untuk anak usia di bawah 6 tahun. Sebaiknya kurangi konsumsi makanan/minuman manis.";
    } else {
      analysis = "Kadar gula darah Anda normal untuk anak usia di bawah 6 tahun. Pertahankan pola makan yang sehat.";
    }
  } else if (age <= 12) {
    if (bloodSugar < 70) {
      analysis = "Kadar gula darah Anda terlalu rendah untuk anak usia 6-12 tahun. Disarankan untuk mengonsumsi makanan atau minuman manis.";
    } else if (bloodSugar > 150) {
      analysis = "Kadar gula darah Anda terlalu tinggi untuk anak usia 6-12 tahun. Sebaiknya kurangi konsumsi makanan/minuman manis.";
    } else {
      analysis = "Kadar gula darah Anda normal untuk anak usia 6-12 tahun. Pertahankan pola makan yang sehat.";
    }
  } else {
    if (bloodSugar < 70) {
      analysis = "Kadar gula darah Anda terlalu rendah. Disarankan untuk mengonsumsi makanan atau minuman manis.";
    } else if (bloodSugar > 130) {
      analysis = "Kadar gula darah Anda terlalu tinggi. Sebaiknya kurangi konsumsi makanan/minuman manis dan tingkatkan aktivitas fisik.";
    } else {
      analysis = "Kadar gula darah Anda normal. Pertahankan pola makan yang sehat dan aktivitas fisik yang teratur.";
    }
  }

  // Tambahkan analisis berdasarkan kondisi
  if (formData.condition === "fasting") {
    analysis += "\n\nKarena Anda sedang puasa, pastikan untuk tidak mengonsumsi makanan/minuman dalam periode puasa.";
  } else if (formData.condition === "after-meal") {
    analysis += "\n\nKarena ini adalah pengukuran setelah makan, kadar gula darah yang sedikit lebih tinggi masih wajar. Tunggu 2-3 jam untuk pengukuran berikutnya.";
  } else if (formData.condition === "before-sleep") {
    analysis += "\n\nKarena ini adalah pengukuran sebelum tidur, pastikan kadar gula darah tidak terlalu rendah untuk menghindari hipoglikemia saat tidur.";
  }

  setRealtimeAnalysis(analysis);
}, [formData.bloodSugar, formData.age, formData.condition]);

// Tambahkan useEffect untuk menjalankan analisis setiap kali input berubah
useEffect(() => {
  analyzeInput();
}, [formData.bloodSugar, formData.age, formData.condition, analyzeInput]);

return (
  <>
  <Navbar />
<main className="pt-16">
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

        {realtimeAnalysis && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-700 mb-2">Analisis Real-time:</h3>
            <p className="text-gray-600 whitespace-pre-line">{realtimeAnalysis}</p>
          </div>
        )}

        <Button 
          type="submit" 
          className="hover:bg-green-500 bg-green-400 transition-colors text-black"
        >
          Simpan Data
        </Button>
      </form>
    </Card>

    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Cari Catatan</h2>
      <FilterSection 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        conditionFilter={conditionFilter}
        setConditionFilter={setConditionFilter}
      />
    </Card>

    {records.length > 0 ? (
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">
          {conditionFilter === 'all' && !searchQuery && !dateFilter
            ? "Statistik Keseluruhan"
            : "Statistik Hasil Pencarian"}
        </h2>
        <StatisticsSection />

        <div className="mt-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Analisis Asisten Kesehatan</h2>
          {analysisResult ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4 bg-blue-50">
                <h3 className="font-medium text-blue-700 mb-2">Rekomendasi:</h3>
                <p className="text-gray-600">{analysisResult.recommendation}</p>
              </Card>
              <Card className="p-4 bg-green-50">
                <h3 className="font-medium text-green-700 mb-2">Tren:</h3>
                <p className="text-gray-600">{analysisResult.trend}</p>
              </Card>
              <Card className="p-4 bg-orange-50">
                <h3 className="font-medium text-orange-700 mb-2">Risiko:</h3>
                <p className="text-gray-600">{analysisResult.risk}</p>
              </Card>
            </div>
          ) : (
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Memuat analisis...</p>
            </div>
          )}
        </div>
        
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center items-center py-4">
              <span>Memuat data...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Waktu</TableHead>
                  <TableHead>Gula Darah</TableHead>
                  <TableHead>Usia</TableHead>
                  <TableHead>Jenis</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead>Kondisi</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.date}</TableCell>
                    <TableCell>{record.time}</TableCell>
                    <TableCell>{record.bloodSugar} mg/dL</TableCell>
                    <TableCell>{record.age} tahun</TableCell>
                    <TableCell>{record.type === 'food' ? 'Makanan' : 'Minuman'}</TableCell>
                    <TableCell>{record.description}</TableCell>
                    <TableCell>
                      {record.condition === 'normal' ? 'Normal' :
                       record.condition === 'fasting' ? 'Puasa' :
                       record.condition === 'after-meal' ? 'Setelah Makan' : 
                       'Sebelum Tidur'}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={record.bloodSugar > 200 ? "destructive" : "default"}
                      >
                        {record.bloodSugar > 200 ? "Tinggi" : "Normal"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(record)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(record.id)}
                        >
                          Hapus
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Ekspor Data
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={exportToExcel}>
                Ekspor ke Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportToPDF}>
                Ekspor ke PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>
    ) : (
      <Card className="p-6 text-center">
        <p>Belum ada data</p>
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
    {user && (
      <ChatBotIcon userId={user.id} />
    )}

    {/* Modal Edit */}
    {isEditModalOpen && (
      <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg w-full max-w-md">
          <form onSubmit={handleUpdate}>
            <div className="space-y-6">
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

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                >
                  Batal
                </Button>
                <Button type="submit">
                  Simpan
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    )}
  
  </div>
</div>
</main>
</>
);
}
