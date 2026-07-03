// Local Database Service using LocalStorage
// Provides full persistence for standalone (Vercel) mode

const STORAGE_KEYS = {
  USERS: 'instaclone_users',
  POSTS: 'instaclone_posts',
  STORIES: 'instaclone_stories',
  MESSAGES: 'instaclone_messages',
  NOTIFICATIONS: 'instaclone_notifications',
  CURRENT_USER: 'instaclone_current_user'
};

// Initial default data
const DEFAULT_USERS = [
  {
    id: 'user_1',
    username: 'john.doe',
    fullName: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop',
    bio: 'Full Stack Developer | Building things for the web 🚀',
    followers: ['user_2', 'user_3'],
    following: ['user_2', 'user_4'],
    savedPosts: []
  },
  {
    id: 'user_2',
    username: 'sarah_23',
    fullName: 'Sarah Jenkins',
    email: 'sarah@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    bio: 'Travel Photographer 📸 | Wanderlust ✈️',
    followers: ['user_1', 'user_4'],
    following: ['user_1', 'user_3'],
    savedPosts: []
  },
  {
    id: 'user_3',
    username: 'rohit.dev',
    fullName: 'Rohit Sharma',
    email: 'rohit@example.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
    bio: 'UI/UX Designer | Clean designs only ✨',
    followers: ['user_2'],
    following: ['user_1', 'user_2'],
    savedPosts: []
  },
  {
    id: 'user_4',
    username: 'jessica.a',
    fullName: 'Jessica Adams',
    email: 'jessica@example.com',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
    bio: 'Food blogger 🍕 | Coffee Lover ☕',
    followers: ['user_1'],
    following: ['user_2'],
    savedPosts: []
  }
];

const DEFAULT_POSTS = [
  {
    id: 'post_1',
    userId: 'user_2',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&fit=crop',
    caption: 'Chasing golden sunsets by the ocean 🌅🌊 #travel #wanderlust',
    filter: 'filter-juno',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
    likes: ['user_1', 'user_3'],
    comments: [
      { id: 'c_1', userId: 'user_1', text: 'Stunning view, Sarah! 😍', createdAt: new Date(Date.now() - 3600000 * 1.5).toISOString() },
      { id: 'c_2', userId: 'user_3', text: 'Composition is perfect! 👌', createdAt: new Date(Date.now() - 3600000 * 1.2).toISOString() }
    ]
  },
  {
    id: 'post_2',
    userId: 'user_1',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&fit=crop',
    caption: 'Midnight coding session. Coffee is my co-pilot 💻☕ #developer #javascript #code',
    filter: 'filter-dramatic',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(), // 5 hours ago
    likes: ['user_2', 'user_4'],
    comments: [
      { id: 'c_3', userId: 'user_2', text: 'Get some sleep! 😂', createdAt: new Date(Date.now() - 3600000 * 4.5).toISOString() },
      { id: 'c_4', userId: 'user_4', text: 'Looks clean, what theme is this?', createdAt: new Date(Date.now() - 3600000 * 4).toISOString() }
    ]
  },
  {
    id: 'post_3',
    userId: 'user_3',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&fit=crop',
    caption: 'Nature therapy in Yosemite Valley Valley 🌲🏔️ #nature #outdoors #yosemite',
    filter: 'filter-none',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
    likes: ['user_1', 'user_2'],
    comments: [
      { id: 'c_5', userId: 'user_1', text: 'Adding this to my bucket list!', createdAt: new Date(Date.now() - 3600000 * 20).toISOString() }
    ]
  }
];

const DEFAULT_STORIES = [
  {
    id: 'story_1',
    userId: 'user_1',
    userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop',
    username: 'john.doe',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&fit=crop',
    createdAt: new Date().toISOString(),
    viewed: false
  },
  {
    id: 'story_2',
    userId: 'user_2',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    username: 'sarah_23',
    image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=500&fit=crop',
    createdAt: new Date().toISOString(),
    viewed: false
  },
  {
    id: 'story_3',
    userId: 'user_3',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
    username: 'rohit.dev',
    image: 'https://images.unsplash.com/photo-1544077960-604201fe74bc?w=500&fit=crop',
    createdAt: new Date().toISOString(),
    viewed: false
  }
];

