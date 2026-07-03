import React, { useState } from 'react';
import { Heart, MessageCircle, Bookmark, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

export default function PostCard({ post, currentUser, onLike, onComment, onSave, onViewProfile }) {
  const [newComment, setNewComment] = useState('');
  const [showHeartPop, setShowHeartPop] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  const isLiked = post.likes.includes(currentUser.id);
  const isSaved = currentUser.savedPosts?.includes(post.id) || false;

  // Check if post image is a carousel array
  const images = Array.isArray(post.image) ? post.image : [post.image];
  const isCarousel = images.length > 1;

  // Double tap to like
  let lastTap = 0;
  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;
    if (now - lastTap < DOUBLE_PRESS_DELAY) {
      if (!isLiked) {
        onLike(post.id);
      }
      setShowHeartPop(true);
      setTimeout(() => setShowHeartPop(false), 800);
    }
    lastTap = now;
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    onComment(post.id, newComment);
    setNewComment('');
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    if (currentImgIndex < images.length - 1) {
      setCurrentImgIndex(currentImgIndex + 1);
    }
  };

  const handlePrevImage = (e) => {
    e.stopPropagation();
    if (currentImgIndex > 0) {
      setCurrentImgIndex(currentImgIndex - 1);
    }
  };

  // Format date helper
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  // Verification Badge icon
  const VerificationBadge = () => (
    <svg className="verification-badge" viewBox="0 0 24 24" width="14" height="14" style={{marginLeft: '4px'}}>
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" stroke="white" strokeWidth="2.5" fill="none" />
      <circle cx="12" cy="12" r="10" fill="#0095f6" zIndex="-1" style={{mixBlendMode: 'destination-over'}} />
    </svg>
  );

  return (
    <div className="post-card animate-slide-in">
      {/* Header */}
      <div className="post-header">
        <div className="post-header-left" onClick={() => onViewProfile(post.username)}>
          <img src={post.userAvatar} alt={post.username} className="post-avatar" />
          <div className="post-header-info">
            <span className="post-username">
              {post.username}
              {post.isVerified && <VerificationBadge />}
            </span>
            <span className="post-location">Verified Location</span>
          </div>
        </div>
        <button className="post-more-btn">
          <MoreHorizontal size={18} />
        </button>
      </div>

      {/* Post Image Container (handles Carousel slides) */}
      <div className="post-image-container" onDoubleClick={handleDoubleTap}>
        <img 
          src={images[currentImgIndex]} 
          alt={`Post Content ${currentImgIndex + 1}`} 
          className={`post-image ${post.filter || 'filter-none'}`} 
        />

        {/* Carousel overlay controls */}
        {isCarousel && currentImgIndex > 0 && (
          <button className="carousel-btn left" onClick={handlePrevImage}>
            <ChevronLeft size={16} />
          </button>
        )}
        {isCarousel && currentImgIndex < images.length - 1 && (
          <button className="carousel-btn right" onClick={handleNextImage}>
            <ChevronRight size={16} />
          </button>
        )}

        {/* Carousel indicators */}
        {isCarousel && (
          <div className="carousel-dots">
            {images.map((_, i) => (
              <span 
                key={i} 
                className={`carousel-dot ${i === currentImgIndex ? 'active' : ''}`}
              />
            ))}
          </div>
        )}

        {/* Popping Heart Animation on double tap */}
        {showHeartPop && (
          <div className="heart-pop-overlay">
            <Heart size={80} fill="white" color="white" className="animate-heart-pop" />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="post-actions">
        <div className="post-actions-left">
          <button 
            onClick={() => onLike(post.id)}
            className={`action-btn like-btn ${isLiked ? 'liked' : ''}`}
          >
            <Heart size={24} fill={isLiked ? "var(--accent-color)" : "none"} />
          </button>
          <button 
            onClick={() => setShowComments(!showComments)}
            className="action-btn"
          >
            <MessageCircle size={24} />
          </button>
        </div>
        <button 
          onClick={() => onSave(post.id)}
          className={`action-btn save-btn ${isSaved ? 'saved' : ''}`}
        >
          <Bookmark size={24} fill={isSaved ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Likes */}
      <div className="post-likes-count">
        {post.likes.length.toLocaleString()} {post.likes.length === 1 ? 'like' : 'likes'}
      </div>

      {/* Caption */}
      <div className="post-caption-section">
        <span className="post-username" onClick={() => onViewProfile(post.username)}>
          {post.username}
          {post.isVerified && <VerificationBadge />}
        </span>{' '}
        <span className="post-caption-text">{post.caption}</span>
      </div>

      {/* Comments Preview */}
      {post.comments.length > 0 && !showComments && (
        <button 
          className="view-comments-btn" 
          onClick={() => setShowComments(true)}
        >
          View all {post.comments.length} comments
        </button>
      )}

      {/* Comments List */}
      {showComments && (
        <div className="post-comments-list animate-fade-in">
          {post.comments.map((comment) => (
            <div className="comment-item" key={comment.id}>
              <span className="comment-username">{comment.username || 'user'}</span>{' '}
              <span className="comment-text">{comment.text}</span>
              <span className="comment-time">{formatTimeAgo(comment.createdAt)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Timestamp */}
      <div className="post-time">{formatTimeAgo(post.createdAt)}</div>

      {/* Comment Input */}
      <form onSubmit={handleCommentSubmit} className="post-comment-form">
        <input 
          type="text" 
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="comment-input"
        />
        <button type="submit" className="comment-post-btn" disabled={!newComment.trim()}>
          Post
        </button>
      </form>
    </div>
  );
}
