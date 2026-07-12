import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { verify } from 'hono/jwt';
import { Env, User, Track } from './types';
import auth from './auth';
import tracks from './tracks';
import downloads from './downloads';
import stripeRouter from './stripe';

const app = new Hono<{ Bindings: Env }>();

// Enable CORS
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length', 'Content-Disposition'],
  maxAge: 600,
}));

// Route Middlewares
app.route('/api/auth', auth);
app.route('/api/tracks', tracks);
app.route('/api/downloads', downloads);
app.route('/api/stripe', stripeRouter);

// Local Asset Streaming Endpoint (Crucial for Local Development without Custom R2 Domains)
app.get('/api/assets', async (c) => {
  const path = c.req.query('path');
  if (!path) {
    return c.text('Path parameter is required', 400);
  }

  try {
    const object = await c.env.ROYALTUNE_BUCKET.get(path);
    if (!object) {
      return c.text('Asset not found', 404);
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year

    return new Response(object.body, {
      headers,
    });
  } catch (err: any) {
    return c.text('Error retrieving asset: ' + err.message, 500);
  }
});

// Middleware to get user profile from authorization header
async function optionalAuth(c: any): Promise<User | null> {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  try {
    const decoded = await verify(token, c.env.JWT_SECRET, 'HS256');
    if (!decoded || !decoded.id) return null;
    const user = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?')
      .bind(decoded.id)
      .first() as any as User;
    return user || null;
  } catch {
    return null;
  }
}

// User Dashboard Stats & History
app.get('/api/user/dashboard', async (c) => {
  const user = await optionalAuth(c);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    // 1. Fetch user downloads
    const downloadsResult = await c.env.DB.prepare(
      `SELECT d.id as download_id, d.license_id, d.created_at as download_date, d.buyer_name, d.buyer_email,
              t.id as track_id, t.title, t.genre, t.duration, t.thumbnail_url, t.preview_url, t.is_free
       FROM downloads d
       JOIN tracks t ON d.track_id = t.id
       WHERE d.user_id = ?
       ORDER BY d.created_at DESC`
    )
      .bind(user.id)
      .all();

    // 2. Fetch user favorites
    const favoritesResult = await c.env.DB.prepare(
      `SELECT t.*
       FROM favorites f
       JOIN tracks t ON f.track_id = t.id
       WHERE f.user_id = ?
       ORDER BY f.created_at DESC`
    )
      .bind(user.id)
      .all();

    return c.json({
      profile: {
        id: user.id,
        email: user.email,
        role: user.role,
        subscription_status: user.subscription_status,
        current_period_end: user.current_period_end,
        free_downloads_count: user.free_downloads_count,
        remaining_free_downloads: Math.max(0, 20 - user.free_downloads_count),
      },
      downloads: downloadsResult.results,
      favorites: favoritesResult.results,
    });
  } catch (err: any) {
    return c.json({ error: 'Database query failed: ' + err.message }, 500);
  }
});

// Favorites Toggle
app.post('/api/favorites/toggle', async (c) => {
  const user = await optionalAuth(c);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const { trackId } = await c.req.json();
  if (!trackId) {
    return c.json({ error: 'Track ID is required' }, 400);
  }

  try {
    const existing = await c.env.DB.prepare(
      'SELECT 1 FROM favorites WHERE user_id = ? AND track_id = ?'
    )
      .bind(user.id, trackId)
      .first();

    if (existing) {
      await c.env.DB.prepare('DELETE FROM favorites WHERE user_id = ? AND track_id = ?')
        .bind(user.id, trackId)
        .run();
      return c.json({ favorited: false });
    } else {
      await c.env.DB.prepare('INSERT INTO favorites (user_id, track_id) VALUES (?, ?)')
        .bind(user.id, trackId)
        .run();
      return c.json({ favorited: true });
    }
  } catch (err: any) {
    return c.json({ error: 'Database error' }, 500);
  }
});

// GET list of user's favorited track IDs
app.get('/api/favorites/ids', async (c) => {
  const user = await optionalAuth(c);
  if (!user) return c.json({ ids: [] });

  try {
    const list = await c.env.DB.prepare('SELECT track_id FROM favorites WHERE user_id = ?')
      .bind(user.id)
      .all<{ track_id: string }>();
    return c.json({ ids: list.results.map(row => row.track_id) });
  } catch {
    return c.json({ ids: [] });
  }
});

// GET /api/admin/stats - Admin Dashboard Statistics
app.get('/api/admin/stats', async (c) => {
  const user = await optionalAuth(c);
  if (!user || user.role !== 'admin') {
    return c.json({ error: 'Unauthorized: Admin only' }, 403);
  }

  try {
    // 1. Total Users
    const usersCount = await c.env.DB.prepare('SELECT COUNT(*) as total FROM users').first<{ total: number }>();
    
    // 2. Total Subscribers (Active plan)
    const subscribersCount = await c.env.DB.prepare("SELECT COUNT(*) as total FROM users WHERE subscription_status = 'active'").first<{ total: number }>();

    // 3. Total Downloads
    const downloadsCount = await c.env.DB.prepare('SELECT COUNT(*) as total FROM downloads').first<{ total: number }>();

    // 4. Latest 5 Uploads
    const latestUploads = await c.env.DB.prepare('SELECT * FROM tracks ORDER BY created_at DESC LIMIT 5').all<Track>();

    // 5. Calculate Revenue (Mock calculation: Subscribers * $9.99 for simplicity)
    const mockRevenue = (subscribersCount?.total || 0) * 9.99;

    // 6. R2 Storage Estimation (Listing files in bucket)
    let storageUsed = 0;
    try {
      const objectsList = await c.env.ROYALTUNE_BUCKET.list({ limit: 100 });
      for (const obj of objectsList.objects) {
        storageUsed += obj.size;
      }
    } catch (e) {
      console.error('R2 list failed:', e);
      storageUsed = 125 * 1024 * 1024; // Mock 125 MB fallback
    }

    return c.json({
      totalUsers: usersCount?.total || 0,
      totalSubscribers: subscribersCount?.total || 0,
      totalDownloads: downloadsCount?.total || 0,
      revenue: mockRevenue,
      storageBytes: storageUsed,
      latestUploads: latestUploads.results,
    });
  } catch (err: any) {
    return c.json({ error: 'Database or storage error: ' + err.message }, 500);
  }
});

// App Health Check
app.get('/health', (c) => c.text('RoyalTune API is healthy!'));

export default app;
