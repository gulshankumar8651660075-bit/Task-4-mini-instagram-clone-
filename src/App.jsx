import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import Feed from './components/Feed.jsx';
import Explore from './components/Explore.jsx';
import NewPost from './components/NewPost.jsx';
import DirectMessages from './components/DirectMessages.jsx';
import Profile from './components/Profile.jsx';
import Reels from './components/Reels.jsx';
import Auth from './components/Auth.jsx';
import api from './services/api.js';
import { CheckCircle } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentScreen, setScreen] = useState('feed'); // 'feed' | 'explore' | 'reels' | 'new-post' | 'messages' | 'notifications' | 'profile'
  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [messages, setMessages] = useState([]);
  
  // Custom navigation parameters
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [profileViewUser, setProfileViewUser] = useState(null);

  // Dark mode
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('instaclone_theme') === 'dark' || 
      (!localStorage.getItem('instaclone_theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // State to track if using backend or mock
  const [isFullStack, setIsFullStack] = useState(api.isFullStack());

  // Check connection status periodically to update badge
  useEffect(() => {
    const checkInterval = setInterval(() => {
      setIsFullStack(api.isFullStack());
    }, 5000);
    return () => clearInterval(checkInterval);
  }, []);

  // Set theme class on body
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('instaclone_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('instaclone_theme', 'light');
    }
  }, [isDarkMode]);

  // Load initial data
  const loadData = async () => {
    try {
      const user = await api.getCurrentUser();
      setCurrentUser(user);

      if (user) {
        const [postsList, storiesList, allUsers, notificationsList] = await Promise.all([
          api.getPosts(),
          api.getStories(),
          api.getAllUsers(),
          api.getNotifications()
        ]);
        
        // Hydrate verification ticks
        const hydratedPosts = postsList.map(post => {
          const author = allUsers.find(u => u.id === post.userId);
          // Hydrate comments usernames
          const hydratedComments = post.comments.map(c => {
            const commenter = allUsers.find(u => u.id === c.userId);
            return {
              ...c,
              username: commenter ? commenter.username : 'user'
            };
          });

          return {
            ...post,
            isVerified: author ? author.isVerified : false,
            comments: hydratedComments
          };
        });

        setPosts(hydratedPosts);
        setStories(storiesList);
        setUsers(allUsers);
        setNotifications(notificationsList);
        
        // Sync current user state
        const updatedCurrentUser = allUsers.find(u => u.id === user.id);
        if (updatedCurrentUser) {
          setCurrentUser(updatedCurrentUser);
        }
      }
    } catch (e) {
      console.error('Failed to load data:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentScreen]);

  // Fetch messages if active chat user changes
  useEffect(() => {
    const fetchChatMessages = async () => {
      if (currentUser && activeChatUser) {
        try {
          const list = await api.getMessages(activeChatUser.id);
          setMessages(list);
        } catch (e) {
          console.error(e);
        }
      }
    };

    fetchChatMessages();
    const messageInterval = setInterval(fetchChatMessages, 4000);
    return () => clearInterval(messageInterval);
  }, [currentUser, activeChatUser]);

  // Actions
  const handleLogin = async (username, password) => {
    const res = await api.login(username, password);
    setCurrentUser(res.user);
    setScreen('feed');
    loadData();
  };

  const handleRegister = async (username, fullName, email, password) => {
    const res = await api.register(username, fullName, email, password);
    setCurrentUser(res.user);
    setScreen('feed');
    loadData();
  };

  const handleLogout = async () => {
    await api.logout();
    setCurrentUser(null);
    setScreen('feed');
    setProfileViewUser(null);
    setActiveChatUser(null);
  };

  const handleCreatePost = async (imageSrc, caption, filter) => {
    try {
      const newPost = await api.createPost(imageSrc, caption, filter);
      // Hydrate local post
      newPost.isVerified = currentUser.isVerified || false;
      setPosts([newPost, ...posts]);
      setScreen('feed');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLikePost = async (postId) => {
    try {
      const res = await api.likePost(postId);
      setPosts(posts.map(p => {
        if (p.id === postId) {
          return { ...p, likes: res.likes };
        }
        return p;
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (postId, text) => {
    try {
      const newComment = await api.addComment(postId, text);
      newComment.username = currentUser.username;
      
      setPosts(posts.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            comments: [...p.comments, newComment]
          };
        }
        return p;
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddStory = async (imageSrc) => {
    try {
      const newStory = await api.addStory(imageSrc);
      setStories([newStory, ...stories]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (receiverId, text) => {
    try {
      const newMsg = await api.sendMessage(receiverId, text);
      setMessages([...messages, newMsg]);

      // Mock bot reply after 2 seconds
      setTimeout(async () => {
        if (activeChatUser && activeChatUser.id === receiverId) {
          const replies = [
            "Wow! That's awesome! 👍",
            "Tell me more about it!",
            "Haha nice! 😂 Let's catch up later.",
            "I am currently working on my assignment, will text you soon!",
            "Cool, see you soon!",
            "That sounds interesting! Let's code together."
          ];
          const randomReply = replies[Math.floor(Math.random() * replies.length)];
          
          const localMessages = JSON.parse(localStorage.getItem('instaclone_messages')) || [];
          localMessages.push({
            id: 'm_reply_' + Date.now(),
            senderId: receiverId,
            receiverId: currentUser.id,
            text: randomReply,
            createdAt: new Date().toISOString()
          });
          localStorage.setItem('instaclone_messages', JSON.stringify(localMessages));
          
          const list = await api.getMessages(receiverId);
          setMessages(list);
        }
      }, 2000);

    } catch (err) {
      console.error(err);
    }
  };

  const handleFollowUser = async (userId) => {
    try {
      const res = await api.followUser(userId);
      
      const updatedUsers = users.map(u => {
        if (u.id === currentUser.id) {
          return { ...u, following: res.following };
        }
        if (u.id === userId) {
          const followers = [...u.followers];
          const selfIdx = followers.indexOf(currentUser.id);
          if (res.followed && selfIdx === -1) {
            followers.push(currentUser.id);
          } else if (!res.followed && selfIdx !== -1) {
            followers.splice(selfIdx, 1);
          }
          return { ...u, followers };
        }
        return u;
      });

      setUsers(updatedUsers);
      const self = updatedUsers.find(u => u.id === currentUser.id);
      setCurrentUser(self);

      if (profileViewUser && profileViewUser.id === userId) {
        const target = updatedUsers.find(u => u.id === userId);
        setProfileViewUser(target);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSavePost = async (postId) => {
    try {
      const res = await api.toggleSavePost(postId);
      setCurrentUser({ ...currentUser, savedPosts: res.savedPosts });
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProfile = async (fullName, bio, avatar, isVerified) => {
    try {
      const updatedUser = await api.updateProfile(fullName, bio, avatar);
      
      // Update isVerified locally
      updatedUser.isVerified = isVerified;
      
      // Persist locally
      const usersList = JSON.parse(localStorage.getItem('instaclone_users')) || [];
      const idx = usersList.findIndex(u => u.id === updatedUser.id);
      if (idx !== -1) {
        usersList[idx].fullName = fullName;
        usersList[idx].bio = bio;
        usersList[idx].avatar = avatar;
        usersList[idx].isVerified = isVerified;
        localStorage.setItem('instaclone_users', JSON.stringify(usersList));
      }
      localStorage.setItem('instaclone_current_user', JSON.stringify(updatedUser));

      setCurrentUser(updatedUser);
      setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleViewProfile = async (username) => {
    try {
      const targetUser = await api.getUserByUsername(username);
      setProfileViewUser(targetUser);
      setScreen('profile');
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkNotificationsRead = async () => {
    await api.markNotificationsRead();
    const list = await api.getNotifications();
    setNotifications(list);
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  return (
    <div className="app-container">
      {currentUser ? (
        <>
          {/* Sidebar Navbar */}
          <Navbar 
            currentScreen={currentScreen} 
            setScreen={(screen) => {
              setScreen(screen);
              if (screen === 'profile') {
                setProfileViewUser(null); // Show own profile
              }
              if (screen === 'notifications') {
                handleMarkNotificationsRead();
              }
            }}
            currentUser={currentUser}
            onLogout={handleLogout}
            isDarkMode={isDarkMode}
            toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
            isFullStack={isFullStack}
            unreadNotifications={unreadNotificationsCount}
            unreadMessages={0}
          />

          {/* Main workspace section */}
          <main className="main-content">
            {/* Feed Screen */}
            {currentScreen === 'feed' && (
              <Feed 
                posts={posts}
                stories={stories}
                currentUser={currentUser}
                users={users}
                onLike={handleLikePost}
                onComment={handleAddComment}
                onSave={handleSavePost}
                onAddStory={handleAddStory}
                onFollow={handleFollowUser}
                onViewProfile={handleViewProfile}
              />
            )}

            {/* Explore Screen */}
            {currentScreen === 'explore' && (
              <Explore 
                posts={posts}
                users={users}
                currentUser={currentUser}
                onViewProfile={handleViewProfile}
                onFollow={handleFollowUser}
              />
            )}

            {/* Reels Screen */}
            {currentScreen === 'reels' && (
              <Reels />
            )}

            {/* New Post Screen */}
            {currentScreen === 'new-post' && (
              <NewPost 
                onSubmit={handleCreatePost}
                onCancel={() => setScreen('feed')}
              />
            )}

            {/* Messages (DMs) Screen */}
            {currentScreen === 'messages' && (
              <DirectMessages 
                currentUser={currentUser}
                users={users}
                messages={messages}
                activeChatUser={activeChatUser}
                onSelectChatUser={setActiveChatUser}
                onSendMessage={handleSendMessage}
              />
            )}

            {/* Notifications Screen */}
            {currentScreen === 'notifications' && (
              <div className="notifications-container animate-fade-in">
                <h2>Notifications</h2>
                {notifications.length === 0 ? (
                  <div className="empty-notifications">
                    <CheckCircle size={40} className="empty-check" />
                    <p>You're all caught up! No new notifications.</p>
                  </div>
                ) : (
                  <div className="notifications-list">
                    {notifications.map(n => (
                      <div className={`notification-item ${!n.read ? 'unread' : ''}`} key={n.id}>
                        <img src={n.senderAvatar} alt="Sender" className="noti-avatar" />
                        <div className="noti-content">
                          <span className="noti-username" onClick={() => handleViewProfile(n.senderUsername)}>
                            {n.senderUsername}
                          </span>{' '}
                          <span className="noti-text">{n.text}</span>
                          <span className="noti-time">
                            {new Date(n.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {n.postId && (
                          <div className="noti-post-preview" onClick={() => {
                            const post = posts.find(p => p.id === n.postId);
                            if (post) {
                              setProfileViewUser(users.find(u => u.id === post.userId));
                              setScreen('profile');
                            }
                          }}>
                            <img src={posts.find(p => p.id === n.postId)?.image} alt="post" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Profile Screen */}
            {currentScreen === 'profile' && (
              <Profile 
                profileUser={profileViewUser || currentUser}
                currentUser={currentUser}
                posts={posts}
                users={users}
                onFollow={handleFollowUser}
                onSave={handleSavePost}
                onLike={handleLikePost}
                onComment={handleAddComment}
                onUpdateProfile={handleUpdateProfile}
              />
            )}
          </main>
        </>
      ) : (
        /* Auth Screen */
        <Auth onLogin={handleLogin} onRegister={handleRegister} />
      )}
    </div>
  );
}
