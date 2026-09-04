const fs = require('fs');
const path = require('path');

// Default target playlist: Bito's Official Suno Playlist
const PLAYLIST_ID = process.env.SUNO_PLAYLIST_ID || 'fc5d3e91-f654-470b-9522-95743e595374';
const OUTPUT_FILE = path.join(__dirname, '..', 'playlist.json');

async function syncPlaylist() {
  console.log(`[Sync] Fetching playlist data for ID: ${PLAYLIST_ID}...`);
  const url = `https://studio-api.prod.suno.com/api/playlist/${PLAYLIST_ID}`;

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    const playlistName = data.name || data.title || 'Suno Playlist';
    const rawClips = data.playlist_clips || [];
    
    console.log(`[Sync] Found "${playlistName}" with ${rawClips.length} clips.`);

    const tracks = [];
    const seenIds = new Set();

    for (const item of rawClips) {
      const clip = item.clip || {};
      const id = clip.id;
      const title = clip.title;

      if (!id || !title || seenIds.has(id)) continue;
      seenIds.add(id);

      const image = clip.image_large_url || clip.image_url || `https://cdn1.suno.ai/image_${id}.png`;
      const stream = `https://cdn1.suno.ai/${id}.mp4`;
      
      let artist = 'Bito';
      if (clip.user_display_name && !/^[uv][0-9]/i.test(clip.user_display_name)) {
        artist = clip.user_display_name;
      } else if (clip.user_handle) {
        artist = clip.user_handle;
      }
      if (artist.toLowerCase().includes('bito999') || artist.toLowerCase() === 'bito') {
        artist = 'Bito';
      }

      tracks.push({
        id: id,
        title: title,
        artist: artist,
        image_url: image,
        audio_url: stream,
        duration: clip.duration || 0,
        play_count: clip.play_count || 0,
        upvote_count: clip.upvote_count || 0,
        prompt: (clip.metadata && clip.metadata.prompt) || ''
      });
    }

    const result = {
      playlist_id: PLAYLIST_ID,
      playlist_name: playlistName,
      last_updated: new Date().toISOString(),
      track_count: tracks.length,
      tracks: tracks
    };

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2), 'utf8');
    console.log(`[Sync] Successfully wrote ${tracks.length} tracks to ${OUTPUT_FILE}`);

  } catch (err) {
    console.error(`[Sync] Error syncing playlist: ${err.message}`);
    process.exit(1);
  }
}

syncPlaylist();
