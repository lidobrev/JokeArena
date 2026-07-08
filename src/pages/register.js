import { renderPlaceholderPage } from '../utils/page-layout.js'

document.querySelector('#app').innerHTML = renderPlaceholderPage({
  pageTitle: 'Register',
  eyebrow: 'Authentication',
  lead: 'This page is a placeholder for the future registration flow.',
  noteTitle: 'Planned page',
  noteText: 'User registration is intentionally not implemented in this milestone.',
  cards: ['Registration form placeholder.', 'Profile creation comes later.', 'No backend logic yet.'],
  activePageId: 'register',
})