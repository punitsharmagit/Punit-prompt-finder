import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  avatarUrl?: string;
  createdAt: number;
}

export interface Session {
  token: string;
  userId: string;
  createdAt: number;
  expiresAt: number; // 30 days
}

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: number;
}

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadUsers(): Record<string, StoredUser> {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const content = fs.readFileSync(USERS_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading users file:', err);
  }
  return {};
}

function saveUsers(users: Record<string, StoredUser>) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing users file:', err);
  }
}

function loadSessions(): Record<string, Session> {
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const content = fs.readFileSync(SESSIONS_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading sessions file:', err);
  }
  return {};
}

function saveSessions(sessions: Record<string, Session>) {
  try {
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing sessions file:', err);
  }
}

// In-memory caches synchronized with disk
let usersCache = loadUsers();
let sessionsCache = loadSessions();

// Seed initial default user if not present
const defaultEmail = 'punittrainer9997@gmail.com';
const hasDefaultUser = Object.values(usersCache).some(
  (u) => u.email.toLowerCase() === defaultEmail.toLowerCase()
);

if (!hasDefaultUser) {
  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = crypto
    .pbkdf2Sync('Password123!', salt, 100000, 64, 'sha512')
    .toString('hex');

  const defaultUser: StoredUser = {
    id: 'user_punit_default',
    name: 'Punit Trainer',
    email: defaultEmail,
    passwordHash,
    salt,
    avatarUrl: 'https://lh3.googleusercontent.com/a/ACg8ocL7X8p9W1mQ0rZ',
    createdAt: Date.now(),
  };

  usersCache[defaultUser.id] = defaultUser;
  saveUsers(usersCache);
}

// Password hashing with PBKDF2 (100,000 iterations, 64-byte key)
export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, 'sha512')
    .toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const computedHash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, 'sha512')
    .toString('hex');

  try {
    const a = Buffer.from(computedHash, 'hex');
    const b = Buffer.from(hash, 'hex');
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

// Session Generator
export function createSession(userId: string): string {
  // Clean up expired sessions periodically
  const now = Date.now();
  for (const [token, s] of Object.entries(sessionsCache)) {
    if (s.expiresAt < now) {
      delete sessionsCache[token];
    }
  }

  const token = crypto.randomBytes(32).toString('hex');
  const session: Session = {
    token,
    userId,
    createdAt: now,
    expiresAt: now + 30 * 24 * 60 * 60 * 1000, // 30 days
  };

  sessionsCache[token] = session;
  saveSessions(sessionsCache);
  return token;
}

export function validateSession(token: string): PublicUser | null {
  if (!token) return null;
  const session = sessionsCache[token];
  if (!session) return null;

  if (session.expiresAt < Date.now()) {
    delete sessionsCache[token];
    saveSessions(sessionsCache);
    return null;
  }

  const user = usersCache[session.userId];
  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
  };
}

export function revokeSession(token: string): boolean {
  if (sessionsCache[token]) {
    delete sessionsCache[token];
    saveSessions(sessionsCache);
    return true;
  }
  return false;
}

// User Registration
export function registerUser(
  name: string,
  email: string,
  password: string
): { user: PublicUser; token: string } {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();

  // Validate format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    throw new Error('Please provide a valid email address.');
  }

  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }

  if (!cleanName) {
    throw new Error('Name cannot be empty.');
  }

  // Check uniqueness
  const existing = Object.values(usersCache).find(
    (u) => u.email.toLowerCase() === cleanEmail
  );
  if (existing) {
    throw new Error('An account with this email already exists.');
  }

  const { hash, salt } = hashPassword(password);
  const newId = `user_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

  const newUser: StoredUser = {
    id: newId,
    name: cleanName,
    email: cleanEmail,
    passwordHash: hash,
    salt,
    avatarUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(
      cleanEmail
    )}`,
    createdAt: Date.now(),
  };

  usersCache[newId] = newUser;
  saveUsers(usersCache);

  const token = createSession(newId);

  return {
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      avatarUrl: newUser.avatarUrl,
      createdAt: newUser.createdAt,
    },
    token,
  };
}

// User Login
export function loginUser(
  email: string,
  password: string
): { user: PublicUser; token: string } {
  const cleanEmail = email.trim().toLowerCase();
  const user = Object.values(usersCache).find(
    (u) => u.email.toLowerCase() === cleanEmail
  );

  if (!user) {
    throw new Error('Invalid email or password.');
  }

  const isValid = verifyPassword(password, user.passwordHash, user.salt);
  if (!isValid) {
    throw new Error('Invalid email or password.');
  }

  const token = createSession(user.id);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
    },
    token,
  };
}

// Firebase Google Auth Integration
export function loginOrCreateFirebaseUser(
  firebaseUid: string,
  email: string,
  name?: string,
  avatarUrl?: string
): { user: PublicUser; token: string } {
  const cleanEmail = (email || '').trim().toLowerCase();
  if (!cleanEmail) {
    throw new Error('Valid email required for Firebase authentication.');
  }

  // Find existing user by ID or email
  let user = Object.values(usersCache).find(
    (u) => u.id === firebaseUid || u.email.toLowerCase() === cleanEmail
  );

  if (user) {
    // Update name or avatar if provided from Google
    if (name && name.trim()) user.name = name.trim();
    if (avatarUrl) user.avatarUrl = avatarUrl;
    usersCache[user.id] = user;
    saveUsers(usersCache);
  } else {
    // Create new user for this Firebase profile
    const salt = crypto.randomBytes(16).toString('hex');
    const newUser: StoredUser = {
      id: firebaseUid || `user_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      name: name?.trim() || cleanEmail.split('@')[0],
      email: cleanEmail,
      passwordHash: '',
      salt,
      avatarUrl: avatarUrl || `https://lh3.googleusercontent.com/a/default-user`,
      createdAt: Date.now(),
    };
    usersCache[newUser.id] = newUser;
    saveUsers(usersCache);
    user = newUser;
  }

  const token = createSession(user.id);
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
    },
    token,
  };
}

// Profile update
export function updateUserProfile(
  userId: string,
  updates: { name?: string; avatarUrl?: string }
): PublicUser {
  const user = usersCache[userId];
  if (!user) {
    throw new Error('User not found.');
  }

  if (updates.name && updates.name.trim()) {
    user.name = updates.name.trim();
  }
  if (updates.avatarUrl !== undefined) {
    user.avatarUrl = updates.avatarUrl;
  }

  usersCache[userId] = user;
  saveUsers(usersCache);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
  };
}

export function deleteUserAccount(userId: string): boolean {
  if (usersCache[userId]) {
    delete usersCache[userId];
    saveUsers(usersCache);

    // Revoke all sessions for this user
    for (const [token, s] of Object.entries(sessionsCache)) {
      if (s.userId === userId) {
        delete sessionsCache[token];
      }
    }
    saveSessions(sessionsCache);
    return true;
  }
  return false;
}

