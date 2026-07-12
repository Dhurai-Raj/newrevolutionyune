import { Hono } from 'hono';
import { Env, Track } from './types';
import { generateUUID } from './crypto';

const tracks = new Hono<{ Bindings: Env }>();

// Auth Helper for Admin Role Verification
async function verifyAdmin(c: any): Promise<boolean> {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
  const token = authHeader.split(' ')[1];

  try {
    const { verify } = await import('hono/jwt');
    const decoded = await verify(token, c.env.JWT_SECRET, 'HS256');
    return decoded && decoded.role === 'admin';
  } catch {
    return false;
  }
}

// GET /tracks - Query, filter, and sort tracks
tracks.get('/', async (c) => {
  const query = c.req.query();
  const search = query.search || '';
  const genre = query.genre || '';
  const mood = query.mood || '';
  const instrument = query.instrument || '';
  const vocals = query.vocals || '';
  const language = query.language || '';
  const is_free = query.is_free; // '1' or '0'
  const is_featured = query.is_featured; // '1'
  const is_trending = query.is_trending; // '1'
  const sort_by = query.sort_by || 'newest'; // 'newest', 'popular', 'bpm'
  
  const limit = parseInt(query.limit || '20', 10);
  const offset = parseInt(query.offset || '0', 10);

  let sql = 'SELECT * FROM tracks WHERE 1=1';
  const params: any[] = [];

  if (search) {
    sql += ' AND (title LIKE ? OR description LIKE ? OR tags LIKE ?)';
    const searchParam = `%${search}%`;
    params.push(searchParam, searchParam, searchParam);
  }
  if (genre) {
    sql += ' AND genre = ?';
    params.push(genre);
  }
  if (mood) {
    sql += ' AND mood = ?';
    params.push(mood);
  }
  if (instrument) {
    sql += ' AND instrument = ?';
    params.push(instrument);
  }
  if (vocals) {
    sql += ' AND vocals = ?';
    params.push(vocals);
  }
  if (language) {
    sql += ' AND language = ?';
    params.push(language);
  }
  if (is_free !== undefined) {
    sql += ' AND is_free = ?';
    params.push(parseInt(is_free, 10));
  }
  if (is_featured !== undefined) {
    sql += ' AND is_featured = ?';
    params.push(parseInt(is_featured, 10));
  }
  if (is_trending !== undefined) {
    sql += ' AND is_trending = ?';
    params.push(parseInt(is_trending, 10));
  }

  // Sorting
  if (sort_by === 'newest') {
    sql += ' ORDER BY created_at DESC';
  } else if (sort_by === 'popular') {
    sql += ' ORDER BY downloads_count DESC';
  } else if (sort_by === 'bpm') {
    sql += ' ORDER BY bpm ASC';
  } else {
    sql += ' ORDER BY created_at DESC';
  }

  sql += ' LIMIT ? OFFSET ?';
  params.push(limit, offset);

  try {
    const list = await c.env.DB.prepare(sql).bind(...params).all<Track>();
    
    // Count query for pagination
    let countSql = 'SELECT COUNT(*) as total FROM tracks WHERE 1=1';
    const countParams = params.slice(0, -2); // Remove limit and offset params
    if (search) countSql += ' AND (title LIKE ? OR description LIKE ? OR tags LIKE ?)';
    if (genre) countSql += ' AND genre = ?';
    if (mood) countSql += ' AND mood = ?';
    if (instrument) countSql += ' AND instrument = ?';
    if (vocals) countSql += ' AND vocals = ?';
    if (language) countSql += ' AND language = ?';
    if (is_free !== undefined) countSql += ' AND is_free = ?';
    if (is_featured !== undefined) countSql += ' AND is_featured = ?';
    if (is_trending !== undefined) countSql += ' AND is_trending = ?';

    const countResult = await c.env.DB.prepare(countSql).bind(...countParams).first<{ total: number }>();

    return c.json({
      tracks: list.results,
      pagination: {
        total: countResult?.total || 0,
        limit,
        offset
      }
    });
  } catch (err: any) {
    console.error('Fetch tracks error:', err);
    return c.json({ error: 'Database error' }, 500);
  }
});

// GET /tracks/search/suggestions - Autocomplete/Instant search suggestions
tracks.get('/search/suggestions', async (c) => {
  const query = c.req.query('q') || '';
  if (query.length < 2) {
    return c.json({ suggestions: [] });
  }

  try {
    const results = await c.env.DB.prepare(
      'SELECT title, id FROM tracks WHERE title LIKE ? OR tags LIKE ? LIMIT 5'
    )
      .bind(`%${query}%`, `%${query}%`)
      .all<{ title: string; id: string }>();

    return c.json({ suggestions: results.results });
  } catch {
    return c.json({ suggestions: [] });
  }
});

