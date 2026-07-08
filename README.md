# JokeArena

JokeArena is a multi-page joke sharing app built with Vite, vanilla JavaScript, Bootstrap, and Supabase.

## Technologies

- Vite
- Vanilla JavaScript
- Bootstrap 5
- Supabase Auth
- Supabase Postgres
- Supabase Row Level Security
- Supabase Storage-ready `image_url` handling

## Features

- Public jokes feed on the home page
- Register and login with Supabase Auth
- Session-aware navigation
- Create jokes as pending submissions
- View joke details and ratings
- Edit pending jokes you own
- Profile page with your jokes
- Admin moderation for pending jokes and edit suggestions

## Pages

- `index.html`
- `login.html`
- `register.html`
- `create-joke.html`
- `joke-details.html`
- `edit-joke.html`
- `profile.html`
- `admin.html`

## Supabase Tables

The app uses these tables:

- `profiles`
- `user_roles`
- `joke_categories`
- `jokes`
- `joke_ratings`
- `joke_edit_suggestions`

## Environment Variables

Create a local `.env` file with:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-or-publishable-key
```

Do not commit `.env`. Keep `.env.example` committed as the template.

## Setup

1. Install dependencies.
2. Configure `.env` from `.env.example`.
3. Make sure the Supabase project is running and the migrations are applied.
4. Seed the database with `supabase/seed.sql` if you need demo data.
5. Start the dev server.

## Local Development Commands

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Seed Data

- `supabase/seed.sql` creates starter categories.
- The seed also creates 200 approved English jokes and a small moderation demo set.
- Seed data is idempotent and safe to run again.

## Deployment Notes

- Use only the public Supabase anon/publishable key in the frontend.
- Keep service-role keys out of browser code.
- Apply the SQL migrations before deploying the frontend.
- If you add storage uploads later, keep the frontend using `image_url` safely when no file is uploaded.

## Sample Testing Flow

1. Register a new user.
2. Log in with that user.
3. Create a joke.
4. Log in as an admin and approve the joke.
5. Confirm it appears on the home page.
6. Open joke details and rate it.
7. Open the profile page and verify the submitted joke is listed.
8. Log out and confirm guest navigation is shown.

## Demo Credentials

Demo credentials will be documented later in the README after demo users are created in Supabase.
