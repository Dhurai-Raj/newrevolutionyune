import { Hono } from 'hono';
import { sign, verify } from 'hono/jwt';
import { Env, User, Track } from './types';
import { generateLicenseId, generateUUID } from './crypto';

const downloads = new Hono<{ Bindings: Env }>();

// Helper to get user from Auth header
async function getUser(c: any): Promise<User | null> {
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

// POST /request - Check download eligibility and generate token
downloads.post('/request', async (c) => {
  const user = await getUser(c);
  if (!user) {
    return c.json({ error: 'Authentication required to download tracks.' }, 401);
  }

  const { trackId, buyerName, buyerEmail } = await c.req.json();
  if (!trackId) {
    return c.json({ error: 'Track ID is required' }, 400);
  }

  try {
    // 1. Fetch the track details
    const track = await c.env.DB.prepare('SELECT * FROM tracks WHERE id = ?')
      .bind(trackId)
      .first<Track>();

    if (!track) {
      return c.json({ error: 'Track not found' }, 404);
    }

    // 2. Check download limit if free user (admins are exempt)
    const isPremium = user.subscription_status === 'active' || user.role === 'admin';
    
    // If track is premium and user is free, block
    if (!track.is_free && !isPremium) {
      return c.json({ 
        error: 'This track is premium. Please upgrade to a subscription to download.', 
        code: 'PREMIUM_REQUIRED' 
      }, 403);
    }

    if (!isPremium) {
      if (user.free_downloads_count >= 20) {
        return c.json({ 
          error: 'You have reached your 20 free downloads limit. Please subscribe to continue.', 
          code: 'LIMIT_REACHED' 
        }, 403);
      }
    }

    // 3. Generate license details
    const licenseId = generateLicenseId();
    const name = buyerName || user.email.split('@')[0];
    const email = buyerEmail || user.email;
    const downloadId = generateUUID();

    // 4. Create download log in database
    await c.env.DB.prepare(
      `INSERT INTO downloads (id, user_id, track_id, license_id, buyer_name, buyer_email, created_at)
       VALUES (?, ?, ?, ?, ?, ?, strftime('%s', 'now'))`
    )
      .bind(downloadId, user.id, track.id, licenseId, name, email)
      .run();

    // 5. Update user download count (if free)
    if (!isPremium) {
      await c.env.DB.prepare(
        'UPDATE users SET free_downloads_count = free_downloads_count + 1 WHERE id = ?'
      )
        .bind(user.id)
        .run();
    }

    // 6. Update track download count
    await c.env.DB.prepare(
      'UPDATE tracks SET downloads_count = downloads_count + 1 WHERE id = ?'
    )
      .bind(track.id)
      .run();

    // 7. Sign a short-lived download token (15 mins) for R2 streaming
    const downloadToken = await sign(
      {
        trackId: track.id,
        userId: user.id,
        licenseId,
        exp: Math.floor(Date.now() / 1000) + 900, // 15 minutes
      },
      c.env.JWT_SECRET
    );

    return c.json({
      success: true,
      downloadUrl: `/api/downloads/file?token=${downloadToken}`,
      licenseId,
      remainingDownloads: isPremium ? 'Unlimited' : 20 - (user.free_downloads_count + 1),
    });
  } catch (err: any) {
    console.error('Download request error:', err);
    return c.json({ error: 'Server or database error during download request.' }, 500);
  }
});

// GET /file - Direct R2 file streaming endpoint validating download token
downloads.get('/file', async (c) => {
  const token = c.req.query('token');
  if (!token) {
    return c.text('Unauthorized: Missing download token', 400);
  }

  try {
    const payload = await verify(token, c.env.JWT_SECRET, 'HS256');
    if (!payload || !payload.trackId) {
      return c.text('Unauthorized: Invalid or expired download token', 401);
    }

    // Get track from DB to retrieve file path
    const track = await c.env.DB.prepare('SELECT title, file_url FROM tracks WHERE id = ?')
      .bind(payload.trackId)
      .first() as any as Track;

    if (!track) {
      return c.text('Track not found', 404);
    }

    // Extract R2 Key
    const urlObj = new URL(track.file_url, 'http://localhost');
    const r2Key = urlObj.searchParams.get('path');
    if (!r2Key) {
      return c.text('Asset path invalid', 500);
    }

    // Get file from R2 Bucket
    const file = await c.env.ROYALTUNE_BUCKET.get(r2Key);
    if (!file) {
      return c.text('Audio file not found in storage', 404);
    }

    // Set download headers
    const sanitizedTitle = track.title.replace(/[^a-zA-Z0-9]/g, '_');
    const extension = r2Key.split('.').pop() || 'mp3';
    
    const headers = new Headers();
    file.writeHttpMetadata(headers);
    headers.set('etag', file.httpEtag);
    headers.set('Content-Disposition', `attachment; filename="${sanitizedTitle}_royaltune.${extension}"`);
    
    return new Response(file.body, {
      headers,
    });
  } catch (err: any) {
    console.error('File stream error:', err);
    return c.text('Internal Server Error', 500);
  }
});

// GET /license/:licenseId - Download license agreement
downloads.get('/license/:licenseId', async (c) => {
  const licenseId = c.req.param('licenseId');

  try {
    const download = await c.env.DB.prepare(
      `SELECT d.*, t.title as track_title, t.is_free 
       FROM downloads d
       JOIN tracks t ON d.track_id = t.id
       WHERE d.license_id = ?`
    )
      .bind(licenseId)
      .first<{
        buyer_name: string;
        buyer_email: string;
        track_title: string;
        track_id: string;
        created_at: number;
        is_free: number;
      }>();

    if (!download) {
      return c.text('License certificate not found.', 404);
    }

    const issueDate = new Date(download.created_at * 1000).toUTCString();
    const licenseType = download.is_free ? 'Standard Personal/Creative-Commons License' : 'Premium Commercial License';
    const licenseTerms = download.is_free 
      ? 'Non-commercial use only. Attribution is required (Credit: New Revolution Tune / Artist).' 
      : 'Unlimited commercial use. Broadcasting, streaming, games, advertising, film sync allowed. Royalty-free, worldwide, perpetual license.';

    const certificate = `======================================================================
NEW REVOLUTION TUNE MUSIC LICENSE CERTIFICATE
======================================================================

License ID:       ${licenseId}
License Type:     ${licenseType}
Licensed Track:   ${download.track_title} (Track ID: ${download.track_id})
Licensee (Buyer): ${download.buyer_name}
Licensee Email:   ${download.buyer_email}
Purchase Date:    ${issueDate}

TERMS OF USE:
${licenseTerms}

This certificate validates that the Licensee has acquired the legal rights to use the designated musical track in accordance with New Revolution Tune's terms and licensing agreement. 

Thank you for choosing New Revolution Tune!
https://newrevolutiontune.com
======================================================================`;

    return new Response(certificate, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="License_${licenseId}.txt"`,
      },
    });
  } catch (err) {
    return c.text('Error retrieving license.', 500);
  }
});

export default downloads;
