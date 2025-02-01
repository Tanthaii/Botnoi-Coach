import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Home, History, Pencil, LogOut } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  birthDate?: string;
  jobPosition?: string;
  phone?: string;
}

export default function Profile() {
  const [userData, setUserData] = useState<UserData | null>(null);
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
          birthDate: userDoc.data().birthDate,
          jobPosition: userDoc.data().jobPosition,
          phone: userDoc.data().phone || '080 000 0000'
        });
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!userData) {
    return null;
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
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Profile Card */}
        <div className="w-[823px] h-[504px] mx-auto bg-[#010614]/50 backdrop-blur-sm rounded-[20px] border border-white/10 overflow-hidden">
          <div className="flex h-full">
            {/* Left Column - Profile Picture */}
            <div className="w-[330px] h-full flex flex-col items-center justify-center bg-[#010614]/30">
              <div className="w-[240px] h-[240px] bg-white rounded-[20px] mb-4"></div>
              <button className="px-6 py-2 bg-[#22D3EE] text-white rounded-full text-sm font-medium">
                Upload
              </button>
            </div>

            {/* Right Column - Profile Info */}
            <div className="flex-1 p-8">
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-semibold text-white">Profile</h1>
                <button 
                  className="text-[#22D3EE]"
                  onClick={() => navigate('/edit-profile')}
                >
                  <Pencil size={20} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                <div>
                  <p className="text-white mb-1">Name</p>
                  <p className="text-gray-400">{userData.firstName}</p>
                </div>
                <div>
                  <p className="text-white mb-1">Lastname</p>
                  <p className="text-gray-400">{userData.lastName}</p>
                </div>
                <div>
                  <p className="text-white mb-1">Age</p>
                  <p className="text-gray-400">22</p>
                </div>
                <div>
                  <p className="text-white mb-1">Phone</p>
                  <p className="text-gray-400">{userData.phone}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-white mb-1">Email</p>
                  <p className="text-gray-400">{userData.email}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-white mb-1">Job</p>
                  <p className="text-gray-400">{userData.jobPosition || 'Front-End Developer'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}