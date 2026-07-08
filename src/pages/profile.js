import { renderPlaceholderPage } from '../utils/page-layout.js'

document.querySelector('#app').innerHTML = renderPlaceholderPage({
  pageTitle: 'Profile',
  eyebrow: 'Account',
  lead: 'This page is a placeholder for the future user profile area.',
  noteTitle: 'Planned page',
  noteText: 'Profile details, uploads, and user activity will be added later.',
  cards: ['Profile summary placeholder.', 'Avatar upload later.', 'User activity later.'],
  activePageId: 'profile',
})