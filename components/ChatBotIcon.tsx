import { type BloodSugarRecord } from "@/types/blood-sugar";
import { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

interface ChatBotIconProps {
  userId: string;
}

interface Message {
  role: 'user' | 'bot';
  content: string;
}

const ChatBotIcon = ({ userId }: ChatBotIconProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      content: 'Halo! Saya adalah AI Health Assistant yang akan membantu menjawab pertanyaan Anda seputar kesehatan gula darah. Apa yang ingin Anda tanyakan?'
    }
  ]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Fetch data terakhir ketika komponen dimount
  useEffect(() => {
    const fetchLatestRecord = async () => {
      try {
        const response = await fetch(`/api/blood-sugar/latest?userId=${userId}`);
        if (response.ok) {
          const data = await response.json();
          if (data) {
            analyzeRecord(data);
          }
        }
      } catch (error) {
        console.error('Error fetching latest record:', error);
      }
    };

    if (userId) {
      fetchLatestRecord();
    }
  }, [userId]);

  const analyzeRecord = async (data: BloodSugarRecord) => {
    setIsAnalyzing(true);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      
      const prompt = `
      Kamu adalah asisten kesehatan AI yang ahli dalam analisis gula darah. Tolong analisis data berikut dengan detail dan berikan saran yang spesifik dalam Bahasa Indonesia yang mudah dipahami:

      Data Pasien:
      - Kadar Gula Darah: ${data.bloodSugar} mg/dL
      - Usia: ${data.age} tahun
      - Waktu Pengukuran: ${data.time}
      - Kondisi: ${data.condition === 'normal' ? 'Sewaktu' : 
                  data.condition === 'fasting' ? 'Puasa' : 
                  data.condition === 'after-meal' ? 'Setelah Makan' : 
                  'Sebelum Tidur'}
      - Konsumsi: ${data.type === 'food' ? 'Makanan' : 'Minuman'}
      - Detail Konsumsi: ${data.description || 'Tidak ada detail'}

      Berikan analisis berdasarkan poin-poin berikut:
      1. Status gula darah (normal/rendah/tinggi) berdasarkan usia dan kondisi pengukuran
      2. Penjelasan singkat tentang makna nilai tersebut
      3. Rekomendasi pola makan yang spesifik
      4. Saran aktivitas fisik yang sesuai
      5. Tindakan pencegahan yang perlu diambil (jika ada)
      6. Jadwal pemeriksaan berikutnya yang disarankan

      Berikan jawaban yang empatik dan mudah dipahami.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;

      setMessages(prev => [
        ...prev,
        {
          role: 'bot',
          content: 'Berikut analisis data gula darah terakhir Anda:\n\n' + response.text()
        }
      ]);
    } catch (error) {
      console.error('Error analyzing with Gemini:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'bot',
          content: 'Maaf, terjadi kesalahan dalam menganalisis data. Silakan coba lagi nanti.'
        }
      ]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // Tambahkan pesan user ke chat
    setMessages(prev => [...prev, {
      role: 'user',
      content: inputMessage
    }]);

    setIsAnalyzing(true);
    
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      
      const prompt = `
      Kamu adalah asisten kesehatan AI yang ahli dalam bidang diabetes dan kesehatan gula darah. 
      Jawab pertanyaan berikut dengan fokus HANYA pada topik seputar gula darah dan diabetes.
      Jika pertanyaan di luar konteks tersebut, mohon ingatkan user untuk fokus pada topik gula darah.

      Pertanyaan user: ${inputMessage}

      Berikan jawaban yang:
      1. Akurat dan berbasis ilmiah
      2. Mudah dipahami
      3. Dalam Bahasa Indonesia
      4. Disertai saran praktis jika relevan
      5. Selalu ingatkan bahwa saran medis langsung dari dokter tetap diperlukan
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;

      setMessages(prev => [...prev, {
        role: 'bot',
        content: response.text()
      }]);
    } catch (error) {
      console.error('Error getting response:', error);
      setMessages(prev => [...prev, {
        role: 'bot',
        content: 'Maaf, terjadi kesalahan. Silakan coba lagi.'
      }]);
    } finally {
      setIsAnalyzing(false);
      setInputMessage('');
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen && (
        <div className="absolute bottom-16 right-0 h-[80vh] md:h-[500px] s:w-96 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col">
          <div className="p-4 bg-green-400 text-gray-800 rounded-t-lg flex justify-between items-center">
            <h3 className="font-medium">AI Health Assistant</h3>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-green-400 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="whitespace-pre-line text-sm">{message.content}</p>
                </div>
              </div>
            ))}
            {isAnalyzing && (
              <div className="flex justify-center">
                <div className="animate-pulse text-gray-500">Menganalisis...</div>
              </div>
            )}
          </div>

          {/* Form Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Tanyakan seputar gula darah..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
              />
              <button
                type="submit"
                disabled={isAnalyzing || !inputMessage.trim()}
                className="px-4 py-2 bg-green-400 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-green-400 hover:bg-green-800 text-gray-800 rounded-full p-3 shadow-lg transition-colors"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>
    </div>
  );
};

export default ChatBotIcon; 