import { renderPlaceholderPage } from '../utils/page-layout.js'

document.querySelector('#app').innerHTML = renderPlaceholderPage({
  pageTitle: 'Admin Panel',
  eyebrow: 'Administration',
  lead: 'This page is a placeholder for the future admin dashboard.',
  noteTitle: 'Planned page',
  noteText: 'Administration, moderation, and role management will come later.',
  cards: ['Admin dashboard placeholder.', 'Moderation tools later.', 'Role management later.'],
  activePageId: 'admin',
})