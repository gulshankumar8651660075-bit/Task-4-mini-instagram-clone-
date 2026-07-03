import React, { useState } from 'react';
import { Camera, Lock, Mail, User, ShieldAlert } from 'lucide-react';

export default function Auth({ onLogin, onRegister }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('john.doe');
  const [password, setPassword] = useState('password123');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password || (!isLogin && (!fullName || !email))) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await onLogin(username, password);
      } else {
        await onRegister(username, fullName, email, password);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setUsername('');
    setPassword('');
    setFullName('');
    setEmail('');
  };

  return (
    <div className="auth-outer-container">
      <div className="auth-card-wrapper animate-slide-in">
        {/* Left Side: Branding Mockup */}
        <div className="auth-branding-panel">
          <div className="branding-glow"></div>
          <div className="branding-content">
            <div className="app-icon-badge">
              <Camera size={36} color="white" />
            </div>
            <h1>Mini Instagram</h1>
            <p className="branding-tagline">Create. Share. Connect.</p>
            <div className="branding-features">
              <div className="feature-bullet">✦ Advanced CSS Photo Filters</div>
              <div className="feature-bullet">✦ Interactive Fullscreen Stories</div>
              <div className="feature-bullet">✦ Secure JWT Authentication</div>
              <div className="feature-bullet">✦ Real-time Direct Messages</div>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Forms */}
        <div className="auth-form-panel">
          <div className="auth-form-card">
            <h2 className="auth-title">{isLogin ? 'Log In' : 'Sign Up'}</h2>
            <p className="auth-subtitle">
              {isLogin ? 'Welcome back! Please enter your details.' : 'Create an account to start sharing.'}
            </p>

            {error && (
              <div className="auth-error-banner animate-fade-in">
                <ShieldAlert size={18} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              {/* Email (Signup only) */}
              {!isLogin && (
                <div className="auth-input-group">
                  <Mail size={18} className="input-icon" />
                  <input 
                    type="email" 
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              )}

              {/* Full Name (Signup only) */}
              {!isLogin && (
                <div className="auth-input-group">
                  <User size={18} className="input-icon" />
                  <input 
                    type="text" 
                    placeholder="Full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              )}

              {/* Username */}
              <div className="auth-input-group">
                <User size={18} className="input-icon" />
                <input 
                  type="text" 
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              {/* Password */}
              <div className="auth-input-group">
                <Lock size={18} className="input-icon" />
                <input 
                  type="password" 
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {/* Submit */}
              <button 
                type="submit" 
                className="btn btn-primary auth-submit-btn" 
                disabled={loading}
              >
                {loading ? 'Processing...' : isLogin ? 'Log In' : 'Sign Up'}
              </button>
              {isLogin && (
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '12px', opacity: 0.8 }}>
                  * Demo account credentials pre-filled
                </p>
              )}
            </form>

            <div className="auth-toggle-footer">
              <span>{isLogin ? "Don't have an account?" : "Already have an account?"}</span>
              <button onClick={toggleMode} className="btn-text">
                {isLogin ? 'Sign Up' : 'Log In'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
