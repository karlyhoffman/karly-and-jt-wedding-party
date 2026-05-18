// TEMP: EXAMPLE TRACK RESPONSE FOR REFERENCE (TODO: UPDATE TYPE DEFINITIONS)

/*
{
  item: {
    is_playable: true,
    explicit: false,
    type: 'track',
    episode: false,
    track: true,
    album: {
      is_playable: true,
      type: 'album',
      album_type: 'album',
      href: 'https://api.spotify.com/v1/albums/18C8u024uQ0i9LO9oYk6CP',
      id: '18C8u024uQ0i9LO9oYk6CP',
      images: [Array],
      name: 'Mondo Tempo',
      release_date: '2023-07-12',
      release_date_precision: 'day',
      uri: 'spotify:album:18C8u024uQ0i9LO9oYk6CP',
      artists: [Array],
      external_urls: [Object],
      total_tracks: 8
    },
    artists: [ [Object], [Object] ],
    disc_number: 1,
    track_number: 2,
    duration_ms: 309411,
    external_urls: {
      spotify: 'https://open.spotify.com/track/1ksm7bu6QLRnmtfvde3isa'
    },
    id: '1ksm7bu6QLRnmtfvde3isa',
    name: 'In a Moment Divine',
    uri: 'spotify:track:1ksm7bu6QLRnmtfvde3isa',
    is_local: false
  },
  ...
}
*/

export interface Album {
  id: string;
  name: string;
  artists: string;
  imageUrl: string;
}

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

interface SpotifyAlbumRaw {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  images: SpotifyImage[];
}

interface SpotifyTrackItem {
  item: { album: SpotifyAlbumRaw | null } | null;
}

interface SpotifyPlaylistItemsPage {
  items: SpotifyTrackItem[];
  next: string | null;
}

async function fetchWithRateLimit(url: string, options: RequestInit): Promise<Response> {
  const MAX_RETRIES = 3;
  for (let attempt = 0; ; attempt++) {
    const response = await fetch(url, options);
    if (response.status !== 429 || attempt >= MAX_RETRIES) return response;
    const retryAfter = parseInt(response.headers.get('Retry-After') ?? '1', 10);
    await new Promise((resolve) => setTimeout(resolve, Math.min(retryAfter * 1000 * 2 ** attempt, 30_000)));
  }
}

export async function getAccessToken(): Promise<string> {
  const clientId = import.meta.env.SPOTIFY_CLIENT_ID;
  const clientSecret = import.meta.env.SPOTIFY_CLIENT_SECRET;
  const refreshToken = import.meta.env.SPOTIFY_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, and SPOTIFY_REFRESH_TOKEN must be set');
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

export async function getPlaylistAlbums(playlistId: string, token: string): Promise<Album[]> {
  const seen = new Map<string, Album>();
  let url: string | null =
    `https://api.spotify.com/v1/playlists/${playlistId}/items?limit=100`;

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

      const raw = entry.item.album;

      if (!raw || seen.has(raw.id)) continue;

      seen.set(raw.id, {
        id: raw.id,
        name: raw.name,
        artists: raw.artists.map((a) => a.name).join(', '),
        imageUrl: raw.images[1]?.url ?? raw.images[0]?.url ?? '',
      });
    }

    url = page.next;
  }

  return Array.from(seen.values());
}