const DEFAULT_MESSAGES = [
  { id: 'm_1', senderId: 'user_2', receiverId: 'user_1', text: 'Hey John, loved your recent post!', createdAt: new Date(Date.now() - 3600000 * 3).toISOString() },
  { id: 'm_2', senderId: 'user_1', receiverId: 'user_2', text: 'Thanks Sarah! Really appreciate it 🙏', createdAt: new Date(Date.now() - 3600000 * 2.8).toISOString() },
  { id: 'm_3', senderId: 'user_2', receiverId: 'user_1', text: 'Are you working on the React project today?', createdAt: new Date(Date.now() - 3600000 * 2.5).toISOString() }
];

const DEFAULT_NOTIFICATIONS = [
  { id: 'n_1', type: 'like', senderId: 'user_2', receiverId: 'user_1', postId: 'post_2', text: 'liked your post.', createdAt: new Date(Date.now() - 3600000 * 1.5).toISOString(), read: false },
  { id: 'n_2', type: 'comment', senderId: 'user_4', receiverId: 'user_1', postId: 'post_2', text: 'commented: "Looks clean, what theme is this?"', createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), read: false },
  { id: 'n_3', type: 'follow', senderId: 'user_3', receiverId: 'user_1', text: 'started following you.', createdAt: new Date(Date.now() - 3600000 * 24).toISOString(), read: true }
];

