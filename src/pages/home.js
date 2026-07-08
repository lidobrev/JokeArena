import { renderPlaceholderPage } from '../utils/page-layout.js'

document.querySelector('#app').innerHTML = renderPlaceholderPage({
  pageTitle: 'JokeArena Home',
  eyebrow: 'Welcome',
  lead:
    'A clean multi-page starter for the JokeArena capstone, ready for future features without the default Vite demo.',
  noteTitle: 'Current milestone',
  noteText:
    'This page only establishes the app shell, shared navbar, and placeholder content for the real multi-page structure.',
  cards: [
    'Real HTML-based navigation between pages.',
    'Bootstrap-based layout and shared navbar.',
    'No business logic, auth, or Supabase integration yet.',
  ],
  activePageId: 'home',
})