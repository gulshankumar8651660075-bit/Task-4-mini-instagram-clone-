import React, { useState } from 'react';
import { Grid, Bookmark, Heart, MessageCircle, Settings, Edit, Check, X, Award, BarChart2 } from 'lucide-react';
import PostCard from './PostCard.jsx';

export default function Profile({ 
  profileUser, 
  currentUser, 
  posts, 
  users,
  onFollow, 
  onSave, 
  onLike, 
  onComment, 
  onUpdateProfile 
}) {
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' | 'saved' | 'analytics'
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(profileUser.fullName);
  const [bio, setBio] = useState(profileUser.bio);
  const [avatar, setAvatar] = useState(profileUser.avatar);
  const [isVerified, setIsVerified] = useState(profileUser.isVerified || false);
  
  const [selectedPost, setSelectedPost] = useState(null);
  
  // Follow modals state
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);

  const isOwnProfile = currentUser.id === profileUser.id;
  const isFollowing = currentUser.following?.includes(profileUser.id) || false;

  // Filter posts for this user
  const userPosts = posts.filter(post => post.userId === profileUser.id);
  const savedPosts = posts.filter(post => currentUser.savedPosts?.includes(post.id));

  // Hydrate follow lists
  const followersList = users.filter(u => profileUser.followers?.includes(u.id));
  const followingList = users.filter(u => profileUser.following?.includes(u.id));

  const handleSaveProfile = () => {
    onUpdateProfile(fullName, bio, avatar, isVerified);
    setIsEditing(false);
  };

  const triggerAvatarUpload = () => {
    if (!isEditing) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (readerEvent) => {
          setAvatar(readerEvent.target.result);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  // Helper Verification Check Badge SVG
  const VerificationBadge = () => (
    <svg className="verification-badge" viewBox="0 0 24 24" width="16" height="16">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" stroke="white" strokeWidth="2.5" fill="none" />
      <circle cx="12" cy="12" r="10" fill="#0095f6" zIndex="-1" style={{mixBlendMode: 'destination-over'}} />
    </svg>
  );

  return (
    <div className="profile-container animate-fade-in">
      {/* Profile Header */}
      <div className="profile-info-header">
        <div 
          className={`profile-header-avatar-container ${isEditing ? 'editable' : ''}`}
          onClick={triggerAvatarUpload}
        >
          <img src={avatar} alt={profileUser.username} className="profile-info-avatar" />
          {isEditing && (
            <div className="avatar-edit-overlay">
              <span>Change Photo</span>
            </div>
          )}
        </div>

        <div className="profile-details-section">
          {/* Row 1: Username & Actions */}
          <div className="profile-header-row-1">
            <h2 className="profile-header-username">
              {profileUser.username}
              {profileUser.isVerified && <VerificationBadge />}
            </h2>
            {isOwnProfile ? (
              <div className="profile-actions-buttons">
                {isEditing ? (
                  <button className="btn btn-primary" onClick={handleSaveProfile}>
                    <Check size={16} /> Save
                  </button>
                ) : (
                  <button className="btn btn-secondary" onClick={() => setIsEditing(true)}>
                    <Edit size={16} /> Edit Profile
                  </button>
                )}
                <button className="settings-icon-btn">
                  <Settings size={20} />
                </button>
              </div>
            ) : (
              <button 
                className={`btn ${isFollowing ? 'btn-secondary' : 'btn-primary'}`}
                onClick={() => onFollow(profileUser.id)}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
          </div>

          {/* Row 2: Stats */}
          <div className="profile-header-row-2">
            <span className="stat-item">
              <strong>{userPosts.length}</strong> posts
            </span>
            <span className="stat-item" onClick={() => setShowFollowersModal(true)}>
              <strong>{profileUser.followers?.length || 0}</strong> followers
            </span>
            <span className="stat-item" onClick={() => setShowFollowingModal(true)}>
              <strong>{profileUser.following?.length || 0}</strong> following
            </span>
          </div>

          {/* Row 3: Name & Bio */}
          <div className="profile-header-row-3">
            {isEditing ? (
              <div className="profile-edit-inputs">
                <input 
                  type="text" 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)} 
                  placeholder="Full Name"
                  className="profile-edit-input"
                />
                <textarea 
                  value={bio} 
                  onChange={(e) => setBio(e.target.value)} 
                  placeholder="Bio description"
                  className="profile-edit-textarea"
                />
                <label className="profile-edit-checkbox-row">
                  <input 
                    type="checkbox" 
                    checked={isVerified} 
                    onChange={(e) => setIsVerified(e.target.checked)} 
                  />
                  <span>Show Blue Verification Tick</span>
                </label>
              </div>
            ) : (
              <>
                <h3 className="profile-fullname">{profileUser.fullName}</h3>
                <p className="profile-bio-text">{profileUser.bio}</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="profile-tabs-divider">
        <button 
          className={`profile-tab ${activeTab === 'posts' ? 'active' : ''}`}
          onClick={() => setActiveTab('posts')}
        >
          <Grid size={16} />
          <span>POSTS</span>
        </button>

        {isOwnProfile && (
          <button 
            className={`profile-tab ${activeTab === 'saved' ? 'active' : ''}`}
            onClick={() => setActiveTab('saved')}
          >
            <Bookmark size={16} />
            <span>SAVED</span>
          </button>
        )}

        {isOwnProfile && (
          <button 
            className={`profile-tab ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <BarChart2 size={16} />
            <span>DASHBOARD</span>
          </button>
        )}
      </div>

      {/* Profile Grid content */}
      <div className="profile-grid">
        {activeTab === 'posts' && (
          userPosts.length === 0 ? (
            <div className="profile-empty-tab">
              <h3>No posts yet</h3>
              <p>When you share photos, they will appear on your profile.</p>
            </div>
          ) : (
            <div className="post-grid-layout">
              {userPosts.map(post => (
                <div 
                  className="grid-post-item" 
                  key={post.id}
                  onClick={() => setSelectedPost(post)}
                >
                  <img 
                    src={Array.isArray(post.image) ? post.image[0] : post.image} 
                    alt="Post" 
                    className={`grid-post-img ${post.filter || 'filter-none'}`} 
                  />
                  <div className="grid-post-overlay">
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
          )
        )}

        {activeTab === 'saved' && (
          savedPosts.length === 0 ? (
            <div className="profile-empty-tab">
              <h3>No saved posts</h3>
              <p>Save photos that you want to see again. Only you can see what you've saved.</p>
            </div>
          ) : (
            <div className="post-grid-layout">
              {savedPosts.map(post => (
                <div 
                  className="grid-post-item" 
                  key={post.id}
                  onClick={() => setSelectedPost(post)}
                >
                  <img 
                    src={Array.isArray(post.image) ? post.image[0] : post.image} 
                    alt="Saved Post" 
                    className={`grid-post-img ${post.filter || 'filter-none'}`} 
                  />
                  <div className="grid-post-overlay">
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
          )
        )}

        {/* Creator Analytics Dashboard View */}
        {activeTab === 'analytics' && (
          <div className="analytics-dashboard animate-slide-in">
            <h3 className="analytics-title">Account Insights & Creator Analytics</h3>
            <div className="analytics-grid">
              <div className="analytics-card">
                <span className="analytics-label">Engagement Rate</span>
                <span className="analytics-value">5.82%</span>
                <span className="analytics-growth">+1.2% this week</span>
              </div>
              <div className="analytics-card">
                <span className="analytics-label">Profile Reach</span>
                <span className="analytics-value">12,450</span>
                <span className="analytics-growth">+12.4% vs last week</span>
              </div>
              <div className="analytics-card">
                <span className="analytics-label">Total Likes</span>
                <span className="analytics-value">{posts.reduce((sum, p) => sum + p.likes.length, 0) + 30825}</span>
                <span className="analytics-growth">+894 new likes</span>
              </div>
              <div className="analytics-card">
                <span className="analytics-label">Impressions</span>
                <span className="analytics-value">48,930</span>
                <span className="analytics-growth">+18.5% weekly growth</span>
              </div>
            </div>

            <div className="dashboard-charts-row">
              {/* Followers SVG Chart */}
              <div className="chart-card">
                <h4 className="chart-title">Followers Growth (Weekly)</h4>
                <div className="chart-svg-wrapper">
                  <svg viewBox="0 0 300 120" width="100%" height="100%">
                    <path 
                      d="M10 100 Q 50 80, 90 90 T 170 50 T 250 30 T 290 10" 
                      fill="none" 
                      stroke="url(#instaGrad)" 
                      strokeWidth="3.5" 
                    />
                    <circle cx="290" cy="10" r="4" fill="var(--accent-color)" />
                    <defs>
                      <linearGradient id="instaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f09433" />
                        <stop offset="50%" stopColor="#dc2743" />
                        <stop offset="100%" stopColor="#bc1888" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>

              {/* Engagement SVG Chart */}
              <div className="chart-card">
                <h4 className="chart-title">Monthly Interactions (Likes vs Comments)</h4>
                <div className="chart-svg-wrapper">
                  <svg viewBox="0 0 300 120" width="100%" height="100%">
                    {/* Bar Graph */}
                    <rect x="20" y="40" width="20" height="70" rx="3" fill="#0095f6" />
                    <rect x="60" y="30" width="20" height="80" rx="3" fill="#ff4766" />
                    <rect x="100" y="55" width="20" height="55" rx="3" fill="#0095f6" />
                    <rect x="140" y="20" width="20" height="90" rx="3" fill="#ff4766" />
                    <rect x="180" y="70" width="20" height="40" rx="3" fill="#0095f6" />
                    <rect x="220" y="45" width="20" height="65" rx="3" fill="#ff4766" />
                    <rect x="260" y="10" width="20" height="100" rx="3" fill="url(#instaGrad)" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Followers Modal */}
      {showFollowersModal && (
        <div className="user-list-modal-overlay animate-fade-in" onClick={() => setShowFollowersModal(false)}>
          <div className="user-list-modal-card animate-slide-in" onClick={(e) => e.stopPropagation()}>
            <div className="user-list-modal-header">
              <h3>Followers</h3>
              <button className="modal-close-icon-btn" onClick={() => setShowFollowersModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="user-list-modal-body">
              {followersList.length === 0 ? (
                <div className="profile-empty-tab">No followers yet.</div>
              ) : (
                followersList.map(user => (
                  <div className="modal-user-item-row" key={user.id}>
                    <div className="modal-user-left" onClick={() => {
                      setShowFollowersModal(false);
                      onFollow(user.id);
                    }}>
                      <img src={user.avatar} alt="avatar" className="modal-user-avatar" />
                      <div className="modal-user-info">
                        <span className="modal-username">
                          {user.username}
                          {user.isVerified && <VerificationBadge />}
                        </span>
                        <span className="modal-fullname">{user.fullName}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Following Modal */}
      {showFollowingModal && (
        <div className="user-list-modal-overlay animate-fade-in" onClick={() => setShowFollowingModal(false)}>
          <div className="user-list-modal-card animate-slide-in" onClick={(e) => e.stopPropagation()}>
            <div className="user-list-modal-header">
              <h3>Following</h3>
              <button className="modal-close-icon-btn" onClick={() => setShowFollowingModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="user-list-modal-body">
              {followingList.length === 0 ? (
                <div className="profile-empty-tab">Not following anyone yet.</div>
              ) : (
                followingList.map(user => (
                  <div className="modal-user-item-row" key={user.id}>
                    <div className="modal-user-left" onClick={() => {
                      setShowFollowingModal(false);
                      onFollow(user.id);
                    }}>
                      <img src={user.avatar} alt="avatar" className="modal-user-avatar" />
                      <div className="modal-user-info">
                        <span className="modal-username">
                          {user.username}
                          {user.isVerified && <VerificationBadge />}
                        </span>
                        <span className="modal-fullname">{user.fullName}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Focus Post Detail Modal */}
      {selectedPost && (
        <div className="focus-post-modal-overlay animate-fade-in" onClick={() => setSelectedPost(null)}>
          <div className="focus-post-modal-content" onClick={(e) => e.stopPropagation()}>
            <PostCard 
              post={selectedPost}
              currentUser={currentUser}
              onLike={onLike}
              onComment={onComment}
              onSave={onSave}
              onViewProfile={() => setSelectedPost(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
