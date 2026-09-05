// Version: 4.2.10
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Request logger middleware
app.use((req, res, next) => {
  console.log(`[Request] ${req.method} ${req.url}`);
  next();
});

// Serve static client files from the root directory
app.use(express.static(__dirname));

// Explicit route for the homepage to send index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Route: GET /api/playlist (Serves Layer 1 cached playlist.json)
app.get('/api/playlist', (req, res) => {
  const jsonPath = path.join(__dirname, 'playlist.json');
  if (fs.existsSync(jsonPath)) {
    res.setHeader('Content-Type', 'application/json');
    res.sendFile(jsonPath);
  } else {
    res.status(404).json({ error: 'Playlist cache not found' });
  }
});

function resolveRscReference(combined, ref) {
  if (!ref || typeof ref !== 'string' || !ref.startsWith('$')) return ref;
  
  const key = ref.replace(/^\$L?/, '');
  const searchTarget = `${key}:`;
  const idx = combined.indexOf(searchTarget);

  if (idx !== -1) {
    const afterKey = combined.slice(idx + searchTarget.length);
    if (afterKey.startsWith('T')) {
      const commaIdx = afterKey.indexOf(',');
      if (commaIdx !== -1) {
        const hexLen = afterKey.slice(1, commaIdx);
        const len = parseInt(hexLen, 16);
        if (!isNaN(len) && len > 0) {
          return afterKey.slice(commaIdx + 1, commaIdx + 1 + len);
        }
        return afterKey.slice(commaIdx + 1);
      }
    }
    if (afterKey.startsWith('"')) {
      let endQuote = -1;
      let escaped = false;
      for (let i = 1; i < afterKey.length; i++) {
        if (escaped) { escaped = false; continue; }
        if (afterKey[i] === '\\') { escaped = true; continue; }
        if (afterKey[i] === '"') { endQuote = i; break; }
      }
      if (endQuote !== -1) {
        try {
          return JSON.parse(afterKey.slice(0, endQuote + 1));
        } catch (e) {
          return afterKey.slice(1, endQuote);
        }
      }
    }
    return afterKey.split('\n')[0];
  }
  return ref;
}

/**
 * Route: GET /api/suno
 * Fetches and parses a Suno playlist, song, or profile URL.
 */
