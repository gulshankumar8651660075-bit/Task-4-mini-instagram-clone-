import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Plus } from 'lucide-react';

export default function Stories({ stories, currentUser, onAddStory, onStoryClick }) {
  const [activeStoryIndex, setActiveStoryIndex] = useState(null);
  const [progress, setProgress] = useState(0);

  // Group stories by user
  const userStoriesMap = {};
  stories.forEach(story => {
    if (!userStoriesMap[story.userId]) {
      userStoriesMap[story.userId] = {
        userId: story.userId,
        username: story.username,
        userAvatar: story.userAvatar,
        items: []
      };
    }
    userStoriesMap[story.userId].items.push(story);
  });

  const uniqueUserStories = Object.values(userStoriesMap);

  // Story Viewer Effects
  useEffect(() => {
    let interval;
    if (activeStoryIndex !== null) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            handleNextStory();
            return 0;
          }
          return prev + 2; // Increments to 100 in 2.5 seconds (50 * 50ms)
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [activeStoryIndex]);

  const handleOpenStories = (idx) => {
    setActiveStoryIndex(idx);
    setProgress(0);
  };

  const handleCloseStories = () => {
    setActiveStoryIndex(null);
  };

  const handleNextStory = () => {
    if (activeStoryIndex === null) return;
    if (activeStoryIndex < uniqueUserStories.length - 1) {
      setActiveStoryIndex(activeStoryIndex + 1);
    } else {
      handleCloseStories();
    }
  };

  const handlePrevStory = () => {
    if (activeStoryIndex === null) return;
    if (activeStoryIndex > 0) {
      setActiveStoryIndex(activeStoryIndex - 1);
    } else {
      setProgress(0);
    }
  };

  const triggerUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (readerEvent) => {
          onAddStory(readerEvent.target.result);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  return (
    <>
      <div className="stories-container animate-fade-in">
        {/* Current User Add Story */}
        <div className="story-item" onClick={triggerUpload}>
          <div className="story-avatar-container">
            <img src={currentUser.avatar} alt="You" className="story-avatar" />
            <div className="story-add-badge">
              <Plus size={12} strokeWidth={3} />
            </div>
          </div>
          <span className="story-username">Your Story</span>
        </div>

        {/* Existing Stories */}
        {uniqueUserStories.map((us, idx) => (
          <div className="story-item" key={us.userId} onClick={() => handleOpenStories(idx)}>
            <div className="story-avatar-container story-ring-active">
              <img src={us.userAvatar} alt={us.username} className="story-avatar" />
            </div>
            <span className="story-username">{us.username}</span>
          </div>
        ))}
      </div>

      {/* Story Viewer Modal */}
      {activeStoryIndex !== null && (
        <div className="story-modal-overlay animate-fade-in">
          <button className="story-close-btn" onClick={handleCloseStories}>
            <X size={28} />
          </button>

          <button className="story-nav-btn prev" onClick={handlePrevStory} disabled={activeStoryIndex === 0}>
            <ChevronLeft size={24} />
          </button>

          <div className="story-modal-content">
            {/* Progress Bars */}
            <div className="story-progress-container">
              {uniqueUserStories[activeStoryIndex].items.map((_, itemIdx) => (
                <div className="story-progress-bar-bg" key={itemIdx}>
                  <div 
                    className="story-progress-bar-fill"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              ))}
            </div>

            {/* Header info */}
            <div className="story-header">
              <img 
                src={uniqueUserStories[activeStoryIndex].userAvatar} 
                alt={uniqueUserStories[activeStoryIndex].username} 
                className="story-header-avatar"
              />
              <span className="story-header-username">{uniqueUserStories[activeStoryIndex].username}</span>
              <span className="story-header-time">24h</span>
            </div>

            {/* Content Image */}
            <img 
              src={uniqueUserStories[activeStoryIndex].items[0].image} 
              alt="Story" 
              className="story-modal-image"
            />
          </div>

          <button className="story-nav-btn next" onClick={handleNextStory}>
            <ChevronRight size={24} />
          </button>
        </div>
      )}
    </>
  );
}
