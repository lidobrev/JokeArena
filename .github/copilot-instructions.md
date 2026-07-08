---
applyTo: "**/*"
---

# Copilot Instructions - JokeArena

This is a SoftUni AI capstone project: a multi-page web app built with Vite, vanilla JavaScript, HTML, CSS, Bootstrap, and Supabase.

## Core Requirements

- Use vanilla JavaScript only.
- Do not use React, Vue, Angular, TypeScript, or any frontend framework.
- Use Bootstrap for responsive UI.
- Use Supabase for backend services:
  - Database
  - Authentication
  - Storage
  - Row-Level Security policies
- The app must be multi-page, not a single-page popup-based app.
- Keep each main screen in a separate HTML file.
- Use modular JavaScript with ES modules.

## Project Architecture

Prefer this structure:

- `src/components/` - reusable UI components
- `src/pages/` - page-specific JavaScript logic
- `src/services/` - Supabase and data access services
- `src/utils/` - helper functions
- `src/styles/` - custom CSS
- `supabase/` - migrations and Supabase configuration
- `.github/copilot-instructions.md` - AI agent instructions

Avoid large monolithic files. Split UI, business logic, services, and utilities when reasonable.

## App Concept

The project is called JokeArena.

It is a joke-sharing platform where users can:
- register and log in;
- create jokes;
- view jokes;
- edit and delete their own jokes;
- vote or react to jokes;
- upload profile images or joke-related images;
- use an admin panel if they have an admin role.

## Required Screens

Implement at least these pages:

- Home / jokes feed
- Register
- Login
- Add joke
- Joke details
- Edit joke
- Profile
- Admin panel

## Supabase Requirements

Use Supabase Auth for register, login, logout, and session handling.

Use at least 4 database tables, for example:
- `profiles`
- `jokes`
- `joke_votes`
- `joke_comments`
- `user_roles`

Use Row-Level Security policies for server-side access control.

Use Supabase Storage for user-uploaded files, such as avatars or joke images.

All database schema changes must be represented as SQL migration files in the `supabase/migrations/` folder.

## Coding Style

- Keep code simple and readable.
- Use ES modules.
- Prefer small focused functions.
- Validate user input before sending data to Supabase.
- Show clear UI feedback for loading, success, and error states.
- Do not expose Supabase service role keys in frontend code.
- Use only public anon keys in the frontend.
- Avoid unrelated refactoring.
- Keep commits small and meaningful.

## Development Workflow

Follow this loop:

1. Implement a small feature.
2. Run and test locally.
3. Fix issues.
4. Commit the successful change.
5. Push to GitHub.

The GitHub repository should contain a clear commit history with at least 15 commits across at least 3 different days.