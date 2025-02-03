import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bot, Home, History, Send, Mic, Plus, ChevronDown, ThumbsUp, Star } from 'lucide-react';
import { generateResponse, evaluateResponse } from '../lib/ai';

interface Message {
  id: string;
  text: string;
  sender: 'bot' | 'user';
  timestamp: Date;
}

interface ChatHistory {
  [interviewerId: string]: Message[];
}

interface Interviewer {
  id: string;
  name: string;
  title: string;
  company: string;
  description: string;
  avatarUrl: string;
  isPremium?: boolean;
  gender: 'male' | 'female';
  personality: {
    style: string;
    traits: string[];
  };
}

interface InterviewSummary {
  overallRating: number;
  categories: {
    technicalKnowledge: {
      score: number;
      feedback: string[];
    };
    communication: {
      score: number;
      feedback: string[];
    };
    problemSolving: {
      score: number;
      feedback: string[];
    };
    attitude: {
      score: number;
      feedback: string[];
    };
  };
  strengths: string[];
  improvements: string[];
  nextSteps: string[];
}

function Interview() {
  const [chatHistories, setChatHistories] = useState<ChatHistory>({});
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentInterviewer, setCurrentInterviewer] = useState<Interviewer | null>(null);
  const [availableInterviewers, setAvailableInterviewers] = useState<Interviewer[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const jobTitle = location.state?.jobTitle;
  const userName = location.state?.firstName || 'User';
  const userEmail = location.state?.email || 'user@example.com';

  const [summary] = useState<InterviewSummary>({
    overallRating: 4,
    categories: {
      technicalKnowledge: {
        score: 4,
        feedback: [
          'แสดงความเข้าใจในเทคโนโลยีที่ใช้ในการพัฒนา Frontend ได้ดี',
          'สามารถอธิบายประสบการณ์การทำงานกับ React และ TypeScript ได้ชัดเจน',
          'ควรเพิ่มเติมความรู้เกี่ยวกับ Performance Optimization และ Web Security'
        ]
      },
      communication: {
        score: 4,
        feedback: [
          'สื่อสารได้ชัดเจน ใช้ภาษาเป็นมืออาชีพ',
          'มีการยกตัวอย่างประกอบการอธิบายได้ดี',
          'ควรฝึกการสรุปประเด็นให้กระชับมากขึ้น'
        ]
      },
      problemSolving: {
        score: 3,
        feedback: [
          'แสดงให้เห็นกระบวนการคิดและวิเคราะห์ปัญหาได้ดี',
          'มีการอธิบายวิธีการแก้ปัญหาเป็นขั้นตอน',
          'ควรเพิ่มการยกตัวอย่างกรณีศึกษาที่เคยแก้ไขปัญหาสำเร็จ'
        ]
      },
      attitude: {
        score: 5,
        feedback: [
          'แสดงความกระตือรือร้นและความสนใจในตำแหน่งงานอย่างชัดเจน',
          'มีทัศนคติเชิงบวกต่อการเรียนรู้และการพัฒนาตนเอง',
          'แสดงความเป็นมืออาชีพตลอดการสัมภาษณ์'
        ]
      }
    },
    strengths: [
      'มีความเชี่ยวชาญทางเทคนิคที่ตรงกับความต้องการของตำแหน่ง',
      'สื่อสารได้ชัดเจนและเป็นมืออาชีพ',
      'มีทัศนคติที่ดีต่อการทำงานและการพัฒนาตนเอง'
    ],
    improvements: [
      'เพิ่มเติมความรู้ด้าน Performance Optimization',
      'ฝึกการสรุปประเด็นให้กระชับมากขึ้น',
      'เพิ่มตัวอย่างกรณีศึกษาที่เคยแก้ไขปัญหาสำเร็จ'
    ],
    nextSteps: [
      'ศึกษาเพิ่มเติมเกี่ยวกับ Web Performance และ Security',
      'ฝึกซ้อมการสัมภาษณ์เพื่อพัฒนาทักษะการสื่อสาร',
      'เตรียมตัวอย่างผลงานและกรณีศึกษาให้พร้อม'
    ]
  });

  // Get current chat messages
  const currentMessages = currentInterviewer 
    ? chatHistories[currentInterviewer.id] || []
    : [];

  useEffect(() => {
    if (!location.state?.interviewer || !location.state?.jobTitle) {
      navigate('/choose-interviewer');
      return;
    }

    const initialInterviewer = location.state.interviewer;
    setCurrentInterviewer(initialInterviewer);
    setAvailableInterviewers([
      {
        id: '1',
        name: 'Mr.Micheal A.',
        title: 'Senior HR Manager',
        company: 'Big Company',
        description: 'ผู้เชี่ยวชาญด้าน HR ที่มีประสบการณ์มากกว่า 10 ปี เน้นการสัมภาษณ์แบบเป็นกันเอง แต่ได้ข้อมูลเชิงลึก',
        avatarUrl: 'https://ik.imagekit.io/kf7nqnnezb/Frame%2014.png?updatedAt=1738210611709',
        gender: 'male',
        personality: {
          style: 'Friendly and Professional',
          traits: ['เป็นกันเอง', 'ใส่ใจรายละเอียด', 'มีอารมณ์ขัน']
        }
      },
      {
        id: '2',
        name: 'Ms.Sabrina J.',
        title: 'Lead Talent Acquisition',
        company: 'Big Company',
        description: 'ผู้เชี่ยวชาญด้านการคัดเลือกบุคลากรไอที มีสไตล์การสัมภาษณ์ที่กระชับ ตรงประเด็น',
        avatarUrl: 'https://ik.imagekit.io/kf7nqnnezb/Frame%2016.png?updatedAt=1738210355311',
        gender: 'female',
        personality: {
          style: 'Direct and Analytical',
          traits: ['ตรงไปตรงมา', 'มีเหตุผล', 'เน้นการวิเคราะห์']
        }
      },
      {
        id: '3',
        name: 'Mr.James J.',
        title: 'Technical Recruiter',
        company: 'Big Company',
        description: 'ผู้เชี่ยวชาญด้านการสรรหาบุคลากรสายเทคนิค มีพื้นฐานด้านการพัฒนาซอฟต์แวร์',
        avatarUrl: 'https://ik.imagekit.io/kf7nqnnezb/Frame%2021.png?updatedAt=1738210355419',
        gender: 'male',
        personality: {
          style: 'Technical and Supportive',
          traits: ['เข้าใจด้านเทคนิค', 'ให้คำแนะนำที่เป็นประโยชน์', 'สนับสนุนการเรียนรู้']
        }
      }
    ]);

    // Add initial greeting only if no chat history exists
    if (!chatHistories[initialInterviewer.id]) {
      const initialGreeting = `${initialInterviewer.gender === 'male' ? 'สวัสดีครับ' : 'สวัสดีค่ะ'} คุณ${userName} ขอบคุณที่สละเวลามาสัมภาษณ์กับเรา${initialInterviewer.gender === 'male' ? 'ครับ' : 'ค่ะ'} ${initialInterviewer.gender === 'male' ? 'ผม' : 'ดิฉัน'}ชื่อ ${initialInterviewer.name} เป็น ${initialInterviewer.title} ของ${initialInterviewer.company} วันนี้เราจะพูดคุยเกี่ยวกับตำแหน่ง ${location.state.jobTitle} ที่คุณสมัครมา${initialInterviewer.gender === 'male' ? 'ครับ' : 'ค่ะ'} พร้อมเริ่มหรือยัง${initialInterviewer.gender === 'male' ? 'ครับ' : 'คะ'}?`;
      
      setChatHistories(prev => ({
        ...prev,
        [initialInterviewer.id]: [{
          id: '1',
          text: initialGreeting,
          sender: 'bot',
          timestamp: new Date(),
        }]
      }));
    }
  }, [location.state?.interviewer, location.state?.jobTitle, navigate, userName, chatHistories]);

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSwitchInterviewer = async (newInterviewer: Interviewer) => {
    if (newInterviewer.id === currentInterviewer?.id) return;

    setCurrentInterviewer(newInterviewer);

    // Initialize chat history for new interviewer if it doesn't exist
    if (!chatHistories[newInterviewer.id]) {
      const transitionMessage = {
        id: Date.now().toString(),
        text: `${newInterviewer.gender === 'male' ? 'สวัสดีครับ' : 'สวัสดีค่ะ'} คุณ${userName} ${newInterviewer.gender === 'male' ? 'ผม' : 'ดิฉัน'}ชื่อ ${newInterviewer.name} เป็น ${newInterviewer.title} จะรับช่วงต่อจากเพื่อนร่วมงาน${newInterviewer.gender === 'male' ? 'นะครับ' : 'นะคะ'} เรามาเริ่มกัน${newInterviewer.gender === 'male' ? 'ครับ' : 'ค่ะ'}`,
        sender: 'bot' as const,
        timestamp: new Date(),
      };

      setChatHistories(prev => ({
        ...prev,
        [newInterviewer.id]: [transitionMessage]
      }));
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !currentInterviewer) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user' as const,
      timestamp: new Date(),
    };

    // Update chat history for current interviewer
    setChatHistories(prev => ({
      ...prev,
      [currentInterviewer.id]: [...(prev[currentInterviewer.id] || []), userMessage]
    }));
    
    setInputMessage('');
    setIsLoading(true);

    try {
      const messageHistory = currentMessages.map(msg => ({
        role: msg.sender === 'bot' ? 'assistant' : 'user',
        content: msg.text
      }));

      messageHistory.push({
        role: 'user',
        content: inputMessage
      });

      const evaluation = await evaluateResponse(
        inputMessage,
        currentMessages[currentMessages.length - 1]?.text || '',
        jobTitle || ''
      );

      const response = await generateResponse(messageHistory, jobTitle || '');

      // Check if this is the last question (10th question)
      if (currentMessages.filter(m => m.sender === 'bot').length >= 9) {
        setShowSummary(true);
      }

      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'bot' as const,
        timestamp: new Date(),
      };

      // Update chat history with bot response
      setChatHistories(prev => ({
        ...prev,
        [currentInterviewer.id]: [...(prev[currentInterviewer.id] || []), botMessage]
      }));
    } catch (error) {
      console.error('Error in chat:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: 'ขออภัยครับ มีปัญหาในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง',
        sender: 'bot' as const,
        timestamp: new Date(),
      };
      
      // Update chat history with error message
      setChatHistories(prev => ({
        ...prev,
        [currentInterviewer.id]: [...(prev[currentInterviewer.id] || []), errorMessage]
      }));
    } finally {
      setIsLoading(false);
    }
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
        <div className="flex-1 p-8 overflow-y-auto">
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
                      <Star
                        key={star}
                        className={`w-6 h-6 ${
                          star <= summary.overallRating 
                            ? 'text-yellow-400 fill-yellow-400' 
                            : 'text-gray-400'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              {Object.entries(summary.categories).map(([category, data]) => (
                <div
                  key={category}
                  className="bg-[#010614]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-white capitalize">
                      {category.replace(/([A-Z])/g, ' $1').trim()}
                    </h3>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= data.score 
                              ? 'text-yellow-400 fill-yellow-400' 
                              : 'text-gray-400'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    {data.feedback.map((item, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <span className="text-gray-400 mt-1">•</span>
                        <p className="text-gray-300 text-sm">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Strengths & Improvements */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-[#010614]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">จุดเด่น</h3>
                <div className="space-y-2">
                  {summary.strengths.map((strength, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-1">+</span>
                      <p className="text-gray-300 text-sm">{strength}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-[#010614]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">สิ่งที่ควรพัฒนา</h3>
                <div className="space-y-2">
                  {summary.improvements.map((improvement, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-rose-400 mt-1">!</span>
                      <p className="text-gray-300 text-sm">{improvement}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-[#010614]/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6 mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">ขั้นตอนต่อไป</h3>
              <div className="space-y-2">
                {summary.nextSteps.map((step, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-[#22D3EE] mt-1">→</span>
                    <p className="text-gray-300 text-sm">{step}</p>
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

          <div className="mt-8 space-y-1">
            {availableInterviewers.map((interviewer) => (
              <button
                key={interviewer.id}
                onClick={() => handleSwitchInterviewer(interviewer)}
                className={`w-full p-2 flex items-center gap-3 rounded-lg transition-colors ${
                  interviewer.id === currentInterviewer?.id 
                    ? 'bg-white/10 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <img 
                  src={interviewer.avatarUrl}
                  alt={interviewer.name}
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-sm font-medium">{interviewer.name}</span>
              </button>
            ))}
            
            <button 
              onClick={() => navigate('/pricing')}
              className="w-full p-2 flex items-center gap-3 text-gray-400 hover:text-white rounded-lg hover:bg-white/5"
            >
              <Plus size={16} />
              <span className="text-sm font-medium">Custom Character</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex justify-between items-center p-4 border-b border-white/10 bg-[#010614]/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-white">{currentInterviewer?.name}</h1>
            <span className="text-sm text-gray-400">28 January 2025</span>
          </div>
          <div className="flex items-center gap-2">
            <div 
              className="flex items-center gap-2 bg-white/5 rounded-full px-4 py-2 cursor-pointer hover:bg-white/10 transition-colors relative"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center text-white">
                {userName[0]}
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-white">{userName}</span>
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
              src={currentInterviewer?.avatarUrl}
              alt={currentInterviewer?.name}
              className="w-24 h-24 rounded-full mb-2"
            />
            <h2 className="text-2xl font-semibold text-white">{currentInterviewer?.name}</h2>
            <p className="text-gray-400">28 January 2025</p>
          </div>

          {currentMessages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${
                message.sender === 'bot' ? '' : 'justify-end'
              }`}
            >
              {message.sender === 'bot' && (
                <img
                  src={currentInterviewer?.avatarUrl}
                  alt={currentInterviewer?.name}
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
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                placeholder={isLoading ? "กำลังคิดคำตอบ..." : "พิมพ์ข้อความ"}
                disabled={isLoading}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-[#22D3EE] disabled:opacity-50"
              />
              <button
                onClick={() => setIsRecording(!isRecording)}
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

export default Interview;