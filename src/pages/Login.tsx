import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bot, Eye, EyeOff } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import '../styles/Login.css';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/'); // Redirect to home page after successful login
    } catch (err) {
      setError('Invalid email or password');
      console.error(err);
    }
  };

  return (
    <div className="login-container">
      <div className="login-header">
        <Link to="/" className="login-logo">
          <Bot className="login-logo-icon" />
          <span className="login-logo-text">COACH</span>
        </Link>
      </div>

      <div className="login-card">
        <form className="login-form" onSubmit={handleLogin}>
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">
            Hey, Enter your detail to get sign in<br />to your account
          </p>

          {error && <p className="error-message">{error}</p>}

          <div className="form-group">
            <input
              type="email"
              placeholder="Email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <div className="password-input">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="form-options">
            <label className="remember-me">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <Link to="/forgot-password" className="forgot-password">
              Forgot password?
            </Link>
          </div>

          <button type="submit" className="login-button">
            Log in
          </button>

          <p className="signup-prompt">
            Don't have an account? <Link to="/signup" className="signup-link">Sign Up</Link>
          </p>
        </form>
      </div>
    </div>
  );
}