// GET /tracks/recommendations - Based on genre/mood
tracks.get('/recommendations', async (c) => {
  const genre = c.req.query('genre') || '';
  const mood = c.req.query('mood') || '';
  const limit = parseInt(c.req.query('limit') || '5', 10);

  try {
    const result = await c.env.DB.prepare(
      'SELECT * FROM tracks WHERE genre = ? OR mood = ? ORDER BY RANDOM() LIMIT ?'
    )
      .bind(genre, mood, limit)
      .all<Track>();

    return c.json({ tracks: result.results });
  } catch {
    return c.json({ tracks: [] });
  }
});

// GET /tracks/:id - Get a track by ID
tracks.get('/:id', async (c) => {
  const id = c.req.param('id');
  try {
    const track = await c.env.DB.prepare('SELECT * FROM tracks WHERE id = ?')
      .bind(id)
      .first<Track>();

    if (!track) {
      return c.json({ error: 'Track not found' }, 404);
    }

    return c.json({ track });
  } catch {
    return c.json({ error: 'Database error' }, 500);
  }
});

// POST /tracks - Admin Upload Track
tracks.post('/', async (c) => {
  const isAdmin = await verifyAdmin(c);
  if (!isAdmin) {
    return c.json({ error: 'Unauthorized. Admin only.' }, 403);
  }

  try {
    const formData = await c.req.parseBody();
    const title = formData.title as string;
    const description = (formData.description as string) || '';
    const genre = formData.genre as string;
    const mood = formData.mood as string;
    const instrument = (formData.instrument as string) || '';
    const bpm = parseInt(formData.bpm as string, 10) || 120;
    const duration = parseInt(formData.duration as string, 10) || 180;
    const vocals = (formData.vocals as string) || 'Instrumental';
    const language = (formData.language as string) || 'English';
    const tags = (formData.tags as string) || '';
    const is_free = formData.is_free === 'true' || formData.is_free === '1' ? 1 : 0;
    const is_featured = formData.is_featured === 'true' || formData.is_featured === '1' ? 1 : 0;
    const is_trending = formData.is_trending === 'true' || formData.is_trending === '1' ? 1 : 0;
    const waveform_data = (formData.waveform_data as string) || '[]';

    const musicFile = formData.musicFile as File;
    const previewFile = formData.previewFile as File;
    const thumbnailFile = formData.thumbnailFile as File;

    if (!title || !genre || !mood || !musicFile || !thumbnailFile) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const trackId = generateUUID();

    // Paths in Cloudflare R2
    const musicPath = `tracks/${trackId}/original-${musicFile.name}`;
    const previewPath = previewFile
      ? `tracks/${trackId}/preview-${previewFile.name}`
      : `tracks/${trackId}/preview-watermarked.mp3`; // Fallback preview path
    const thumbnailPath = `tracks/${trackId}/thumb-${thumbnailFile.name}`;

    // Upload original file to R2
    await c.env.ROYALTUNE_BUCKET.put(musicPath, musicFile.stream(), {
      httpMetadata: { contentType: musicFile.type }
    });

    // Upload preview file to R2
    const actualPreviewFile = previewFile || musicFile; // Fallback to original if no preview blob generated
    await c.env.ROYALTUNE_BUCKET.put(previewPath, actualPreviewFile.stream(), {
      httpMetadata: { contentType: actualPreviewFile.type }
    });

    // Upload thumbnail to R2
    await c.env.ROYALTUNE_BUCKET.put(thumbnailPath, thumbnailFile.stream(), {
      httpMetadata: { contentType: thumbnailFile.type }
    });

    // Generate external URLs (In wrangler / deployment, these will map to Custom R2 Domains or Workers route)
    // For local dev, we fetch through `/api/assets?path=` endpoint to bypass custom domain restriction.
    const file_url = `/api/assets?path=${encodeURIComponent(musicPath)}`;
    const preview_url = `/api/assets?path=${encodeURIComponent(previewPath)}`;
    const thumbnail_url = `/api/assets?path=${encodeURIComponent(thumbnailPath)}`;

    // Insert into database
    await c.env.DB.prepare(
      `INSERT INTO tracks (id, title, description, file_url, preview_url, thumbnail_url, duration, genre, mood, instrument, bpm, vocals, language, tags, is_free, is_featured, is_trending, waveform_data, downloads_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`
    )
      .bind(
        trackId,
        title,
        description,
        file_url,
        preview_url,
        thumbnail_url,
        duration,
        genre,
        mood,
        instrument,
        bpm,
        vocals,
        language,
        tags,
        is_free,
        is_featured,
        is_trending,
        waveform_data
      )
      .run();

    return c.json({ success: true, trackId }, 201);
  } catch (err: any) {
    console.error('Upload track error:', err);
    return c.json({ error: 'Server or upload error: ' + err.message }, 500);
  }
});

