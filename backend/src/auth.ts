import { Hono } from 'hono';
import { sign } from 'hono/jwt';
import { Env, User } from './types';
import { hashPassword, verifyPassword, generateUUID } from './crypto';

const auth = new Hono<{ Bindings: Env }>();

// Signup endpoint
auth.post('/signup', async (c) => {
  const { email, password } = await c.req.json();

  if (!email || !password) {
    return c.json({ error: 'Email and password are required' }, 400);
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return c.json({ error: 'Invalid email format' }, 400);
  }

  if (password.length < 6) {
    return c.json({ error: 'Password must be at least 6 characters' }, 400);
  }

  try {
    // Check if user already exists
    const existingUser = await c.env.DB.prepare(
      'SELECT id FROM users WHERE email = ?'
    )
      .bind(email.toLowerCase())
      .first();

    if (existingUser) {
      return c.json({ error: 'User with this email already exists' }, 409);
    }

    const userId = generateUUID();
    const passwordHash = await hashPassword(password);

    await c.env.DB.prepare(
      'INSERT INTO users (id, email, password_hash, role, subscription_status, free_downloads_count) VALUES (?, ?, ?, ?, ?, ?)'
    )
      .bind(userId, email.toLowerCase(), passwordHash, 'user', 'free', 0)
      .run();

    // Create JWT Token
    const token = await sign(
      {
        id: userId,
        email: email.toLowerCase(),
        role: 'user',
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
      },
      c.env.JWT_SECRET
    );

    return c.json({
      token,
      user: {
        id: userId,
        email: email.toLowerCase(),
        role: 'user',
        subscription_status: 'free',
        free_downloads_count: 0,
      },
    }, 201);
  } catch (err: any) {
    console.error('Signup error:', err);
    return c.json({ error: 'Database or server error' }, 500);
  }
});

// Login endpoint
auth.post('/login', async (c) => {
  const { email, password } = await c.req.json();

  if (!email || !password) {
    return c.json({ error: 'Email and password are required' }, 400);
  }

  try {
    const user = await c.env.DB.prepare(
      'SELECT * FROM users WHERE email = ?'
    )
      .bind(email.toLowerCase())
      .first<User>();

    if (!user) {
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    // Create JWT Token
    const token = await sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
      },
      c.env.JWT_SECRET
    );

    return c.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        subscription_status: user.subscription_status,
        free_downloads_count: user.free_downloads_count,
      },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return c.json({ error: 'Database or server error' }, 500);
  }
});

// Google Login Mock / Integration endpoint
auth.post('/google-login', async (c) => {
  const { credential } = await c.req.json();

  if (!credential) {
    return c.json({ error: 'Google credential is required' }, 400);
  }

  try {
    // In production, you would fetch and verify Google id_token:
    // const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
    // const payload = await res.json();
    // For this implementation, we will decode the credential (JWT payload) if valid,
    // or simulate a successful verification.
    
    // Split JWT and parse payload
    const parts = credential.split('.');
    if (parts.length !== 3) {
      return c.json({ error: 'Invalid Google credential format' }, 400);
    }
    
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    const googleUser = JSON.parse(jsonPayload);
    
    if (!googleUser.email || !googleUser.sub) {
      return c.json({ error: 'Invalid Google token payload' }, 400);
    }

    const email = googleUser.email.toLowerCase();
    
    // Check if user exists
    let user = await c.env.DB.prepare(
      'SELECT * FROM users WHERE email = ?'
    )
      .bind(email)
      .first<User>();

    if (!user) {
      // Create user
      const userId = generateUUID();
      const randomPasswordHash = await hashPassword(generateUUID()); // Random hash since they use Google auth
      
      await c.env.DB.prepare(
        'INSERT INTO users (id, email, password_hash, role, subscription_status, free_downloads_count) VALUES (?, ?, ?, ?, ?, ?)'
      )
        .bind(userId, email, randomPasswordHash, 'user', 'free', 0)
        .run();

      user = {
        id: userId,
        email,
        password_hash: randomPasswordHash,
        role: 'user',
        stripe_customer_id: null,
        stripe_subscription_id: null,
        subscription_status: 'free',
        current_period_end: null,
        free_downloads_count: 0,
        created_at: Math.floor(Date.now() / 1000),
        updated_at: Math.floor(Date.now() / 1000)
      };
    }

    // Sign RoyalTune JWT token
    const token = await sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
      },
      c.env.JWT_SECRET
    );

    return c.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        subscription_status: user.subscription_status,
        free_downloads_count: user.free_downloads_count,
      },
    });
  } catch (err: any) {
    console.error('Google auth error:', err);
    return c.json({ error: 'Google login failed' }, 500);
  }
});

export default auth;
