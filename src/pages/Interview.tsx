import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bot, Home, History, Send, Mic, Plus, ChevronDown, ThumbsUp } from 'lucide-react';
import { generateResponse, evaluateResponse } from '../lib/ai';

interface Message {
  id: string;
  text: string;
  sender: 'bot' | 'user';
  timestamp: Date;
}

interface InterviewSummary {
  rating: number;
  improvements: string[];
  strengths: string[];
}

export default function Interview() {
  const location = useLocation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [summary, setSummary] = useState<InterviewSummary>({
    rating: 4,
    improvements: [
      'มีการเล่าเรื่องหรืออธิบายกระบวนการแก้ปัญหาได้ชัดเจนและเป็นขั้นตอนมากขึ้น',
      'ใช้โอกาสในการฝึกซ้อมสัมภาษณ์กับคนอื่นเพื่อเพิ่มความมั่นใจ'
    ],
    strengths: [
      'การสื่อสารและความมั่นใจ:',
      'เพิ่มคำถามที่สะท้อนถึงความสนใจในบริษัท เช่น โครงการที่กำลังพัฒนา เป้าหมายของทีม หรือโอกาสเติบโตในระยะยาว'
    ]
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const interviewer = location.state?.interviewer;
  const jobTitle = location.state?.jobTitle;
  const userName = location.state?.firstName || 'User';
  const userEmail = location.state?.email || 'user@example.com';

  useEffect(() => {
    if (!interviewer || !jobTitle) {
      navigate('/choose-interviewer');
      return;
    }

    const initialGreeting = `สวัสดีครับ คุณ${userName} ขอบคุณที่สละเวลามาสัมภาษณ์กับเราครับ ผมชื่อ ${interviewer.name} เป็น HR ของบริษัท ABC วันนี้เราจะพูดคุยเกี่ยวกับตำแหน่ง Front-End Developer ที่คุณสมัครมาครับ พร้อมเริ่มหรือยังครับ?`;
    
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
      const messageHistory = messages.map(msg => ({
        role: msg.sender === 'bot' ? 'assistant' : 'user',
        content: msg.text
      }));

      messageHistory.push({
        role: 'user',
        content: inputMessage
      });

      const evaluation = await evaluateResponse(
        inputMessage,
        messages[messages.length - 1]?.text || '',
        jobTitle
      );

      const response = await generateResponse(messageHistory, jobTitle);

      // Check if this is the last question (10th question)
      if (messages.filter(m => m.sender === 'bot').length >= 9) {
        setShowSummary(true);
      }

      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'bot' as const,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error in chat:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: 'ขออภัยครับ มีปัญหาในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง',
        sender: 'bot' as const,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
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

  if (showSummary) {
    return (
      <div className="flex h-screen bg-gradient-to-b from-[#010614] to-[#083178]">
        {/* Sidebar */}
        <div className="w-64 bg-[#010614]/50 backdrop-blur-sm border-r border-white/10">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-8">
              <Bot className="w-8 h-8 text-[#22D3EE]" />
              <span className="text-2xl font-semibold text-white">COACH</span>
            </div>

            <nav className="space-y-2">
              <button 
                onClick={() => navigate('/choose-interviewer')}
                className="flex items-center gap-3 text-gray-400 hover:text-white w-full p-2 rounded-lg hover:bg-white/5"
              >
                <Home size={20} />
                <span>Home</span>
              </button>
              <button className="flex items-center gap-3 text-gray-400 hover:text-white w-full p-2 rounded-lg hover:bg-white/5">
                <History size={20} />
                <span>History</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-white mb-4">
                ผลการสัมภาษณ์
              </h1>
              <div className="flex items-center justify-center gap-4 mb-8">
                <ThumbsUp className="w-16 h-16 text-yellow-400" />
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-yellow-400 mb-2">
                    ดีเยี่ยม!
                  </h2>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-6 h-6 ${
                          star <= summary.rating ? 'text-yellow-400' : 'text-gray-400'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Content */}
            <div className="bg-[#010614]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-8 mb-8">
              <h3 className="text-xl font-semibold text-white mb-4">
                ข้อที่ควรปรับปรุง
              </h3>
              <div className="space-y-4 mb-8">
                {summary.improvements.map((improvement, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <span className="text-gray-400">•</span>
                    <p className="text-gray-300">{improvement}</p>
                  </div>
                ))}
              </div>

              <h3 className="text-xl font-semibold text-white mb-4">
                การถามคำถาม:
              </h3>
              <div className="space-y-4">
                {summary.strengths.map((strength, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <span className="text-gray-400">•</span>
                    <p className="text-gray-300">{strength}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4">
              <button
                onClick={() => navigate('/choose-interviewer')}
                className="px-8 py-3 bg-gradient-to-r from-[#22D3EE] to-[#34D399] rounded-full text-white font-semibold hover:opacity-90 transition-opacity"
              >
                สำเร็จ
              </button>
              <button
                onClick={() => navigate('/interview')}
                className="px-8 py-3 bg-white/5 border border-white/10 rounded-full text-white font-semibold hover:bg-white/10 transition-colors"
              >
                สัมภาษณ์อีกครั้ง
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-b from-[#010614] to-[#083178]">
      {/* Sidebar */}
      <div className="w-64 bg-[#010614]/50 backdrop-blur-sm border-r border-white/10">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-8">
            <Bot className="w-8 h-8 text-[#22D3EE]" />
            <span className="text-2xl font-semibold text-white">COACH</span>
          </div>

          <nav className="space-y-2">
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
            <button className="flex items-center gap-2 text-gray-400 hover:text-white w-full p-2 rounded-lg hover:bg-white/5">
              <Plus size={20} />
              <span>Custom Character</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex justify-between items-center p-4 border-b border-white/10 bg-[#010614]/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-white">{interviewer.name}</h1>
            <span className="text-sm text-gray-400">28 January 2025</span>
          </div>
          <div className="flex items-center gap-2">
            <div 
              className="flex items-center gap-2 bg-white/5 rounded-full px-4 py-2 cursor-pointer hover:bg-white/10 transition-colors relative"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center text-white">
                {location.state?.firstName?.[0] || 'U'}
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-white">{location.state?.firstName || 'User'}</span>
                <span className="text-xs text-gray-400">{userEmail}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
            {showDropdown && (
              <div className="absolute top-16 right-4 bg-[#010614]/95 border border-white/10 rounded-lg shadow-lg py-1 min-w-[200px]">
                <button
                  onClick={() => navigate('/profile')}
                  className="w-full px-4 py-2 text-left text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Profile
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div className="flex flex-col items-center justify-center mb-8">
            <img
              src={interviewer.avatarUrl}
              alt={interviewer.name}
              className="w-24 h-24 rounded-full mb-2"
            />
            <h2 className="text-2xl font-semibold text-white">{interviewer.name}</h2>
            <p className="text-gray-400">28 January 2025</p>
          </div>

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
              <div className="flex flex-col gap-2 max-w-[80%]">
                <div
                  className={`p-4 rounded-2xl ${
                    message.sender === 'bot'
                      ? 'bg-[#1E1E1E] text-white'
                      : 'bg-[#22D3EE] text-white ml-auto'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.text}</p>
                </div>
                {message.sender === 'bot' && (
                  <button className="flex items-center gap-2 text-gray-400 hover:text-[#22D3EE] transition-colors">
                    <Mic size={16} />
                    <span className="text-xs">Listen</span>
                  </button>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-white/10 bg-[#010614]/50 backdrop-blur-sm">
          <div className="flex items-center gap-2 max-w-4xl mx-auto">
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