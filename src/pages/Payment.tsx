import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Payment() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#010614] to-[#083178] px-4 py-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-[#22D3EE] text-3xl font-semibold">Payment</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto mt-12 grid md:grid-cols-2 gap-8">
        {/* Left Column - Subscription Details */}
        <div className="bg-[#010614]/50 backdrop-blur-sm rounded-2xl p-8 border border-white/10 h-fit">
          <h2 className="text-white/80 mb-4">Subscription of BOTNOI Coach Plus</h2>
          
          <div className="flex items-baseline gap-2 mb-8">
            <span className="text-6xl font-bold text-[#22D3EE]">149</span>
            <span className="text-xl text-white">Bath</span>
            <span className="text-gray-400">/month</span>
          </div>

          <div className="space-y-4 border-t border-white/10 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-white/80">BOTNOI Coach Plus</span>
              <span className="text-white">149.00 Bath</span>
            </div>
            <div className="text-sm text-gray-400">Billed monthly</div>
            
            <div className="flex justify-between items-center pt-4">
              <span className="text-white/80">Subtotal</span>
              <span className="text-white">149.00 Bath</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-white/80">VAT (7%)</span>
              <span className="text-white">10.43 Bath</span>
            </div>
            
            <div className="flex justify-between items-center pt-4 border-t border-white/10">
              <span className="text-white font-medium">Total</span>
              <span className="text-white font-medium">159.43 Bath</span>
            </div>
          </div>
        </div>

        {/* Right Column - Payment Form */}
        <div className="bg-[#010614]/50 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
          <h2 className="text-white/80 mb-6">Pay securely using your credit card.</h2>
          
          <form className="space-y-6">
            <div className="space-y-2">
              <label className="block text-white/80">Card Number</label>
              <input
                type="text"
                placeholder="EX: 0000 0000 0000 0000"
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#22D3EE] focus:ring-1 focus:ring-[#22D3EE]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-white/80">Expiration (MM/YY)</label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#22D3EE] focus:ring-1 focus:ring-[#22D3EE]"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-white/80">Card Security Code</label>
                <input
                  type="text"
                  placeholder="CSC"
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#22D3EE] focus:ring-1 focus:ring-[#22D3EE]"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-white/80">Address</label>
                <select className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#22D3EE] focus:ring-1 focus:ring-[#22D3EE]">
                  <option value="US">United States (US)</option>
                </select>
              </div>

              <input
                type="text"
                placeholder="Street Address"
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#22D3EE] focus:ring-1 focus:ring-[#22D3EE]"
              />

              <input
                type="text"
                placeholder="Apt, Suite, Bldg"
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#22D3EE] focus:ring-1 focus:ring-[#22D3EE]"
              />

              <input
                type="text"
                placeholder="City"
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#22D3EE] focus:ring-1 focus:ring-[#22D3EE]"
              />

              <input
                type="text"
                placeholder="State/City"
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#22D3EE] focus:ring-1 focus:ring-[#22D3EE]"
              />

              <input
                type="text"
                placeholder="Postcode/ZIP"
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#22D3EE] focus:ring-1 focus:ring-[#22D3EE]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-full bg-gradient-to-r from-[#22D3EE] to-[#34D399] text-white font-semibold hover:opacity-90 transition-opacity"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}