app.get('/api/suno', async (req, res) => {
  const tStart = Date.now();
  let targetUrl = req.query.url;

  if (!targetUrl) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  targetUrl = targetUrl.trim();

  // Helper auto-completion for usernames and IDs
  if (targetUrl.startsWith('@')) {
    targetUrl = `https://suno.com/${targetUrl}`;
  } else if (/^[a-f0-9\-]{36}$/i.test(targetUrl)) {
    targetUrl = `https://suno.com/playlist/${targetUrl}`;
  } else if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    if (targetUrl.includes('.') || targetUrl.includes('/')) {
      targetUrl = 'https://' + targetUrl;
    } else {
      targetUrl = `https://suno.com/@${targetUrl}`;
    }
  }

  try {
    const parsedUrl = new URL(targetUrl);
    if (!parsedUrl.hostname.endsWith('suno.com')) {
      return res.status(400).json({ error: 'URL must be a suno.com link' });
    }

    const INVALID_ARTISTS = new Set([
      'studio', 'studio plan', 'upload', 'custom', 'v1', 'v2', 'v3', 'v3.5', 'v4', 'v4.0', 'chirp', 'suno', 'suno ai', 'ai', 'undefined', 'null', 'unknown'
    ]);

    // 1. Fast path for playlists via Studio API
    if (parsedUrl.pathname.startsWith('/playlist/')) {
      const playlistId = parsedUrl.pathname.split('/playlist/')[1].split('?')[0].split('/')[0];
      if (/^[a-f0-9\-]{36}$/i.test(playlistId)) {
        try {
          console.log(`[API] Fetching Suno Studio API for playlist: ${playlistId}`);
          const studioRes = await fetch(`https://studio-api.prod.suno.com/api/playlist/${playlistId}`, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
          });
          if (studioRes.ok) {
            const studioData = await studioRes.json();
            const playlistName = studioData.name || studioData.title || 'Suno Playlist';
            const rawClips = studioData.playlist_clips || [];
            const tracks = [];
            const seenIds = new Set();

            for (const item of rawClips) {
              const clip = item.clip || {};
              const id = clip.id;
              const title = clip.title;
              if (!id || !title || seenIds.has(id)) continue;
              seenIds.add(id);

              let artist = 'Bito';
              if (clip.user_display_name && !INVALID_ARTISTS.has(clip.user_display_name.toLowerCase()) && !/^[uv][0-9]/i.test(clip.user_display_name)) {
                artist = clip.user_display_name;
              } else if (clip.user_handle && !INVALID_ARTISTS.has(clip.user_handle.toLowerCase())) {
                artist = clip.user_handle;
              }
              if (artist.toLowerCase().includes('bito999') || artist.toLowerCase() === 'bito') {
                artist = 'Bito';
              }

              const prompt = (clip.metadata && clip.metadata.prompt) || clip.prompt || '';

              tracks.push({
                id: id,
                title: title,
                artist_name: artist,
                artist: artist,
                image_url: clip.image_large_url || clip.image_url || `https://cdn1.suno.ai/image_${id}.png`,
                audio_url: `https://cdn1.suno.ai/${id}.mp4`,
                duration: clip.duration || 0,
                play_count: clip.play_count || 0,
                upvote_count: clip.upvote_count || 0,
                prompt: prompt,
                description: prompt,
                lyrics: prompt
              });
            }

            console.log(`[API] Studio API parsed in ${Date.now() - tStart}ms. Tracks: ${tracks.length}`);
            return res.json({
              type: 'playlist',
              name: playlistName,
              title: playlistName,
              url: targetUrl,
              playlists: [],
              tracks: tracks
            });
          }
        } catch (studioErr) {
          console.warn(`[API] Studio API failed, falling back to HTML parser: ${studioErr.message}`);
        }
      }
    }

    console.log(`[Proxy] Fetching target URL: ${targetUrl}`);
    const fetchRes = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!fetchRes.ok) {
      return res.status(fetchRes.status).json({ error: `Failed to fetch Suno page: ${fetchRes.statusText}` });
    }

    const html = await fetchRes.text();
    console.log(`[Proxy] Successfully fetched HTML. Length: ${html.length} bytes.`);

    // Determine type
    const isProfile = parsedUrl.pathname.startsWith('/@');
    const isPlaylist = parsedUrl.pathname.startsWith('/playlist/');
    const isSong = parsedUrl.pathname.startsWith('/song/');

    // Parse RSC pushes (self.__next_f.push)
    let pos = 0;
    const pushes = [];

    while (true) {
      const idx = html.indexOf('self.__next_f.push(', pos);
      if (idx === -1) break;

      let braceCount = 0;
      let endIdx = -1;
      let inString = false;
      let quoteChar = null;
      let escaped = false;
      const startIdx = idx + 'self.__next_f.push('.length;

      for (let i = startIdx; i < html.length; i++) {
        const char = html[i];
        if (escaped) {
          escaped = false;
          continue;
        }
        if (char === '\\') {
          escaped = true;
          continue;
        }
        if (inString) {
          if (char === quoteChar) inString = false;
        } else {
          if (char === '"' || char === "'") {
            inString = true;
            quoteChar = char;
          } else if (char === '(' || char === '[') {
            braceCount++;
          } else if (char === ')' || char === ']') {
            braceCount--;
            if (braceCount === 0) {
              endIdx = i;
              break;
            }
          }
        }
      }

      if (endIdx !== -1) {
        const argStr = html.slice(startIdx, endIdx + 1);
        const commaIdx = argStr.indexOf(',');
        if (commaIdx !== -1) {
          let strVal = argStr.slice(commaIdx + 1).trim();
          if (strVal.endsWith(']')) {
            strVal = strVal.slice(0, -1).trim();
          }
          if ((strVal.startsWith('"') && strVal.endsWith('"')) || (strVal.startsWith("'") && strVal.endsWith("'"))) {
            strVal = strVal.slice(1, -1);
            let jsString = '"' + strVal.replace(/(^"|"$)/g, '') + '"';
            try {
              const decoded = JSON.parse(jsString);
              pushes.push(decoded);
            } catch (err) {
              let unescaped = strVal.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
              pushes.push(unescaped);
            }
          }
        }
        pos = endIdx + 1;
      } else {
        pos = idx + 1;
      }
    }

    const combined = pushes.join('');

    // Default artist from page metadata
    let defaultArtist = 'Bito';
    if (isProfile) {
      const match = html.match(/<title>([^|<]+)/);
      if (match && match[1] && !match[1].includes('undefined')) {
        defaultArtist = match[1].replace(/Profile/i, '').trim();
      } else {
        defaultArtist = parsedUrl.pathname.replace('/@', '').trim() || 'Suno Artist';
      }
    }
    if (defaultArtist.toLowerCase().includes('bito999') || defaultArtist.toLowerCase() === 'bito') {
      defaultArtist = 'Bito';
    }

    // Extract tracks
    const trackMap = new Map();
    const idRegex = /"id"\s*:\s*"([a-f0-9\-]{36})"/gi;
    let idMatch;

    while ((idMatch = idRegex.exec(combined)) !== null) {
      const uuid = idMatch[1];

      let startIdx = -1;
      let braceLevel = 0;
      for (let i = idMatch.index; i >= 0; i--) {
        if (combined[i] === '}') braceLevel++;
        else if (combined[i] === '{') {
          if (braceLevel === 0) {
            startIdx = i;
            break;
          } else {
            braceLevel--;
          }
        }
      }

      if (startIdx !== -1) {
        let braceCount = 0;
        let endIdx = -1;
        for (let i = startIdx; i < combined.length; i++) {
          if (combined[i] === '{') braceCount++;
          else if (combined[i] === '}') {
            braceCount--;
            if (braceCount === 0) {
              endIdx = i;
              break;
            }
          }
        }

        if (endIdx !== -1) {
          const objStr = combined.slice(startIdx, endIdx + 1);
          let trackBlock = objStr;
          const idKeyIndex = objStr.indexOf(idMatch[0]);
          const nextIdIdx = objStr.indexOf('"id"', idKeyIndex !== -1 ? idKeyIndex + idMatch[0].length : 10);
          if (nextIdIdx !== -1) {
            trackBlock = objStr.substring(0, nextIdIdx);
          }

          const titleMatch = trackBlock.match(/"title"\s*:\s*"([^"]+)"/i);
          if (titleMatch) {
            const title = titleMatch[1];
            const audio_url = `https://cdn1.suno.ai/${uuid}.mp4`;
            const imageMatch = trackBlock.match(/"image_url"\s*:\s*"([^"]+)"/i);
            const image_url = imageMatch ? imageMatch[1] : `https://cdn1.suno.ai/image_${uuid}.png`;

            let artist_name = defaultArtist;
            const userObjMatch = trackBlock.match(/"user"\s*:\s*\{([^}]+)\}/i);
            if (userObjMatch) {
              const userContent = userObjMatch[1];
              const dispMatch = userContent.match(/"display_name"\s*:\s*"([^"]+)"/i);
              const handMatch = userContent.match(/"handle"\s*:\s*"([^"]+)"/i);
              if (dispMatch && !INVALID_ARTISTS.has(dispMatch[1].toLowerCase()) && !/^[uv][0-9]/i.test(dispMatch[1])) {
                artist_name = dispMatch[1];
              } else if (handMatch && !INVALID_ARTISTS.has(handMatch[1].toLowerCase())) {
                artist_name = handMatch[1];
              }
            }

            if (artist_name === 'Suno Artist' || INVALID_ARTISTS.has(artist_name.toLowerCase()) || /^[uv][0-9]/i.test(artist_name)) {
              artist_name = defaultArtist;
            }
            if (artist_name.toLowerCase().includes('bito999') || artist_name.toLowerCase() === 'bito') {
              artist_name = 'Bito';
            }

            const durationMatch = trackBlock.match(/"duration"\s*:\s*([0-9\.]+)/i);
            const duration = durationMatch ? parseFloat(durationMatch[1]) : 0;

            const playMatch = trackBlock.match(/"play_count"\s*:\s*([0-9]+)/i);
            const play_count = playMatch ? parseInt(playMatch[1], 10) : 0;

            const upvoteMatch = trackBlock.match(/"upvote_count"\s*:\s*([0-9]+)/i);
            const upvote_count = upvoteMatch ? parseInt(upvoteMatch[1], 10) : 0;

            const promptMatch = trackBlock.match(/"prompt"\s*:\s*"([^"]+)"/i);
            let prompt = '';
            if (promptMatch) {
              let rawPrompt = promptMatch[1];
              prompt = resolveRscReference(combined, rawPrompt);
              prompt = prompt
                .replace(/\\n/g, '\n')
                .replace(/\\r/g, '\r')
                .replace(/\\"/g, '"')
                .replace(/\\\\/g, '\\');
            }

            const createdMatch = trackBlock.match(/"created_at"\s*:\s*"([^"]+)"/i);
            const created_at = createdMatch ? createdMatch[1] : '';

            const trackObj = {
              id: uuid,
              title,
              audio_url,
              image_url,
              artist_name,
              artist: artist_name,
              duration,
              play_count,
              upvote_count,
              prompt: prompt,
              description: prompt,
              lyrics: prompt,
              created_at
            };

            if (!trackMap.has(uuid)) {
              trackMap.set(uuid, trackObj);
            } else {
              const existing = trackMap.get(uuid);
              if ((!existing.prompt || existing.prompt.length < prompt.length) && prompt) {
                existing.prompt = prompt;
                existing.description = prompt;
                existing.lyrics = prompt;
              }
              if (existing.artist_name === 'Suno Artist' && artist_name !== 'Suno Artist') {
                existing.artist_name = artist_name;
                existing.artist = artist_name;
              }
              if (!existing.duration && duration) existing.duration = duration;
            }
          }
        }
      }
    }

    const tracks = Array.from(trackMap.values());

    // Extract playlists (if profile page)
    const playlists = [];
    if (isProfile) {
      const seenPlaylists = new Set();
      const rscPlaylistRegex = /playlist_id\\"\s*:\s*\\"([a-f0-9\-]{36})\\"\s*,\s*\\"playlist_name\\"\s*:\s*\\"([^\\"]+)\\"\s*,\s*\\"playlist_image_url\\"\s*:\s*\\"([^\\"]+)\\"/gi;
      let rscMatch;
      while ((rscMatch = rscPlaylistRegex.exec(html)) !== null) {
        const id = rscMatch[1];
        const name = rscMatch[2]
          .replace(/\\u0026/g, '&')
          .replace(/\\n/g, '\n')
          .replace(/\\"/g, '"');
        const image_url = rscMatch[3];
        
        if (!seenPlaylists.has(id)) {
          seenPlaylists.add(id);
          playlists.push({
            id,
            name,
            image_url,
            url: `https://suno.com/playlist/${id}`
          });
        }
      }
    }

    // Name of catalog
    let name = defaultArtist;
    if (isProfile) {
      name = defaultArtist;
    } else if (isPlaylist) {
      const match = html.match(/<title>([^|]+)/);
      if (match) name = match[1].replace('Playlist', '').trim();
    } else if (tracks.length === 1) {
      name = tracks[0].title;
    }

    if (isProfile && tracks.length > 20) {
      tracks.length = 20;
    }

    console.log(`[Proxy] Parsing completed in ${Date.now() - tStart}ms. Tracks: ${tracks.length}, Playlists: ${playlists.length}`);
    return res.json({
      type: isProfile ? 'profile' : isPlaylist ? 'playlist' : (tracks.length === 1 ? 'song' : 'unknown'),
      name,
      url: targetUrl,
      tracks,
      playlists
    });

  } catch (err) {
    console.error(`[Error] Fetching/parsing error:`, err);
    return res.status(500).json({ error: `Internal Server Error: ${err.message}` });
  }
});

