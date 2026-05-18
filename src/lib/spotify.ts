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
  track: { album: SpotifyAlbumRaw } | null;
}

interface SpotifyPlaylistTracksPage {
  items: SpotifyTrackItem[];
  next: string | null;
}

export async function getAccessToken(): Promise<string> {
  const clientId = import.meta.env.SPOTIFY_CLIENT_ID;
  const clientSecret = import.meta.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET must be set');
  }

  const credentials = btoa(`${clientId}:${clientSecret}`);
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw new Error(`Spotify token request failed: ${response.status}`);
  }

  const data: SpotifyTokenResponse = await response.json();
  return data.access_token;
}

export async function getPlaylistAlbums(playlistId: string, token: string): Promise<Album[]> {
  const seen = new Map<string, Album>();
  let url: string | null =
    `https://api.spotify.com/v1/playlists/${playlistId}/tracks` +
    `?fields=items(track(album(id,name,artists(name),images))),next&limit=100`;

  while (url !== null) {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error(`Spotify playlist fetch failed: ${response.status}`);
    }

    const page: SpotifyPlaylistTracksPage = await response.json();

    for (const item of page.items) {
      if (!item.track) continue;
      const raw = item.track.album;
      if (seen.has(raw.id)) continue;
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
