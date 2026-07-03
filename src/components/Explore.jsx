import React, { useState } from 'react';
import { Search, Heart, MessageCircle, User } from 'lucide-react';

export default function Explore({ posts, users, currentUser, onViewProfile, onFollow }) {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter users based on query
  const filteredUsers = searchQuery.trim() 
    ? users.filter(u => 
        u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.fullName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Filter explore posts (posts from other users)
  const explorePosts = posts.filter(post => post.userId !== currentUser.id);

  return (
    <div className="explore-container animate-fade-in">
      {/* Search Header */}
      <div className="explore-search-bar">
        <Search size={18} className="search-icon" />
        <input 
          type="text" 
          placeholder="Search creators..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Search Results */}
      {searchQuery.trim() ? (
        <div className="search-results-container">
          <h3>Search Results</h3>
          {filteredUsers.length === 0 ? (
            <div className="empty-results">No users found matching "{searchQuery}"</div>
          ) : (
            <div className="search-users-list">
              {filteredUsers.map(user => {
                const isFollowing = currentUser.following?.includes(user.id);
                return (
                  <div className="search-user-card" key={user.id}>
                    <div className="search-user-info" onClick={() => onViewProfile(user.username)}>
                      <img src={user.avatar} alt={user.fullName} className="search-avatar" />
                      <div className="search-user-details">
                        <span className="search-username">{user.username}</span>
                        <span className="search-fullname">{user.fullName}</span>
                      </div>
                    </div>
                    {user.id !== currentUser.id && (
                      <button 
                        className={`btn ${isFollowing ? 'btn-secondary' : 'btn-primary'}`}
                        onClick={() => onFollow(user.id)}
                      >
                        {isFollowing ? 'Following' : 'Follow'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Explore Grid */
        <div className="explore-grid-section">
          <div className="explore-header">
            <h3>Explore Trends</h3>
          </div>
          {explorePosts.length === 0 ? (
            <div className="empty-results">
              No trends available yet. Be the first to post!
            </div>
          ) : (
            <div className="explore-grid-layout">
              {explorePosts.map(post => (
                <div 
                  className="explore-grid-item" 
                  key={post.id}
                  onClick={() => onViewProfile(post.username)}
                >
                  <img 
                    src={post.image} 
                    alt="Explore" 
                    className={`explore-img ${post.filter || 'filter-none'}`} 
                  />
                  <div className="explore-grid-overlay">
                    <span className="grid-overlay-stat">
                      <Heart size={18} fill="white" color="white" />
                      {post.likes.length}
                    </span>
                    <span className="grid-overlay-stat">
                      <MessageCircle size={18} fill="white" color="white" />
                      {post.comments.length}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
