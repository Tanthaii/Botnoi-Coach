import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Calendar } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import '../styles/PersonalInfo.css';

const jobPositions = [
  'Software Engineer',
  'Product Manager',
  'Data Scientist',
  'UX Designer',
  'Business Analyst',
  'Marketing Manager',
  'Sales Representative',
  'Project Manager',
  'HR Specialist',
  'Financial Analyst'
];

export default function PersonalInfo() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    jobPosition: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No authenticated user found');
      }

      // Create a user profile document
      await setDoc(doc(db, 'users', user.uid), {
        firstName: formData.firstName,
        lastName: formData.lastName,
        birthDate: formData.birthDate,
        jobPosition: formData.jobPosition,
        email: user.email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // Sign out the user and redirect to login
      await auth.signOut();
      navigate('/login');
    } catch (err) {
      console.error('Error saving personal information:', err);
      setError('Failed to save your information. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="personal-info-container">
      <div className="personal-info-header">
        <div className="personal-info-logo">
          <Bot className="personal-info-logo-icon" />
          <span className="personal-info-logo-text">COACH</span>
        </div>
      </div>

      <div className="personal-info-card">
        <form className="personal-info-form" onSubmit={handleSubmit}>
          <h1 className="personal-info-title">personal information</h1>
          <p className="personal-info-subtitle">
            Let us know more about you
          </p>

          {error && <p className="error-message">{error}</p>}

          <div className="form-group">
            <input
              type="text"
              name="firstName"
              placeholder="Name"
              className="form-input"
              value={formData.firstName}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <input
              type="text"
              name="lastName"
              placeholder="Lastname"
              className="form-input"
              value={formData.lastName}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group date-input-group">
            <input
              type="date"
              name="birthDate"
              placeholder="Date"
              className="form-input date-input"
              value={formData.birthDate}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
            <Calendar className="date-icon" size={20} />
          </div>

          <div className="form-group">
            <select
              name="jobPosition"
              className="form-input select-input"
              value={formData.jobPosition}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            >
              <option value="" disabled>Job position</option>
              {jobPositions.map((position) => (
                <option key={position} value={position}>
                  {position}
                </option>
              ))}
            </select>
          </div>

          <button 
            type="submit" 
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  );
}