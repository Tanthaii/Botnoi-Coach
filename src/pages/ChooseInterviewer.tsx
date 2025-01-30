import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Crown, ChevronDown, Plus } from 'lucide-react';
import '../styles/ChooseInterviewer.css';

interface Interviewer {
  id: string;
  name: string;
  title: string;
  company: string;
  description: string;
  avatarUrl: string;
  isPremium?: boolean;
}

const interviewers: Interviewer[] = [
  {
    id: '1',
    name: 'Mr.Micheal A.',
    title: 'Kind HR from the Big Company',
    company: 'Big Company',
    description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
    avatarUrl: 'https://ik.imagekit.io/kf7nqnnezb/Frame%2014.png?updatedAt=1738210611709'
  },
  {
    id: '2',
    name: 'Ms.Sabrinam J.',
    title: 'Kind HR from the Big Company',
    company: 'Big Company',
    description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
    avatarUrl: 'https://ik.imagekit.io/kf7nqnnezb/Frame%2016.png?updatedAt=1738210355311'
  },
  {
    id: '3',
    name: 'Mr.James J.',
    title: 'Kind HR from the Big Company',
    company: 'Big Company',
    description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
    avatarUrl: 'https://ik.imagekit.io/kf7nqnnezb/Frame%2021.png?updatedAt=1738210355419'
  }
];

export default function ChooseInterviewer() {
  const [selectedInterviewer, setSelectedInterviewer] = useState<string | null>(null);
  const [jobTitle, setJobTitle] = useState('');
  const navigate = useNavigate();
  const user = {
    name: 'Name Lastname',
    email: 'Email@gmail.com'
  };

  const handleStartInterview = () => {
    if (selectedInterviewer && jobTitle) {
      // Navigate to interview page with selected interviewer and job title
      navigate(`/interview/${selectedInterviewer}`, { 
        state: { jobTitle, interviewer: interviewers.find(i => i.id === selectedInterviewer) }
      });
    }
  };

  return (
    <div className="choose-interviewer-container">
      <nav className="navbar">
        <div className="nav-logo">
          <Bot className="nav-logo-icon" />
          <span className="nav-logo-text">COACH</span>
        </div>
        
        <div className="user-profile">
          <div className="user-avatar">
            {user.name.charAt(0)}
          </div>
          <div className="user-info">
            <span className="user-name">{user.name}</span>
            <span className="user-email">{user.email}</span>
          </div>
          <ChevronDown className="dropdown-icon" />
        </div>
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

          <div className="add-interviewer-card">
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