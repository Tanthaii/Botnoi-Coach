import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Home, History, Save, ChevronDown } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  birthDate?: string;
  jobPosition?: string;
  phone?: string;
  age?: string;
}

export default function EditProfile() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate('/login');
        return;
      }

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setUserData({
          firstName: userDoc.data().firstName,
          lastName: userDoc.data().lastName,
          email: user.email || '',
          age: userDoc.data().age || '',
          jobPosition: userDoc.data().jobPosition || '',
          phone: userDoc.data().phone || ''
        });
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData || !auth.currentUser) return;

    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        jobPosition: userData.jobPosition,
        age: userData.age,
      });
      navigate('/profile');
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (!userData) return null;

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
      <div className="flex-1">
        {/* Header */}
        <div className="h-16 bg-[#010614]/50 backdrop-blur-sm border-b border-white/10 flex items-center justify-between px-6">
          <h1 className="text-2xl font-semibold text-white">Profile</h1>
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 hover:bg-white/5 rounded-lg px-3 py-2"
            >
              <div className="w-8 h-8 bg-gray-400 rounded-lg"></div>
              <div className="text-left">
                <div className="text-white text-sm">{userData.firstName} {userData.lastName}</div>
                <div className="text-gray-400 text-xs">{userData.email}</div>
              </div>
              <ChevronDown className="text-gray-400 w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Edit Form */}
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="w-[823px] h-[504px] bg-[#010614]/50 backdrop-blur-sm rounded-[20px] border border-white/10 p-8">
            <div className="flex gap-8 h-full">
              {/* Left side - Image upload */}
              <div className="flex flex-col items-center justify-center w-[330px]">
                <div className="w-[240px] h-[240px] bg-white rounded-[20px] mb-4"></div>
                <button className="px-6 py-2 bg-[#22D3EE] text-white rounded-full text-sm font-medium">
                  Upload
                </button>
              </div>

              {/* Right side - Form */}
              <div className="flex-1">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-white mb-2">Name</label>
                      <input
                        type="text"
                        value={userData.firstName}
                        onChange={(e) => setUserData({...userData, firstName: e.target.value})}
                        placeholder="Name"
                        className="w-full px-4 py-2 rounded-lg bg-[#010614]/50 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-[#22D3EE]"
                      />
                    </div>
                    <div>
                      <label className="block text-white mb-2">Lastname</label>
                      <input
                        type="text"
                        value={userData.lastName}
                        onChange={(e) => setUserData({...userData, lastName: e.target.value})}
                        placeholder="Lastname"
                        className="w-full px-4 py-2 rounded-lg bg-[#010614]/50 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-[#22D3EE]"
                      />
                    </div>
                    <div>
                      <label className="block text-white mb-2">Age</label>
                      <input
                        type="text"
                        value={userData.age}
                        onChange={(e) => setUserData({...userData, age: e.target.value})}
                        placeholder="Age"
                        className="w-full px-4 py-2 rounded-lg bg-[#010614]/50 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-[#22D3EE]"
                      />
                    </div>
                    <div>
                      <label className="block text-white mb-2">Phone</label>
                      <input
                        type="text"
                        value={userData.phone}
                        onChange={(e) => setUserData({...userData, phone: e.target.value})}
                        placeholder="Phone number"
                        className="w-full px-4 py-2 rounded-lg bg-[#010614]/50 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-[#22D3EE]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white mb-2">Email</label>
                    <input
                      type="email"
                      value={userData.email}
                      placeholder="Your email"
                      disabled
                      className="w-full px-4 py-2 rounded-lg bg-[#010614]/50 border border-white/10 text-gray-400 placeholder-gray-600 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-white mb-2">Job</label>
                    <input
                      type="text"
                      value={userData.jobPosition}
                      onChange={(e) => setUserData({...userData, jobPosition: e.target.value})}
                      placeholder="Your job"
                      className="w-full px-4 py-2 rounded-lg bg-[#010614]/50 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-[#22D3EE]"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-2 bg-[#22D3EE] text-white rounded-full text-sm font-medium hover:bg-[#1FA5BA] transition-colors"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}