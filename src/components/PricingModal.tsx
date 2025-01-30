import React from 'react';
import { X, Check } from 'lucide-react';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PricingModal({ isOpen, onClose }: PricingModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="relative w-full max-w-4xl mx-4">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
        >
          <X size={24} />
        </button>

        {/* Modal content */}
        <div className="bg-gradient-to-b from-[#010614] to-[#020B1B] rounded-2xl p-8 border border-white/10">
          <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-[#22D3EE] to-[#34D399] bg-clip-text text-transparent">
            Upgrade your plan
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Free Plan */}
            <div className="relative bg-[#010614]/50 rounded-2xl p-8 border border-white/10">
              <h3 className="text-2xl font-semibold text-white mb-2">Free</h3>
              <div className="flex items-baseline mb-8">
                <span className="text-6xl font-bold text-[#22D3EE]">0</span>
                <span className="text-xl text-white ml-1">Bath</span>
                <span className="text-gray-400 ml-2">/month</span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Check className="text-[#22D3EE]" size={20} />
                  <span className="text-gray-300">1 Interview per day</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="text-[#22D3EE]" size={20} />
                  <span className="text-gray-300">3 Interviewer</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="text-[#22D3EE]" size={20} />
                  <span className="text-gray-300">Standard voice chat</span>
                </div>
              </div>

              <div className="mt-8">
                <button className="w-full py-3 rounded-full bg-white/5 text-white border border-white/10 font-semibold">
                  Your current plan
                </button>
              </div>
            </div>

            {/* Plus Plan */}
            <div className="relative bg-[#010614]/50 rounded-2xl p-8 border border-[#22D3EE]/30">
              <div className="absolute -top-px left-0 right-0 h-[2px] bg-gradient-to-r from-[#22D3EE] to-[#34D399] rounded-t-2xl"></div>
              <h3 className="text-2xl font-semibold text-white mb-2">BOTNOI Coach Plus</h3>
              <div className="flex items-baseline mb-8">
                <span className="text-6xl font-bold text-[#22D3EE]">149</span>
                <span className="text-xl text-white ml-1">Bath</span>
                <span className="text-gray-400 ml-2">/month</span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Check className="text-[#22D3EE]" size={20} />
                  <span className="text-gray-300">No limit Interview</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="text-[#22D3EE]" size={20} />
                  <span className="text-gray-300">Customizable interviewer</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="text-[#22D3EE]" size={20} />
                  <span className="text-gray-300">No limit history log</span>
                </div>
              </div>

              <div className="mt-8">
                <button className="w-full py-3 rounded-full bg-gradient-to-r from-[#22D3EE] to-[#34D399] text-white font-semibold hover:opacity-90 transition-opacity">
                  Get Plus
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}