// PUT /tracks/:id - Update Track Metadata (Admin only)
tracks.put('/:id', async (c) => {
  const isAdmin = await verifyAdmin(c);
  if (!isAdmin) return c.json({ error: 'Unauthorized' }, 403);

  const id = c.req.param('id');
  const body = await c.req.json();

  const {
    title,
    description,
    genre,
    mood,
    instrument,
    bpm,
    vocals,
    language,
    tags,
    is_free,
    is_featured,
    is_trending
  } = body;

  try {
    await c.env.DB.prepare(
      `UPDATE tracks 
       SET title = ?, description = ?, genre = ?, mood = ?, instrument = ?, bpm = ?, vocals = ?, language = ?, tags = ?, is_free = ?, is_featured = ?, is_trending = ?, updated_at = strftime('%s', 'now')
       WHERE id = ?`
    )
      .bind(
        title,
        description,
        genre,
        mood,
        instrument,
        bpm,
        vocals,
        language,
        tags,
        is_free,
        is_featured,
        is_trending,
        id
      )
      .run();

    return c.json({ success: true });
  } catch (err: any) {
    console.error('Update track error:', err);
    return c.json({ error: 'Database update failed' }, 500);
  }
});

// DELETE /tracks/:id - Delete Track from DB and R2 (Admin only)
tracks.delete('/:id', async (c) => {
  const isAdmin = await verifyAdmin(c);
  if (!isAdmin) return c.json({ error: 'Unauthorized' }, 403);

  const id = c.req.param('id');

  try {
    // Get track to delete files from R2
    const track = await c.env.DB.prepare('SELECT file_url, preview_url, thumbnail_url FROM tracks WHERE id = ?')
      .bind(id)
      .first<Track>();

    if (track) {
      const getR2Key = (url: string) => {
        const urlObj = new URL(url, 'http://localhost');
        return urlObj.searchParams.get('path') || '';
      };

      const musicKey = getR2Key(track.file_url);
      const previewKey = getR2Key(track.preview_url);
      const thumbKey = getR2Key(track.thumbnail_url);

      if (musicKey) await c.env.ROYALTUNE_BUCKET.delete(musicKey);
      if (previewKey) await c.env.ROYALTUNE_BUCKET.delete(previewKey);
      if (thumbKey) await c.env.ROYALTUNE_BUCKET.delete(thumbKey);
    }

    // Delete database records
    await c.env.DB.prepare('DELETE FROM favorites WHERE track_id = ?').bind(id).run();
    await c.env.DB.prepare('DELETE FROM downloads WHERE track_id = ?').bind(id).run();
    await c.env.DB.prepare('DELETE FROM tracks WHERE id = ?').bind(id).run();

    return c.json({ success: true });
  } catch (err: any) {
    console.error('Delete track error:', err);
    return c.json({ error: 'Database deletion failed' }, 500);
  }
});

// DELETE /tracks - Bulk Delete (Admin only)
tracks.post('/bulk-delete', async (c) => {
  const isAdmin = await verifyAdmin(c);
  if (!isAdmin) return c.json({ error: 'Unauthorized' }, 403);

  const { ids } = await c.req.json();
  if (!Array.isArray(ids) || ids.length === 0) {
    return c.json({ error: 'Invalid or empty IDs array' }, 400);
  }

  try {
    for (const id of ids) {
      const track = await c.env.DB.prepare('SELECT file_url, preview_url, thumbnail_url FROM tracks WHERE id = ?')
        .bind(id)
        .first<Track>();

      if (track) {
        const getR2Key = (url: string) => {
          const urlObj = new URL(url, 'http://localhost');
          return urlObj.searchParams.get('path') || '';
        };

        const musicKey = getR2Key(track.file_url);
        const previewKey = getR2Key(track.preview_url);
        const thumbKey = getR2Key(track.thumbnail_url);

        if (musicKey) await c.env.ROYALTUNE_BUCKET.delete(musicKey);
        if (previewKey) await c.env.ROYALTUNE_BUCKET.delete(previewKey);
        if (thumbKey) await c.env.ROYALTUNE_BUCKET.delete(thumbKey);
      }

      await c.env.DB.prepare('DELETE FROM favorites WHERE track_id = ?').bind(id).run();
      await c.env.DB.prepare('DELETE FROM downloads WHERE track_id = ?').bind(id).run();
      await c.env.DB.prepare('DELETE FROM tracks WHERE id = ?').bind(id).run();
    }

    return c.json({ success: true });
  } catch (err: any) {
    console.error('Bulk delete tracks error:', err);
    return c.json({ error: 'Bulk deletion failed' }, 500);
  }
});

export default tracks;
