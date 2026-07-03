import express from 'express';
import cors from 'cors';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import db from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'instaclone-super-secret-key-12345';

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
try {
  await fs.mkdir(uploadsDir, { recursive: true });
} catch (err) {
  console.error('Failed to create uploads directory:', err);
}

// Serve uploaded static files
app.use('/uploads', express.static(uploadsDir));

// Multer configurations
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access token missing' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token invalid or expired' });
    req.user = user;
    next();
  });
};

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', database: 'connected' });
});

// --- AUTH ROUTINGS ---

app.post('/api/auth/register', async (req, res) => {
  const { username, fullName, email, password } = req.body;
  if (!username || !fullName || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const users = await db.getCollection('users');
    const uName = username.trim().toLowerCase();
    const uEmail = email.trim().toLowerCase();

    if (users.find(u => u.username === uName)) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    if (users.find(u => u.email === uEmail)) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = {
      id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      username: uName.replace(/\s+/g, ''),
      fullName,
      email: uEmail,
      passwordHash,
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${username}`,
      bio: 'Hello! I am new here.',
      followers: [],
      following: [],
      savedPosts: []
    };

    users.push(newUser);
    await db.saveCollection('users', users);

    // Create JWT
    const token = jwt.sign({ id: newUser.id, username: newUser.username }, JWT_SECRET, { expiresIn: '7d' });
    
    // Omit hash in response
    const { passwordHash: _, ...userWithoutHash } = newUser;
    res.status(201).json({ user: userWithoutHash, token });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed: ' + error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const users = await db.getCollection('users');
    const user = users.find(u => u.username.toLowerCase() === username.trim().toLowerCase());
    
    if (!user) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    const { passwordHash: _, ...userWithoutHash } = user;

    res.json({ user: userWithoutHash, token });
  } catch (error) {
    res.status(500).json({ error: 'Login failed: ' + error.message });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const users = await db.getCollection('users');
    const user = users.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { passwordHash: _, ...userWithoutHash } = user;
    res.json(userWithoutHash);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- POSTS ROUTINGS ---

app.get('/api/posts', async (req, res) => {
  try {
    const posts = await db.getCollection('posts');
    const users = await db.getCollection('users');

    const hydratedPosts = posts.map(post => {
      const author = users.find(u => u.id === post.userId) || { username: 'deleted_user', avatar: '' };
      return {
        ...post,
        username: author.username,
        userAvatar: author.avatar
      };
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(hydratedPosts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/posts', authenticateToken, upload.single('image'), async (req, res) => {
  const { caption, filter } = req.body;
  if (!req.file && !req.body.image) {
    return res.status(400).json({ error: 'Image is required' });
  }

  try {
    const posts = await db.getCollection('posts');
    const users = await db.getCollection('users');
    const currentUser = users.find(u => u.id === req.user.id);

    // Support file uploads or base64 data url
    let imageUrl = '';
    if (req.file) {
      imageUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
    } else {
      imageUrl = req.body.image; // Base64
    }

    const newPost = {
      id: 'post_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      userId: req.user.id,
      image: imageUrl,
      caption: caption || '',
      filter: filter || 'filter-none',
      createdAt: new Date().toISOString(),
      likes: [],
      comments: []
    };

    posts.unshift(newPost);
    await db.saveCollection('posts', posts);

    res.status(201).json({
      ...newPost,
      username: currentUser.username,
      userAvatar: currentUser.avatar
    });
  } catch (error) {
    res.status(500).json({ error: 'Post creation failed: ' + error.message });
  }
});

app.post('/api/posts/:id/like', authenticateToken, async (req, res) => {
  try {
    const posts = await db.getCollection('posts');
    const postIdx = posts.findIndex(p => p.id === req.params.id);

    if (postIdx === -1) return res.status(404).json({ error: 'Post not found' });

    const post = posts[postIdx];
    const likeIdx = post.likes.indexOf(req.user.id);
    let liked = false;

    if (likeIdx === -1) {
      post.likes.push(req.user.id);
      liked = true;

      // Add Notification
      if (post.userId !== req.user.id) {
        const notifications = await db.getCollection('notifications');
        notifications.push({
          id: 'n_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
          type: 'like',
          senderId: req.user.id,
          receiverId: post.userId,
          postId: post.id,
          text: 'liked your post.',
          createdAt: new Date().toISOString(),
          read: false
        });
        await db.saveCollection('notifications', notifications);
      }
    } else {
      post.likes.splice(likeIdx, 1);
    }

    await db.saveCollection('posts', posts);
    res.json({ likes: post.likes, liked });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/posts/:id/comment', authenticateToken, async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Comment text is required' });

  try {
    const posts = await db.getCollection('posts');
    const postIdx = posts.findIndex(p => p.id === req.params.id);

    if (postIdx === -1) return res.status(404).json({ error: 'Post not found' });

    const post = posts[postIdx];
    const newComment = {
      id: 'c_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      userId: req.user.id,
      text,
      createdAt: new Date().toISOString()
    };

    post.comments.push(newComment);
    await db.saveCollection('posts', posts);

    // Add Notification
    if (post.userId !== req.user.id) {
      const notifications = await db.getCollection('notifications');
      notifications.push({
        id: 'n_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        type: 'comment',
        senderId: req.user.id,
        receiverId: post.userId,
        postId: post.id,
        text: `commented: "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`,
        createdAt: new Date().toISOString(),
        read: false
      });
      await db.saveCollection('notifications', notifications);
    }

    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- STORIES ROUTINGS ---

app.get('/api/stories', async (req, res) => {
  try {
    const stories = await db.getCollection('stories');
    const activeTimeLimit = Date.now() - 24 * 3600000;
    const activeStories = stories.filter(s => new Date(s.createdAt).getTime() > activeTimeLimit);
    res.json(activeStories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/stories', authenticateToken, upload.single('image'), async (req, res) => {
  if (!req.file && !req.body.image) {
    return res.status(400).json({ error: 'Image is required' });
  }

  try {
    const stories = await db.getCollection('stories');
    const users = await db.getCollection('users');
    const currentUser = users.find(u => u.id === req.user.id);

    let imageUrl = '';
    if (req.file) {
      imageUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
    } else {
      imageUrl = req.body.image;
    }

    const newStory = {
      id: 'story_' + Date.now(),
      userId: req.user.id,
      userAvatar: currentUser.avatar,
      username: currentUser.username,
      image: imageUrl,
      createdAt: new Date().toISOString()
    };

    stories.unshift(newStory);
    await db.saveCollection('stories', stories);

    res.status(201).json(newStory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- DIRECT MESSAGES ---

app.get('/api/messages/:otherId', authenticateToken, async (req, res) => {
  try {
    const messages = await db.getCollection('messages');
    const chatHistory = messages.filter(m => 
      (m.senderId === req.user.id && m.receiverId === req.params.otherId) ||
      (m.senderId === req.params.otherId && m.receiverId === req.user.id)
    ).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    res.json(chatHistory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/messages', authenticateToken, async (req, res) => {
  const { receiverId, text } = req.body;
  if (!receiverId || !text) {
    return res.status(400).json({ error: 'Receiver and text are required' });
  }

  try {
    const messages = await db.getCollection('messages');
    const newMessage = {
      id: 'm_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      senderId: req.user.id,
      receiverId,
      text,
      createdAt: new Date().toISOString()
    };

    messages.push(newMessage);
    await db.saveCollection('messages', messages);

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- USER OPERATIONS ---

app.get('/api/users', async (req, res) => {
  try {
    const users = await db.getCollection('users');
    const usersWithoutHash = users.map(({ passwordHash: _, ...rest }) => rest);
    res.json(usersWithoutHash);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users/:username', async (req, res) => {
  try {
    const users = await db.getCollection('users');
    const user = users.find(u => u.username.toLowerCase() === req.params.username.toLowerCase());
    
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { passwordHash: _, ...userWithoutHash } = user;
    res.json(userWithoutHash);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users/profile', authenticateToken, async (req, res) => {
  const { fullName, bio, avatar } = req.body;

  try {
    const users = await db.getCollection('users');
    const userIdx = users.findIndex(u => u.id === req.user.id);

    if (userIdx === -1) return res.status(404).json({ error: 'User not found' });

    users[userIdx].fullName = fullName || users[userIdx].fullName;
    users[userIdx].bio = bio !== undefined ? bio : users[userIdx].bio;
    users[userIdx].avatar = avatar || users[userIdx].avatar;

    await db.saveCollection('users', users);
    
    const { passwordHash: _, ...updatedUser } = users[userIdx];
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users/:id/follow', authenticateToken, async (req, res) => {
  if (req.user.id === req.params.id) {
    return res.status(400).json({ error: 'Cannot follow yourself' });
  }

  try {
    const users = await db.getCollection('users');
    const selfIdx = users.findIndex(u => u.id === req.user.id);
    const targetIdx = users.findIndex(u => u.id === req.params.id);

    if (selfIdx === -1 || targetIdx === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    const self = users[selfIdx];
    const target = users[targetIdx];

    if (!self.following) self.following = [];
    if (!target.followers) target.followers = [];

    const followIdx = self.following.indexOf(target.id);
    let followed = false;

    if (followIdx === -1) {
      self.following.push(target.id);
      target.followers.push(self.id);
      followed = true;

      // Add Notification
      const notifications = await db.getCollection('notifications');
      notifications.push({
        id: 'n_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        type: 'follow',
        senderId: req.user.id,
        receiverId: target.id,
        postId: null,
        text: 'started following you.',
        createdAt: new Date().toISOString(),
        read: false
      });
      await db.saveCollection('notifications', notifications);
    } else {
      self.following.splice(followIdx, 1);
      const followerIdx = target.followers.indexOf(self.id);
      if (followerIdx !== -1) target.followers.splice(followerIdx, 1);
    }

    await db.saveCollection('users', users);
    res.json({ following: self.following, followed });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/posts/:id/save', authenticateToken, async (req, res) => {
  try {
    const users = await db.getCollection('users');
    const selfIdx = users.findIndex(u => u.id === req.user.id);

    if (selfIdx === -1) return res.status(404).json({ error: 'User not found' });

    const self = users[selfIdx];
    if (!self.savedPosts) self.savedPosts = [];

    const savedIdx = self.savedPosts.indexOf(req.params.id);
    let saved = false;

    if (savedIdx === -1) {
      self.savedPosts.push(req.params.id);
      saved = true;
    } else {
      self.savedPosts.splice(savedIdx, 1);
    }

    await db.saveCollection('users', users);
    res.json({ savedPosts: self.savedPosts, saved });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- NOTIFICATIONS ---

app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const notifications = await db.getCollection('notifications');
    const users = await db.getCollection('users');

    const myNotifications = notifications
      .filter(n => n.receiverId === req.user.id)
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

    res.json(myNotifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/notifications/read', authenticateToken, async (req, res) => {
  try {
    const notifications = await db.getCollection('notifications');
    const updated = notifications.map(n => {
      if (n.receiverId === req.user.id) {
        return { ...n, read: true };
      }
      return n;
    });

    await db.saveCollection('notifications', updated);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve frontend in production (optional, if we package it)
// Serve Vite dist if available
const buildPath = path.join(__dirname, '../dist');
app.use(express.static(buildPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
