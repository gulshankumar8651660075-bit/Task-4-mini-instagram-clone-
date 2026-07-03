import React from 'react';
import Stories from './Stories.jsx';
import PostCard from './PostCard.jsx';
import { UserCheck, UserPlus } from 'lucide-react';

export default function Feed({ 
  posts, 
  stories, 
  currentUser, 
  users,
  onLike, 
  onComment, 
  onSave, 
  onAddStory, 
  onFollow,
  onViewProfile 
}) {
  // Suggest users that the current user is not following yet
  const suggestedUsers = users
    .filter(u => u.id !== currentUser.id && !currentUser.following?.includes(u.id))
    .slice(0, 5);

  return (
    <div className="feed-layout animate-fade-in">
      {/* Central feed column */}
      <div className="feed-main-col">
        {/* Stories bar */}
        <Stories 
          stories={stories} 
          currentUser={currentUser} 
          onAddStory={onAddStory}
        />

        {/* Posts feed */}
        {posts.length === 0 ? (
          <div className="empty-feed">
            <h3>No Posts Yet</h3>
            <p>Share a post or follow others to build your feed!</p>
          </div>
        ) : (
          <div className="posts-container">
            {posts.map(post => (
              <PostCard 
                key={post.id}
                post={post}
                currentUser={currentUser}
                onLike={onLike}
                onComment={onComment}
                onSave={onSave}
                onViewProfile={onViewProfile}
              />
            ))}
          </div>
        )}
      </div>

      {/* Suggested Users Sidebar (Desktop Only) */}
      <div className="feed-sidebar-col">
        {/* Mini Current User Profile card */}
        <div className="sidebar-profile-card">
          <div className="profile-card-left" onClick={() => onViewProfile(currentUser.username)}>
            <img src={currentUser.avatar} alt="Profile" className="sidebar-avatar" />
            <div className="profile-card-info">
              <span className="profile-username">{currentUser.username}</span>
              <span className="profile-fullname">{currentUser.fullName}</span>
            </div>
          </div>
          <button className="profile-switch-btn" onClick={() => onViewProfile(currentUser.username)}>
            View
          </button>
        </div>

        {/* Suggestions list */}
        {suggestedUsers.length > 0 && (
          <div className="suggestions-box">
            <div className="suggestions-header">
              <span>Suggested for you</span>
              <button className="see-all-btn">See All</button>
            </div>
            
            <div className="suggestions-list">
              {suggestedUsers.map(user => (
                <div className="suggestion-item" key={user.id}>
                  <div className="suggestion-left" onClick={() => onViewProfile(user.username)}>
                    <img src={user.avatar} alt={user.fullName} className="suggestion-avatar" />
                    <div className="suggestion-info">
                      <span className="suggestion-username">{user.username}</span>
                      <span className="suggestion-relation">Popular</span>
                    </div>
                  </div>
                  <button 
                    className="suggestion-follow-btn"
                    onClick={() => onFollow(user.id)}
                  >
                    Follow
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sidebar Copyright footer */}
        <footer className="sidebar-footer-text">
          <p>© 2026 INSTACLONE FROM DEEPMIND ANTIGRAVITY TEAM</p>
          <p>FOR WEEK 3 SOCIAL MEDIA CLONE ASSIGNMENT</p>
        </footer>
      </div>
    </div>
  );
}
