import localDB from './localDB.js';

const API_BASE = 'http://localhost:5000/api';

// State to track if backend is online
let backendOnline = false;

// Check connection
async function checkBackend() {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(1500) });
    if (res.ok) {
      const data = await res.json();
      if (data.status === 'healthy') {
        backendOnline = true;
        return true;
      }
    }
  } catch (err) {
    // Fail silently, fallback to localDB
  }
  backendOnline = false;
  return false;
}

// Initial check
await checkBackend();

// Periodic checks
setInterval(checkBackend, 15000);

// Helper for authorized headers
function getHeaders(contentType = 'application/json') {
  const token = localStorage.getItem('instaclone_jwt_token');
  const headers = {};
  if (contentType) {
    headers['Content-Type'] = contentType;
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

const api = {
  isFullStack: () => backendOnline,
  checkConnection: checkBackend,

  // --- AUTHENTICATION ---
  getCurrentUser: async () => {
    if (!backendOnline) {
      return localDB.getCurrentUser();
    }
    
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: getHeaders()
      });
      if (!res.ok) {
        // Token might have expired
        localStorage.removeItem('instaclone_jwt_token');
        return null;
      }
      return await res.json();
    } catch (e) {
      return localDB.getCurrentUser(); // fallback
    }
  },

  login: async (username, password) => {
    if (!backendOnline) {
      const user = localDB.login(username, password);
      return { user };
    }

    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    
    localStorage.setItem('instaclone_jwt_token', data.token);
    localDB.setCurrentUser(data.user); // Sync local state
    return data;
  },

  register: async (username, fullName, email, password) => {
    if (!backendOnline) {
      const user = localDB.register(username, fullName, email, password);
      return { user };
    }

    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, fullName, email, password })
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    
    localStorage.setItem('instaclone_jwt_token', data.token);
    localDB.setCurrentUser(data.user); // Sync local state
    return data;
  },

  logout: async () => {
    localStorage.removeItem('instaclone_jwt_token');
    localDB.logout();
  },

  updateProfile: async (fullName, bio, avatar) => {
    if (!backendOnline) {
      return localDB.updateProfile(fullName, bio, avatar);
    }

    const res = await fetch(`${API_BASE}/users/profile`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ fullName, bio, avatar })
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Profile update failed');
    
    localDB.setCurrentUser(data); // Sync local state
    return data;
  },

  getUserByUsername: async (username) => {
    if (!backendOnline) {
      const users = localDB.getAllUsers();
      const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
      if (!user) throw new Error('User not found');
      return user;
    }

    const res = await fetch(`${API_BASE}/users/${username}`, {
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'User not found');
    return data;
  },

  getAllUsers: async () => {
    if (!backendOnline) {
      return localDB.getAllUsers();
    }
    try {
      const res = await fetch(`${API_BASE}/users`, { headers: getHeaders() });
      return await res.json();
    } catch {
      return localDB.getAllUsers();
    }
  },

  // --- POSTS ---
  getPosts: async () => {
    if (!backendOnline) {
      return localDB.getPosts();
    }
    try {
      const res = await fetch(`${API_BASE}/posts`, { headers: getHeaders() });
      return await res.json();
    } catch {
      return localDB.getPosts();
    }
  },

  createPost: async (imageSrc, caption, filter) => {
    if (!backendOnline) {
      return localDB.createPost(imageSrc, caption, filter);
    }

    // Since we are uploading, we send Base64 string directly in JSON
    // express has limits set to 10MB to accommodate this.
    const res = await fetch(`${API_BASE}/posts`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ image: imageSrc, caption, filter })
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create post');
    return data;
  },

  likePost: async (postId) => {
    if (!backendOnline) {
      return localDB.likePost(postId);
    }

    const res = await fetch(`${API_BASE}/posts/${postId}/like`, {
      method: 'POST',
      headers: getHeaders()
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to like post');
    return data;
  },

  addComment: async (postId, text) => {
    if (!backendOnline) {
      return localDB.addComment(postId, text);
    }

    const res = await fetch(`${API_BASE}/posts/${postId}/comment`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ text })
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to add comment');
    return data;
  },

  // --- STORIES ---
  getStories: async () => {
    if (!backendOnline) {
      return localDB.getStories();
    }
    try {
      const res = await fetch(`${API_BASE}/stories`, { headers: getHeaders() });
      return await res.json();
    } catch {
      return localDB.getStories();
    }
  },

  addStory: async (imageSrc) => {
    if (!backendOnline) {
      return localDB.addStory(imageSrc);
    }

    const res = await fetch(`${API_BASE}/stories`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ image: imageSrc })
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to add story');
    return data;
  },

  // --- DIRECT MESSAGES ---
  getMessages: async (otherUserId) => {
    if (!backendOnline) {
      return localDB.getMessages(otherUserId);
    }
    try {
      const res = await fetch(`${API_BASE}/messages/${otherUserId}`, { headers: getHeaders() });
      return await res.json();
    } catch {
      return localDB.getMessages(otherUserId);
    }
  },

  sendMessage: async (receiverId, text) => {
    if (!backendOnline) {
      return localDB.sendMessage(receiverId, text);
    }

    const res = await fetch(`${API_BASE}/messages`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ receiverId, text })
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to send message');
    return data;
  },

  // --- NOTIFICATIONS ---
  getNotifications: async () => {
    if (!backendOnline) {
      return localDB.getNotifications();
    }
    try {
      const res = await fetch(`${API_BASE}/notifications`, { headers: getHeaders() });
      return await res.json();
    } catch {
      return localDB.getNotifications();
    }
  },

  markNotificationsRead: async () => {
    if (!backendOnline) {
      localDB.markNotificationsRead();
      return;
    }
    try {
      await fetch(`${API_BASE}/notifications/read`, {
        method: 'POST',
        headers: getHeaders()
      });
    } catch {
      localDB.markNotificationsRead();
    }
  },

  // --- FOLLOW / UNFOLLOW ---
  followUser: async (targetUserId) => {
    if (!backendOnline) {
      return localDB.followUser(targetUserId);
    }

    const res = await fetch(`${API_BASE}/users/${targetUserId}/follow`, {
      method: 'POST',
      headers: getHeaders()
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to follow user');
    return data;
  },

  // --- SAVE / BOOKMARK ---
  toggleSavePost: async (postId) => {
    if (!backendOnline) {
      return localDB.toggleSavePost(postId);
    }

    const res = await fetch(`${API_BASE}/posts/${postId}/save`, {
      method: 'POST',
      headers: getHeaders()
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to save post');
    return data;
  }
};

export default api;
