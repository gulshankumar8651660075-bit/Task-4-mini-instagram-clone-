import React from 'react';
import { 
  Home, Search, PlusSquare, MessageCircle, Heart, User, LogOut, Sun, Moon, Database, Film
} from 'lucide-react';

export default function Navbar({ 
  currentScreen, 
  setScreen, 
  currentUser, 
  onLogout, 
  isDarkMode, 
  toggleDarkMode, 
  isFullStack,
  unreadNotifications,
  unreadMessages
}) {
  return (
    <nav className="sidebar">
      <div className="logo-container">
        <h1 className="logo-text">Mini Instagram</h1>
        <div className={`status-badge ${isFullStack ? 'fullstack' : 'standalone'}`} title={isFullStack ? "Full-Stack Server Mode" : "Standalone Local Mode"}>
          <Database size={12} />
          <span>{isFullStack ? 'Server' : 'Local'}</span>
        </div>
      </div>

      <div className="nav-links">
        <button 
          className={`nav-link ${currentScreen === 'feed' ? 'active' : ''}`}
          onClick={() => setScreen('feed')}
        >
          <Home size={22} />
          <span className="nav-text">Home</span>
        </button>

        <button 
          className={`nav-link ${currentScreen === 'explore' ? 'active' : ''}`}
          onClick={() => setScreen('explore')}
        >
          <Search size={22} />
          <span className="nav-text">Search</span>
        </button>

        <button 
          className={`nav-link ${currentScreen === 'reels' ? 'active' : ''}`}
          onClick={() => setScreen('reels')}
        >
          <Film size={22} />
          <span className="nav-text">Reels</span>
        </button>

        <button 
          className={`nav-link ${currentScreen === 'new-post' ? 'active' : ''}`}
          onClick={() => setScreen('new-post')}
        >
          <PlusSquare size={22} />
          <span className="nav-text">Create</span>
        </button>

        <button 
          className={`nav-link ${currentScreen === 'messages' ? 'active' : ''}`}
          onClick={() => setScreen('messages')}
        >
          <div className="icon-badge-container">
            <MessageCircle size={22} />
            {unreadMessages > 0 && <span className="badge-dot"></span>}
          </div>
          <span className="nav-text">Messages</span>
        </button>

        <button 
          className={`nav-link ${currentScreen === 'notifications' ? 'active' : ''}`}
          onClick={() => setScreen('notifications')}
        >
          <div className="icon-badge-container">
            <Heart size={22} />
            {unreadNotifications > 0 && <span className="badge-count">{unreadNotifications}</span>}
          </div>
          <span className="nav-text">Notifications</span>
        </button>

        <button 
          className={`nav-link ${currentScreen === 'profile' ? 'active' : ''}`}
          onClick={() => setScreen('profile')}
        >
          <img src={currentUser.avatar} alt="Profile" className="nav-avatar" />
          <span className="nav-text">Profile</span>
        </button>
      </div>

      <div className="sidebar-footer">
        <button className="nav-link theme-toggle" onClick={toggleDarkMode}>
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          <span className="nav-text">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        <button className="nav-link logout-btn" onClick={onLogout}>
          <LogOut size={20} />
          <span className="nav-text">Log Out</span>
        </button>
      </div>
    </nav>
  );
}
