   // components/ChatBot.tsx
   import React, { useState, useRef, useEffect } from 'react';
   import { Card } from './ui/card';
   import { Button } from './ui/button';
   import { Input } from './ui/input';
   import { getGeminiResponse } from '@/lib/gemini';

   interface Message {
     role: 'user' | 'assistant';
     content: string;
   }

   export default function ChatBot() {
     const [messages, setMessages] = useState<Message[]>([]);
     const [input, setInput] = useState('');
     const [isLoading, setIsLoading] = useState(false);
     const messagesEndRef = useRef<HTMLDivElement>(null);

     const scrollToBottom = () => {
       messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
     };

     useEffect(() => {
       scrollToBottom();
     }, [messages]);

     const handleSubmit = async (e: React.FormEvent) => {
       e.preventDefault();
       if (!input.trim() || isLoading) return;

       const userMessage: Message = {
         role: 'user',
         content: input
       };

       setMessages(prev => [...prev, userMessage]);
       setInput('');
       setIsLoading(true);

       try {
         const response = await getGeminiResponse(input);
         const assistantMessage: Message = {
           role: 'assistant',
           content: response
         };
         setMessages(prev => [...prev, assistantMessage]);
       } catch (error) {
         console.error('Error getting response:', error);
       } finally {
         setIsLoading(false);
       }
     };

     return (
       <Card className="fixed bottom-4 right-4 w-96 h-[500px] flex flex-col p-4 shadow-lg">
         <div className="flex justify-between items-center mb-4">
           <h3 className="font-semibold">Asisten Kesehatan</h3>
         </div>

         <div className="flex-1 overflow-y-auto mb-4 space-y-4">
           {messages.map((message, index) => (
             <div
               key={index}
               className={`flex ${
                 message.role === 'user' ? 'justify-end' : 'justify-start'
               }`}
             >
               <div
                 className={`max-w-[80%] rounded-lg p-3 ${
                   message.role === 'user'
                     ? 'bg-blue-500 text-white'
                     : 'bg-gray-100 text-gray-800'
                 }`}
               >
                 {message.content}
               </div>
             </div>
           ))}
           {isLoading && (
             <div className="flex justify-start">
               <div className="bg-gray-100 rounded-lg p-3 text-gray-800">
                 Mengetik...
               </div>
             </div>
           )}
           <div ref={messagesEndRef} />
         </div>

         <form onSubmit={handleSubmit} className="flex gap-2">
           <Input
             value={input}
             onChange={(e) => setInput(e.target.value)}
             placeholder="Ketik pesan Anda..."
             disabled={isLoading}
             className="flex-1"
           />
           <Button type="submit" disabled={isLoading}>
             Kirim
           </Button>
         </form>
       </Card>
     );
   }