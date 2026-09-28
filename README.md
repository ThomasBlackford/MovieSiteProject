# Reelnotes 🎬

A little prototype movie site. You can rate movies, write posts about them, argue in the comments, follow people, and keep a watchlist.

It's early, so a few things are faked for now (see [What's fake right now](#whats-fake-right-now)).

## Getting it running

You'll need Node 20+ (22 LTS is the safest bet).

```bash
npm install
cp .env.example .env
npm run db:reset
npm run dev
```

Then open http://localhost:3000.

`npm run db:reset` wipes the database and fills it with demo data: 8 made-up movies, 4 users, and some ratings, posts and comments. Run it any time you want a clean slate.

## What's on the site

**Discover (`/`)**: the home page. It has a featured movie at the top, a grid of trending movies (the ones with the most ratings), and a feed of what people you follow have rated or written.

**Movie pages (`/movies/[id]`)**: everything about one movie.
- Rate it from ½ to 5 stars. Hover over a star: its left half gives a half star, its right half a full star. You can add a short review too.
- See the average rating and a small bar chart of how everyone rated it.
- Add it to (or remove it from) your watchlist.
- Read reviews and ♡ the ones you like.
- Comment, and reply to other comments. Replies nest into threads.

**Journal (`/journal`)**: blog posts from everyone. Hit "Write a post" to publish your own. Leave a blank line between paragraphs. Posts can be liked and commented on just like movies.

**Profiles (`/u/[username]`)**: someone's stats, watchlist, custom lists, recent ratings and posts. On other people's profiles there's a Follow button. Following someone puts their activity in your home feed.

## How it's built

- **Next.js 16 (App Router) + TypeScript**: the pages are server components that talk to the database directly.
- **Server Actions**: all the "do something" buttons (rate, comment, like, follow, watchlist, post) live in one file, `src/app/actions.ts`.
- **Prisma + SQLite**: the database. The schema is in `prisma/schema.prisma` and the demo data is in `prisma/seed.ts`.
- **Tailwind v4**: styling. The design tokens are in `src/app/globals.css`.

A few things that might not be obvious:
- Ratings are stored as **1–10**, not 0.5–5, so half stars stay whole numbers (7 = 3.5 stars).
- A comment belongs to either a movie *or* a post. A comment with a `parentId` is a reply.
- Your watchlist is just a `List` with `isWatchlist = true`.

## Where stuff lives

```
prisma/
  schema.prisma      database models
  seed.ts            demo data
src/
  app/
    page.tsx         home / discover
    actions.ts       all the server actions
    movies/[id]/     movie page
    journal/         post list, new post, single post
    u/[username]/    profiles
    globals.css      design tokens + shared styles
  components/
    nav.tsx          top bar
    ui.tsx           Avatar, Stars, Poster, MovieCard, etc.
    star-input.tsx   the half-star rating picker
    comments.tsx     threaded comments
  lib/
    db.ts            Prisma client
    session.ts       "who am I" (faked for now)
    format.ts        star/time/runtime helpers
```

## The look

The whole site sticks to a few rules:
- A soft **6-step white gradient** as the background (`--g1` through `--g6`)
- **No rounded corners**, anywhere, ever
- Near-black (`#0b0b0c`) for text, buttons and stars. No other accent colors.
- Thin 1px gray borders (`#d0d4da`) instead of shadows
- Every hover or animation takes **0.3s**

## What's fake right now

- **No login.** Everyone is the `demo` user. Real sign-in (Auth.js) will go in `src/lib/session.ts`.
- **No real movies.** The movies are made up and the posters are gradient placeholders. The plan is to pull real ones from TMDB.
- **SQLite instead of Postgres.** Fine for playing around. To switch, change `provider` to `"postgresql"` in the schema and point `DATABASE_URL` at a Postgres database (e.g. Neon).

## Handy commands

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run db:reset` | Wipe and reseed the database |
| `npx prisma studio` | Browse the database in your browser |
| `npm run build` | Production build (good for catching type errors) |
| `npm run lint` | Lint |
