# Quickstart: Spotify Album Showcase

## Prerequisites

- Node.js 18+ and npm
- A Spotify account (free or premium)

---

## Step 1: Create a Spotify App

1. Go to [developer.spotify.com](https://developer.spotify.com) and log in
2. Click **Create app**
3. Fill in any name and description (e.g. "Wedding Site")
4. Set the redirect URI to `http://localhost:4321` (required by Spotify but not used by this feature)
5. Click **Save**
6. On your app's dashboard, click **Settings** and copy the **Client ID** and **Client Secret**

---

## Step 2: Add Environment Variables

Create a `.env` file in the project root (it's already in `.gitignore`):

```env
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
```

---

## Step 3: Run the Dev Server

```bash
npm run dev
```

Navigate to `http://localhost:4321` and scroll to the **Music** section. You should see the album grid instead of "Coming Soon."

---

## Step 4: Vercel Production Setup

In the [Vercel dashboard](https://vercel.com):

1. Select your project → **Settings** → **Environment Variables**
2. Add `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` with **Production** scope
3. Redeploy (or push a new commit) to pick up the new variables

---

## Troubleshooting

| Symptom | Likely cause | Fix |
| :--- | :--- | :--- |
| Album grid shows "Could not load playlist" | Missing or invalid Spotify credentials | Check `.env` values match the Spotify dashboard |
| Empty album grid | Playlist is private | Ensure the playlist visibility is set to **Public** on Spotify |
| Build error about `fetch` | Node version too old | Ensure Node 18+ is being used (`node -v`) |
