import { renderPlaceholderPage } from '../utils/page-layout.js'

document.querySelector('#app').innerHTML = renderPlaceholderPage({
  pageTitle: 'Login',
  eyebrow: 'Authentication',
  lead: 'This page is a placeholder for the future login flow.',
  noteTitle: 'Planned page',
  noteText: 'Authentication is intentionally not implemented in this milestone.',
  cards: ['Login form placeholder.', 'Session handling comes later.', 'No backend logic yet.'],
  activePageId: 'login',
})