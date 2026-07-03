import React, { useState, useRef } from 'react';
import { Heart, MessageCircle, Share2, Volume2, VolumeX, Music, MessageSquare } from 'lucide-react';

const REELS_DATA = [
  {
    id: 'reel_1',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    username: 'sarah_23',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    caption: 'Vibing in the city with my camera! 📸✨ #creative #reels #photography',
    audioName: 'Original Audio - sarah_23',
    likes: 12450,
    comments: 89
  },
  {
    id: 'reel_2',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    username: 'rohit.dev',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
    caption: 'Practice makes perfect. Never stop grinding! 🛹🔥 #skatelife #sports #motivation',
    audioName: 'Lofi Chill Vibes - rohit.dev',
    likes: 8530,
    comments: 42
  },
  {
    id: 'reel_3',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    username: 'john.doe',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop',
    caption: 'Hiking in nature is the best therapy. Happy coding! 🌲🏞️ #nature #trekking #developer',
    audioName: 'Acoustic Guitar Melodies - john.doe',
    likes: 9840,
    comments: 67
  }
];

export default function Reels() {
  const [muted, setMuted] = useState(true);
  const [likesState, setLikesState] = useState(REELS_DATA.map(() => false));
  const [likesCount, setLikesCount] = useState(REELS_DATA.map(r => r.likes));
  const [playingIndex, setPlayingIndex] = useState(0);

  const videoRefs = useRef([]);

  const togglePlay = (index) => {
    const video = videoRefs.current[index];
    if (video) {
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    }
  };

  const handleLike = (index) => {
    const newLikes = [...likesState];
    newLikes[index] = !newLikes[index];
    setLikesState(newLikes);

    const newCounts = [...likesCount];
    if (newLikes[index]) {
      newCounts[index] += 1;
    } else {
      newCounts[index] -= 1;
    }
    setLikesCount(newCounts);
  };

  const handleScroll = (e) => {
    const scrollPos = e.target.scrollTop;
    const index = Math.round(scrollPos / e.target.clientHeight);
    if (index !== playingIndex && index >= 0 && index < REELS_DATA.length) {
      // Pause old video
      if (videoRefs.current[playingIndex]) {
        videoRefs.current[playingIndex].pause();
      }
      // Play new video
      setPlayingIndex(index);
      if (videoRefs.current[index]) {
        videoRefs.current[index].play().catch(() => {});
      }
    }
  };

  return (
    <div className="reels-container animate-fade-in">
      <div className="reels-feed" onScroll={handleScroll}>
        {REELS_DATA.map((reel, idx) => {
          const isLiked = likesState[idx];
          const count = likesCount[idx];
          return (
            <div className="reel-card" key={reel.id}>
              {/* Video Element */}
              <video 
                ref={el => videoRefs.current[idx] = el}
                src={reel.videoUrl}
                className="reel-video"
                loop
                playsInline
                autoPlay={idx === 0}
                muted={muted}
                onClick={() => togglePlay(idx)}
              />

              {/* Mute Overlay Control */}
              <button className="reel-mute-btn" onClick={() => setMuted(!muted)}>
                {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>

              {/* Sidebar controls overlay */}
              <div className="reel-sidebar">
                <button 
                  className={`reel-sidebar-btn ${isLiked ? 'liked' : ''}`}
                  onClick={() => handleLike(idx)}
                >
                  <Heart size={26} fill={isLiked ? "var(--accent-color)" : "none"} />
                  <span>{count.toLocaleString()}</span>
                </button>

                <button className="reel-sidebar-btn">
                  <MessageSquare size={26} />
                  <span>{reel.comments}</span>
                </button>

                <button className="reel-sidebar-btn">
                  <Share2 size={26} />
                  <span>Share</span>
                </button>
              </div>

              {/* Description Details Panel */}
              <div className="reel-details">
                <div className="reel-user-row">
                  <img src={reel.avatar} alt={reel.username} className="reel-user-avatar" />
                  <span className="reel-username">{reel.username}</span>
                  <span className="dot">•</span>
                  <button className="reel-follow-btn">Follow</button>
                </div>
                
                <p className="reel-caption">{reel.caption}</p>
                
                <div className="reel-music-row">
                  <Music size={14} className="music-icon" />
                  <div className="music-ticker">
                    <span>{reel.audioName}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
