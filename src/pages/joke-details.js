import { renderPlaceholderPage } from '../utils/page-layout.js'

document.querySelector('#app').innerHTML = renderPlaceholderPage({
  pageTitle: 'Joke Details',
  eyebrow: 'Jokes',
  lead: 'This page is a placeholder for the future joke details view.',
  noteTitle: 'Planned page',
  noteText: 'The details, comments, and vote controls will come later.',
  cards: ['Joke details placeholder.', 'Comment section later.', 'Voting tools later.'],
  activePageId: 'joke-details',
})