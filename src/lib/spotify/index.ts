interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface SpotifyImage {
  url: string;
  height: number | null;
  width: number | null;
}

interface SpotifyArtist {
  name: string;
}

interface SpotifyPlaylistItem {
  item: {
    id: string;
    album: SpotifyAlbumRaw | null;
    artists: SpotifyArtist[];
    external_urls: {
      spotify: string | null;
    };
    name: string;
  } | null;
}

interface SpotifyPlaylistItemsPage {
  items: SpotifyPlaylistItem[];
  next: string | null;
}

interface SpotifyAlbumRaw {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  images: SpotifyImage[];
}

export interface Track {
  id: string;
  artists: string;
  imageUrl: string;
  songTitle: string;
  songUrl: string;
}

async function fetchWithRateLimit(url: string, options: RequestInit): Promise<Response> {
  const MAX_RETRIES = 3;
  for (let attempt = 0; ; attempt++) {
    const response = await fetch(url, options);
    if (response.status !== 429 || attempt >= MAX_RETRIES) return response;
    const retryAfter = parseInt(response.headers.get('Retry-After') ?? '1', 10);
    await new Promise((resolve) =>
      setTimeout(resolve, Math.min(retryAfter * 1000 * 2 ** attempt, 30_000))
    );
  }
}

export async function getAccessToken(): Promise<string> {
  const clientId = import.meta.env.SPOTIFY_CLIENT_ID;
  const clientSecret = import.meta.env.SPOTIFY_CLIENT_SECRET;
  const refreshToken = import.meta.env.SPOTIFY_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      'SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, and SPOTIFY_REFRESH_TOKEN must be set'
    );
  }

  const credentials = btoa(`${clientId}:${clientSecret}`);
  const response = await fetchWithRateLimit('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `grant_type=refresh_token&refresh_token=${encodeURIComponent(refreshToken)}`,
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Spotify token request failed: ${response.status} ${body}`.trimEnd());
  }

  const data: SpotifyTokenResponse = await response.json();
  return data.access_token;
}

export async function getPlaylistItems(playlistId: string, token: string): Promise<Track[]> {
  const data = new Map<string, Track>();
  let url: string | null = `https://api.spotify.com/v1/playlists/${playlistId}/items?limit=100`;

  while (url !== null) {
    const response = await fetchWithRateLimit(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`Spotify playlist fetch failed: ${response.status} ${body}`.trimEnd());
    }

    const page: SpotifyPlaylistItemsPage = await response.json();

    for (const entry of page.items) {
      if (!entry.item) continue;

      const { id, album, artists, external_urls, name } = entry.item;

      if (data.has(id)) continue;

      data.set(id, {
        id,
        artists: artists.map((a) => a.name).join(', '),
        imageUrl: album?.images[1]?.url ?? album?.images[0]?.url ?? '',
        songTitle: name,
        songUrl: external_urls.spotify ?? '',
      });
    }

    url = page.next;
  }

  return Array.from(data.values());
}
