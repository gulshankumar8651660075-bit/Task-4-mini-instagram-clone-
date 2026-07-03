import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'db.json');

const DEFAULT_USERS = [
  {
    id: 'user_1',
    username: 'john.doe',
    fullName: 'John Doe',
    email: 'john@example.com',
    passwordHash: '$2a$10$U27nL.qXg2D81x1w28mN8u1bS8P.r3W2l3z9/4Wf85q4tXW4xWq2u', // bcrypt hash for 'password123'
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
    passwordHash: '$2a$10$U27nL.qXg2D81x1w28mN8u1bS8P.r3W2l3z9/4Wf85q4tXW4xWq2u',
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
    passwordHash: '$2a$10$U27nL.qXg2D81x1w28mN8u1bS8P.r3W2l3z9/4Wf85q4tXW4xWq2u',
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
    passwordHash: '$2a$10$U27nL.qXg2D81x1w28mN8u1bS8P.r3W2l3z9/4Wf85q4tXW4xWq2u',
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
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
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
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    likes: ['user_2', 'user_4'],
    comments: [
      { id: 'c_3', userId: 'user_2', text: 'Get some sleep! 😂', createdAt: new Date(Date.now() - 3600000 * 4.5).toISOString() },
      { id: 'c_4', userId: 'user_4', text: 'Looks clean, what theme is this?', createdAt: new Date(Date.now() - 3600000 * 4).toISOString() }
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
    createdAt: new Date().toISOString()
  }
];

const DEFAULT_MESSAGES = [
  { id: 'm_1', senderId: 'user_2', receiverId: 'user_1', text: 'Hey John, loved your recent post!', createdAt: new Date(Date.now() - 3600000 * 3).toISOString() }
];

const DEFAULT_NOTIFICATIONS = [
  { id: 'n_1', type: 'like', senderId: 'user_2', receiverId: 'user_1', postId: 'post_2', text: 'liked your post.', createdAt: new Date(Date.now() - 3600000 * 1.5).toISOString(), read: false }
];

const INITIAL_DATA = {
  users: DEFAULT_USERS,
  posts: DEFAULT_POSTS,
  stories: DEFAULT_STORIES,
  messages: DEFAULT_MESSAGES,
  notifications: DEFAULT_NOTIFICATIONS
};

// Custom JSON Database wrapper
class JSONDatabase {
  constructor() {
    this.data = null;
  }

  async read() {
    if (this.data) return this.data;
    try {
      const content = await fs.readFile(DB_FILE, 'utf-8');
      this.data = JSON.parse(content);
      return this.data;
    } catch (error) {
      // If it doesn't exist, initialize
      await this.write(INITIAL_DATA);
      return INITIAL_DATA;
    }
  }

  async write(newData) {
    this.data = newData;
    await fs.writeFile(DB_FILE, JSON.stringify(newData, null, 2), 'utf-8');
  }

  async getCollection(name) {
    const data = await this.read();
    return data[name] || [];
  }

  async saveCollection(name, items) {
    const data = await this.read();
    data[name] = items;
    await this.write(data);
  }
}

const db = new JSONDatabase();
export default db;
