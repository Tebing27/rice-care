import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export async function getGeminiResponse(prompt: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const context = `Kamu adalah asisten kesehatan profesional yang membantu memberikan saran kesehatan umum dan informasi terkait diabetes. 
  Berikan informasi yang akurat dan selalu ingatkan bahwa saran medis langsung harus dikonsultasikan dengan dokter.
  Fokus pada topik:
  - Manajemen diabetes
  - Pola makan sehat
  - Gaya hidup sehat
  - Pemantauan gula darah
  - Tips kesehatan umum
  
  ${prompt}`;

  try {
    const result = await model.generateContent(context);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error calling Gemini AI:", error);
    return "Maaf, terjadi kesalahan dalam memproses permintaan Anda.";
  }
} 