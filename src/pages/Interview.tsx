import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bot, Home, History, Send, Mic } from 'lucide-react';
import { generateResponse, evaluateResponse } from '../lib/ai';

interface Message {
  id: string;
  text: string;
  sender: 'bot' | 'user';
  timestamp: Date;
}

export default function Interview() {
  const location = useLocation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isRecording, setIsRecording] = useState(false);

  const interviewer = location.state?.interviewer;
  const jobTitle = location.state?.jobTitle;
  const userName = location.state?.firstName || 'User';

  useEffect(() => {
    if (!interviewer || !jobTitle) {
      navigate('/choose-interviewer');
      return;
    }

    // Add initial greeting message
    const initialGreeting = `สวัสดีครับ คุณ${userName} ขอบคุณที่สละเวลามาสัมภาษณ์กับเราครับ ผมชื่อ ${interviewer.name} เป็น HR ของบริษัท ABC วันนี้เราจะพูดคุยเกี่ยวกับตำแหน่ง ${jobTitle} ที่คุณสมัครมาครับ ช่วยเล่าเกี่ยวกับประสบการณ์ของคุณให้ฟังหน่อยครับ`;
    
    const initialMessage = {
      id: '1',
      text: initialGreeting,
      sender: 'bot',
      timestamp: new Date(),
    };
    setMessages([initialMessage]);
  }, [interviewer, jobTitle, navigate, userName]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user' as const,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Convert messages to format expected by Typhoon API
      const messageHistory = messages.map(msg => ({
        role: msg.sender === 'bot' ? 'assistant' : 'user',
        content: msg.text
      }));

      // Add the latest user message
      messageHistory.push({
        role: 'user',
        content: inputMessage
      });

      // Get evaluation from Gemini
      const evaluation = await evaluateResponse(
        inputMessage,
        messages[messages.length - 1]?.text || '',
        jobTitle
      );

      // Generate response using Typhoon
      const response = await generateResponse(messageHistory, jobTitle);

      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'bot' as const,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error in chat:', error);
      const errorBotMessage = {
        id: (Date.now() + 1).toString(),
        text: 'ขออภัยครับ มีปัญหาในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง',
        sender: 'bot' as const,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorBotMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  return (
    <div className="flex h-screen bg-[#010614]">
      {/* Sidebar */}
      <div className="w-64 bg-[#010614] border-r border-white/10">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-8">
            <Bot className="w-8 h-8 text-[#22D3EE]" />
            <span className="text-2xl font-semibold text-white">COACH</span>
          </div>

          <nav className="space-y-4">
            <button className="flex items-center gap-3 text-gray-400 hover:text-white w-full p-2 rounded-lg hover:bg-white/5">
              <Home size={20} />
              <span>Home</span>
            </button>
            <button className="flex items-center gap-3 text-gray-400 hover:text-white w-full p-2 rounded-lg hover:bg-white/5">
              <History size={20} />
              <span>History</span>
            </button>
          </nav>

          <div className="mt-8 space-y-2">
            <div className="p-2 bg-white/5 rounded-lg">
              <div className="flex items-center gap-2">
                <img 
                  src={interviewer.avatarUrl}
                  alt={interviewer.name}
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-white font-medium">{interviewer.name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex justify-between items-center p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-white">{interviewer.name}</h1>
            <span className="text-sm text-gray-400">28 January 2025</span>
          </div>
          <div className="flex items-center gap-2 bg-white/5 rounded-full px-4 py-2">
            <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center text-white">
              {location.state?.firstName?.[0] || 'U'}
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-white">{location.state?.firstName || 'User'}</span>
              <span className="text-xs text-gray-400">{location.state?.email || 'user@example.com'}</span>
            </div>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${
                message.sender === 'bot' ? '' : 'justify-end'
              }`}
            >
              {message.sender === 'bot' && (
                <img
                  src={interviewer.avatarUrl}
                  alt={interviewer.name}
                  className="w-10 h-10 rounded-full"
                />
              )}
              <div
                className={`max-w-[80%] p-3 rounded-2xl ${
                  message.sender === 'bot'
                    ? 'bg-[#1E1E1E] text-white'
                    : 'bg-[#22D3EE] text-white ml-auto'
                }`}
              >
                <p className="text-sm">{message.text}</p>
              </div>
              {message.sender === 'bot' && (
                <button className="mt-2">
                  <Mic 
                    size={16} 
                    className="text-gray-400 hover:text-[#22D3EE]"
                  />
                </button>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isLoading ? "กำลังคิดคำตอบ..." : "พิมพ์ข้อความ"}
                disabled={isLoading}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-[#22D3EE] disabled:opacity-50"
              />
              <button
                onClick={toggleRecording}
                disabled={isLoading}
                className={`absolute right-4 top-1/2 transform -translate-y-1/2 ${
                  isRecording ? 'text-red-500' : 'text-gray-400 hover:text-[#22D3EE]'
                } disabled:opacity-50`}
              >
                <Mic size={20} />
              </button>
            </div>
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              className="p-3 bg-[#22D3EE] rounded-full hover:bg-[#1FA5BA] transition-colors disabled:opacity-50"
            >
              <Send size={20} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}