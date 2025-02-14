import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Crown, ChevronDown, Plus, LogOut, User } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import '../styles/ChooseInterviewer.css';

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

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
}

const interviewers: Interviewer[] = [
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
];

export default function ChooseInterviewer() {
  const [selectedInterviewer, setSelectedInterviewer] = useState<string | null>(null);
  const [jobTitle, setJobTitle] = useState('');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        // Fetch user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserData({
            firstName: userDoc.data().firstName,
            lastName: userDoc.data().lastName,
            email: user.email || ''
          });
        }
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleStartInterview = () => {
    if (selectedInterviewer && jobTitle) {
      const interviewer = interviewers.find(i => i.id === selectedInterviewer);
      navigate('/interview', { 
        state: { 
          interviewer,
          jobTitle,
          firstName: userData?.firstName,
          lastName: userData?.lastName,
          email: userData?.email
        }
      });
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="choose-interviewer-container">
      <nav className="navbar">
        <div className="nav-logo">
          <Bot className="nav-logo-icon" />
          <span className="nav-logo-text">COACH</span>
        </div>
        
        {userData && (
          <div className="user-profile-container">
            <div 
              className="user-profile"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <div className="user-avatar">
                {userData.firstName.charAt(0)}
              </div>
              <div className="user-info">
                <span className="user-name">{`${userData.firstName} ${userData.lastName}`}</span>
                <span className="user-email">{userData.email}</span>
              </div>
              <ChevronDown className="dropdown-icon" />
            </div>
            
            {showDropdown && (
              <div className="user-dropdown">
                <button 
                  className="dropdown-item" 
                  onClick={() => navigate('/profile')}
                >
                  <User size={16} />
                  <span>Profile</span>
                </button>
                <button className="dropdown-item" onClick={handleLogout}>
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        )}
      </nav>

      <main className="main-content">
        <h1 className="page-title">Choose your interviewer</h1>

        <div className="interviewers-grid">
          {interviewers.map((interviewer) => (
            <div
              key={interviewer.id}
              className={`interviewer-card ${selectedInterviewer === interviewer.id ? 'selected' : ''}`}
              onClick={() => setSelectedInterviewer(interviewer.id)}
            >
              <img 
                src={interviewer.avatarUrl} 
                alt={interviewer.name}
                className="interviewer-avatar" 
              />
              <div className="interviewer-info">
                <h3 className="interviewer-name">{interviewer.name}</h3>
                <p className="interviewer-title">{interviewer.title}</p>
                <p className="interviewer-description">{interviewer.description}</p>
              </div>
              {interviewer.isPremium && (
                <div className="premium-badge">
                  <Crown className="premium-icon" />
                </div>
              )}
            </div>
          ))}

          <div 
            className="add-interviewer-card"
            onClick={() => navigate('/pricing')}
          >
            <div className="add-icon-wrapper">
              <Plus className="add-icon" />
            </div>
          </div>
        </div>

        <div className="job-title-section">
          <h2 className="section-title">Job Title</h2>
          <input
            type="text"
            className="job-title-input"
            placeholder="Job Title"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
          />
        </div>

        <button 
          className="start-interview-button"
          onClick={handleStartInterview}
          disabled={!selectedInterviewer || !jobTitle}
        >
          Start Interview
        </button>
      </main>
    </div>
  );
}