/**
 * Route: GET /api/proxy-audio
 */
app.get('/api/proxy-audio', (req, res) => {
  const audioUrl = req.query.url;
  if (!audioUrl) {
    return res.status(400).send('Missing url parameter');
  }
  const https = require('https');
  const url = require('url');

  const parsedUrl = url.parse(audioUrl);
  const hostname = parsedUrl.hostname || '';
  const isSunoDomain = hostname.endsWith('.suno.ai') || hostname.endsWith('.suno.com') || hostname === 'suno.ai' || hostname === 'suno.com';
  
  if (!isSunoDomain) {
    return res.status(403).send('Forbidden: Only Suno domains are permitted to be proxied.');
  }

  const reqHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer': 'https://suno.com/',
    'Origin': 'https://suno.com'
  };

  if (req.headers.range) {
    reqHeaders['Range'] = req.headers.range;
  }

  const options = {
    hostname: parsedUrl.hostname,
    path: parsedUrl.path,
    headers: reqHeaders
  };

  https.get(options, (proxyRes) => {
    if (proxyRes.headers['content-range']) {
      res.setHeader('Content-Range', proxyRes.headers['content-range']);
    }
    if (proxyRes.headers['accept-ranges']) {
      res.setHeader('Accept-Ranges', proxyRes.headers['accept-ranges']);
    }
    if (proxyRes.headers['content-length']) {
      res.setHeader('Content-Length', proxyRes.headers['content-length']);
    }

    res.status(proxyRes.statusCode || 200);
    res.setHeader('Content-Type', proxyRes.headers['content-type'] || 'audio/mpeg');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

    proxyRes.pipe(res);
  }).on('error', (err) => {
    console.error('[Proxy Audio Error] Failed to stream audio:', err.message);
    res.status(500).send(`Internal server error: ${err.message}`);
  });
});

// Start the server
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`[Server] Suno Player backend running on http://localhost:${PORT}`);
  });
}

module.exports = app;
