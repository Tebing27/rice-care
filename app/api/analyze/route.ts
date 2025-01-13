import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { BloodSugarRecord } from "@/types/blood-sugar";

function analyzeBloodSugarTrend(records: BloodSugarRecord[]) {
  const sortedRecords = [...records].sort((a, b) => 
    new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime()
  );

  let trend = "";
  if (sortedRecords.length >= 2) {
    const recentValues = sortedRecords.slice(-3);
    const isIncreasing = recentValues.every((record, index) => 
      index === 0 || record.bloodSugar >= recentValues[index - 1].bloodSugar
    );
    const isDecreasing = recentValues.every((record, index) => 
      index === 0 || record.bloodSugar <= recentValues[index - 1].bloodSugar
    );

    if (isIncreasing) {
      trend = "Kadar gula darah Anda menunjukkan tren meningkat dalam beberapa catatan terakhir.";
    } else if (isDecreasing) {
      trend = "Kadar gula darah Anda menunjukkan tren menurun dalam beberapa catatan terakhir.";
    } else {
      trend = "Kadar gula darah Anda menunjukkan fluktuasi normal.";
    }
  } else {
    trend = "Diperlukan lebih banyak data untuk menganalisis tren.";
  }

  return trend;
}

function analyzeRisk(records: BloodSugarRecord[]) {
  const highCount = records.filter(r => r.bloodSugar > 200).length;
  const lowCount = records.filter(r => r.bloodSugar < 70).length;
  const totalRecords = records.length;

  if (totalRecords === 0) return "Belum dapat menentukan risiko.";

  const highPercentage = (highCount / totalRecords) * 100;
  const lowPercentage = (lowCount / totalRecords) * 100;

  if (highPercentage > 30) {
    return "Risiko tinggi: Terlalu sering mengalami kadar gula darah tinggi.";
  } else if (lowPercentage > 20) {
    return "Risiko tinggi: Terlalu sering mengalami kadar gula darah rendah.";
  } else if (highPercentage > 15 || lowPercentage > 10) {
    return "Risiko sedang: Ada beberapa kejadian kadar gula darah tidak normal.";
  } else {
    return "Risiko rendah: Kadar gula darah umumnya terkendali.";
  }
}

function generateRecommendation(records: BloodSugarRecord[]) {
  const recentRecords = records.slice(-5);
  const recommendations = [];

  const highReadings = recentRecords.filter(r => r.bloodSugar > 200).length;
  const lowReadings = recentRecords.filter(r => r.bloodSugar < 70).length;

  if (highReadings >= 2) {
    recommendations.push(
      "Pertimbangkan untuk mengurangi konsumsi karbohidrat dan gula.",
      "Tingkatkan aktivitas fisik untuk membantu mengontrol kadar gula darah."
    );
  }

  if (lowReadings >= 2) {
    recommendations.push(
      "Pastikan mengonsumsi makanan secara teratur.",
      "Pertimbangkan untuk membawa camilan sehat untuk mencegah gula darah rendah."
    );
  }

  if (recommendations.length === 0) {
    recommendations.push(
      "Pertahankan pola makan dan gaya hidup sehat Anda.",
      "Lanjutkan pemantauan rutin kadar gula darah."
    );
  }

  return recommendations.join(" ");
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const records: BloodSugarRecord[] = body.records;

    if (!Array.isArray(records) || records.length === 0) {
      return new NextResponse(
        JSON.stringify({ error: "Data tidak valid" }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const trend = analyzeBloodSugarTrend(records);
    const risk = analyzeRisk(records);
    const recommendation = generateRecommendation(records);

    return new NextResponse(
      JSON.stringify({
        trend,
        risk,
        recommendation
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error analyzing data:", error);
    return new NextResponse(
      JSON.stringify({ error: "Gagal menganalisis data" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 