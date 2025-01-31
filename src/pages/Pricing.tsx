import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bot, Check, ArrowLeft } from 'lucide-react';

export default function Pricing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#010614] to-[#083178]">
      {/* Navigation */}
      <nav className="w-full max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
        </div>
        <Link to="/" className="flex items-center gap-3">
          <Bot className="w-8 h-8 text-[#22D3EE] filter drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]" />
          <span className="text-2xl font-semibold text-white tracking-wide">COACH</span>
        </Link>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-[#22D3EE] to-[#34D399] bg-clip-text text-transparent">
            Choose Your Plan
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Select the perfect plan for your interview preparation needs. Upgrade to Plus for unlimited access and advanced features.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="flex justify-center gap-8 flex-wrap">
          {/* Free Plan */}
          <div className="group relative w-[313px] h-[481px] bg-[#010614]/50 rounded-[20px] p-8 border border-transparent hover:border-[#22D3EE] transition-all duration-300 hover:transform hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-b from-[#22D3EE]/[0.08] to-transparent rounded-[20px] pointer-events-none group-hover:from-[#22D3EE]/[0.15]"></div>
            
            <h3 className="text-2xl font-semibold text-white mb-2">Free</h3>
            <div className="flex items-baseline mb-8">
              <span className="text-6xl font-bold text-[#22D3EE]">0</span>
              <span className="text-xl text-white ml-1">Bath</span>
              <span className="text-gray-400 ml-2">/month</span>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#22D3EE]/10 flex items-center justify-center">
                  <Check className="text-[#22D3EE]" size={14} />
                </div>
                <span className="text-gray-300">1 Interview per day</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#22D3EE]/10 flex items-center justify-center">
                  <Check className="text-[#22D3EE]" size={14} />
                </div>
                <span className="text-gray-300">3 Interviewer</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#22D3EE]/10 flex items-center justify-center">
                  <Check className="text-[#22D3EE]" size={14} />
                </div>
                <span className="text-gray-300">Standard voice chat</span>
              </div>
            </div>

            <button className="absolute bottom-8 left-8 right-8 py-3 rounded-full bg-white/5 text-white border border-transparent group-hover:border-[#22D3EE]/30 font-semibold transition-all duration-300 
hover:bg-gradient-to-r hover:from-[#20C5DE] hover:to-[#30C58D] hover:shadow-lg hover:shadow-[#22D3EE]/20"

            >
              Your current plan
            </button>
          </div>

          {/* Plus Plan */}
          <div className="group relative w-[313px] h-[481px] bg-[#010614]/50 rounded-[20px] p-8 border border-transparent hover:border-[#22D3EE] transition-all duration-300 hover:transform hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-b from-[#22D3EE]/[0.08] to-transparent rounded-[20px] pointer-events-none group-hover:from-[#22D3EE]/[0.15]"></div>
            
            <h3 className="text-2xl font-semibold text-white mb-2">BOTNOI Coach Plus</h3>
            <div className="flex items-baseline mb-8">
              <span className="text-6xl font-bold text-[#22D3EE]">149</span>
              <span className="text-xl text-white ml-1">Bath</span>
              <span className="text-gray-400 ml-2">/month</span>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#22D3EE]/10 flex items-center justify-center">
                  <Check className="text-[#22D3EE]" size={14} />
                </div>
                <span className="text-gray-300">No limit Interview</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#22D3EE]/10 flex items-center justify-center">
                  <Check className="text-[#22D3EE]" size={14} />
                </div>
                <span className="text-gray-300">Customizable interviewer</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#22D3EE]/10 flex items-center justify-center">
                  <Check className="text-[#22D3EE]" size={14} />
                </div>
                <span className="text-gray-300">No limit history log</span>
              </div>
            </div>

            <button 
              onClick={() => navigate('/payment')}
              className="absolute bottom-8 left-8 right-8 py-3 rounded-full bg-white/5 text-white border border-transparent group-hover:border-[#22D3EE]/30 font-semibold transition-all duration-300 
hover:bg-gradient-to-r hover:from-[#20C5DE] hover:to-[#30C58D] hover:shadow-lg hover:shadow-[#22D3EE]/20"
            >
              Get Plus
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}