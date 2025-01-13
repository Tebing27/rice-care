import React, { useState } from 'react';
import { Button } from './ui/button';
import ChatBot from './ChatBot';
import { MessageCircle } from 'lucide-react';

export default function ChatBotIcon() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bg-green-400 text-black bottom-4 right-4 rounded-full w-12 h-12 flex items-center justify-center shadow-lg"
      >
        <MessageCircle size={24} />
      </Button>
      {isOpen && <ChatBot />}
    </>
  );
} 