// Helper to initialize database
function initDB() {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.POSTS)) {
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(DEFAULT_POSTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.STORIES)) {
    localStorage.setItem(STORAGE_KEYS.STORIES, JSON.stringify(DEFAULT_STORIES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.MESSAGES)) {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(DEFAULT_MESSAGES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(DEFAULT_NOTIFICATIONS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(DEFAULT_USERS[0])); // log in john.doe by default
  }
}

// Invoke initialization
initDB();

// Core DB actions wrapper
const localDB = {
  // --- AUTHENTICATION ---
  getCurrentUser: () => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER));
  },

  setCurrentUser: (user) => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  },

  login: (username, password) => {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS));
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (!user) throw new Error('User not found');
    
    // In local db, we simulate correct password
    localDB.setCurrentUser(user);
    return user;
  },

  register: (username, fullName, email, password) => {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS));
    if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
      throw new Error('Username already exists');
    }
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('Email already registered');
    }

    const newUser = {
      id: 'user_' + (users.length + 1) + '_' + Math.random().toString(36).substr(2, 5),
      username: username.toLowerCase().replace(/\s+/g, ''),
      fullName,
      email,
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${username}`, // Beautiful auto avatar
      bio: `Hello! I am new here.`,
      followers: [],
      following: [],
      savedPosts: []
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    localDB.setCurrentUser(newUser);
    return newUser;
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  updateProfile: (fullName, bio, avatar) => {
    const currentUser = localDB.getCurrentUser();
    if (!currentUser) throw new Error('Not logged in');

    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS));
    const userIdx = users.findIndex(u => u.id === currentUser.id);

    if (userIdx !== -1) {
      users[userIdx].fullName = fullName || users[userIdx].fullName;
      users[userIdx].bio = bio !== undefined ? bio : users[userIdx].bio;
      users[userIdx].avatar = avatar || users[userIdx].avatar;

      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      localDB.setCurrentUser(users[userIdx]);
      return users[userIdx];
    }
    throw new Error('User profile error');
  },

  getUserById: (id) => {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS));
    return users.find(u => u.id === id);
  },

  getAllUsers: () => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
  },

  // --- POSTS ---
  getPosts: () => {
    const posts = JSON.parse(localStorage.getItem(STORAGE_KEYS.POSTS)) || [];
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
    
    // Join posts with author profiles
    return posts.map(post => {
      const user = users.find(u => u.id === post.userId) || {
        username: 'deleted_user',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150'
      };
      return {
        ...post,
        username: user.username,
        userAvatar: user.avatar
      };
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  createPost: (imageSrc, caption, filter = 'filter-none') => {
    const currentUser = localDB.getCurrentUser();
    if (!currentUser) throw new Error('Not logged in');

    const posts = JSON.parse(localStorage.getItem(STORAGE_KEYS.POSTS)) || [];
    const newPost = {
      id: 'post_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      userId: currentUser.id,
      image: imageSrc,
      caption,
      filter,
      createdAt: new Date().toISOString(),
      likes: [],
      comments: []
    };

    posts.unshift(newPost);
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
    return {
      ...newPost,
      username: currentUser.username,
      userAvatar: currentUser.avatar
    };
  },

  likePost: (postId) => {
    const currentUser = localDB.getCurrentUser();
    if (!currentUser) throw new Error('Not logged in');

    const posts = JSON.parse(localStorage.getItem(STORAGE_KEYS.POSTS)) || [];
    const postIdx = posts.findIndex(p => p.id === postId);

    if (postIdx !== -1) {
      const post = posts[postIdx];
      const likeIdx = post.likes.indexOf(currentUser.id);
      let liked = false;

      if (likeIdx === -1) {
        post.likes.push(currentUser.id);
        liked = true;

        // Create notification for post owner (if not liking own post)
        if (post.userId !== currentUser.id) {
          localDB.createNotification('like', currentUser.id, post.userId, post.id, 'liked your post.');
        }
      } else {
        post.likes.splice(likeIdx, 1);
      }

      localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
      return { likes: post.likes, liked };
    }
    throw new Error('Post not found');
  },

  addComment: (postId, text) => {
    const currentUser = localDB.getCurrentUser();
    if (!currentUser) throw new Error('Not logged in');

    const posts = JSON.parse(localStorage.getItem(STORAGE_KEYS.POSTS)) || [];
    const postIdx = posts.findIndex(p => p.id === postId);

    if (postIdx !== -1) {
      const post = posts[postIdx];
      const newComment = {
        id: 'c_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        userId: currentUser.id,
        text,
        createdAt: new Date().toISOString()
      };

      post.comments.push(newComment);
      localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));

      // Create notification
      if (post.userId !== currentUser.id) {
        localDB.createNotification('comment', currentUser.id, post.userId, post.id, `commented: "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`);
      }

      return newComment;
    }
    throw new Error('Post not found');
  },

  // --- STORIES ---
  getStories: () => {
    const stories = JSON.parse(localStorage.getItem(STORAGE_KEYS.STORIES)) || [];
    const activeTimeLimit = Date.now() - 24 * 3600000; // 24 hours ago
    
    // Filter active stories
    return stories.filter(s => new Date(s.createdAt).getTime() > activeTimeLimit);
  },

  addStory: (imageSrc) => {
    const currentUser = localDB.getCurrentUser();
    if (!currentUser) throw new Error('Not logged in');

    const stories = JSON.parse(localStorage.getItem(STORAGE_KEYS.STORIES)) || [];
    const newStory = {
      id: 'story_' + Date.now(),
      userId: currentUser.id,
      userAvatar: currentUser.avatar,
      username: currentUser.username,
      image: imageSrc,
      createdAt: new Date().toISOString(),
      viewed: false
    };

    stories.unshift(newStory);
    localStorage.setItem(STORAGE_KEYS.STORIES, JSON.stringify(stories));
    return newStory;
  },

  // --- DIRECT MESSAGES ---
  getMessages: (otherUserId) => {
    const currentUser = localDB.getCurrentUser();
    if (!currentUser) return [];

    const messages = JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSAGES)) || [];
    return messages.filter(m => 
      (m.senderId === currentUser.id && m.receiverId === otherUserId) ||
      (m.senderId === otherUserId && m.receiverId === currentUser.id)
    ).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  },

  sendMessage: (receiverId, text) => {
    const currentUser = localDB.getCurrentUser();
    if (!currentUser) throw new Error('Not logged in');

    const messages = JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSAGES)) || [];
    const newMessage = {
      id: 'm_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      senderId: currentUser.id,
      receiverId,
      text,
      createdAt: new Date().toISOString()
    };

    messages.push(newMessage);
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
    return newMessage;
  },

  // --- NOTIFICATIONS ---
  getNotifications: () => {
    const currentUser = localDB.getCurrentUser();
    if (!currentUser) return [];

    const notifications = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) || [];
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];

    return notifications
      .filter(n => n.receiverId === currentUser.id)
      .map(n => {
        const sender = users.find(u => u.id === n.senderId) || { username: 'someone', avatar: '' };
        return {
          ...n,
          senderName: sender.fullName,
          senderUsername: sender.username,
          senderAvatar: sender.avatar
        };
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  createNotification: (type, senderId, receiverId, postId, text) => {
    const notifications = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) || [];
    const newNotification = {
      id: 'n_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      type,
      senderId,
      receiverId,
      postId,
      text,
      createdAt: new Date().toISOString(),
      read: false
    };

    notifications.push(newNotification);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    return newNotification;
  },

  markNotificationsRead: () => {
    const currentUser = localDB.getCurrentUser();
    if (!currentUser) return;

    const notifications = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) || [];
    const updated = notifications.map(n => {
      if (n.receiverId === currentUser.id) {
        return { ...n, read: true };
      }
      return n;
    });

    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
  },

  // --- FOLLOW / UNFOLLOW ---
  followUser: (targetUserId) => {
    const currentUser = localDB.getCurrentUser();
    if (!currentUser) throw new Error('Not logged in');
    if (currentUser.id === targetUserId) throw new Error('Cannot follow yourself');

    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS));
    
    const selfIdx = users.findIndex(u => u.id === currentUser.id);
    const targetIdx = users.findIndex(u => u.id === targetUserId);

    if (selfIdx !== -1 && targetIdx !== -1) {
      const self = users[selfIdx];
      const target = users[targetIdx];

      if (!self.following) self.following = [];
      if (!target.followers) target.followers = [];

      const followIdx = self.following.indexOf(targetUserId);
      let followed = false;

      if (followIdx === -1) {
        self.following.push(targetUserId);
        target.followers.push(currentUser.id);
        followed = true;

        // Create follow notification
        localDB.createNotification('follow', currentUser.id, targetUserId, null, 'started following you.');
      } else {
        self.following.splice(followIdx, 1);
        const followerIdx = target.followers.indexOf(currentUser.id);
        if (followerIdx !== -1) target.followers.splice(followerIdx, 1);
      }

      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      localDB.setCurrentUser(self);
      return { following: self.following, followed };
    }
    throw new Error('User not found');
  },

  // --- SAVE / BOOKMARK ---
  toggleSavePost: (postId) => {
    const currentUser = localDB.getCurrentUser();
    if (!currentUser) throw new Error('Not logged in');

    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS));
    const selfIdx = users.findIndex(u => u.id === currentUser.id);

    if (selfIdx !== -1) {
      const self = users[selfIdx];
      if (!self.savedPosts) self.savedPosts = [];

      const savedIdx = self.savedPosts.indexOf(postId);
      let saved = false;

      if (savedIdx === -1) {
        self.savedPosts.push(postId);
        saved = true;
      } else {
        self.savedPosts.splice(savedIdx, 1);
      }

      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      localDB.setCurrentUser(self);
      return { savedPosts: self.savedPosts, saved };
    }
    throw new Error('Save error');
  }
};

export default localDB;
export { STORAGE_KEYS };
