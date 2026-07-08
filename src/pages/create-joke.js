import { renderPlaceholderPage } from '../utils/page-layout.js'

document.querySelector('#app').innerHTML = renderPlaceholderPage({
  pageTitle: 'Create Joke',
  eyebrow: 'Jokes',
  lead: 'This page is a placeholder for creating a new joke.',
  noteTitle: 'Planned page',
  noteText: 'The joke form and submit logic will be added in a later milestone.',
  cards: ['Create joke form placeholder.', 'Validation comes later.', 'No save action yet.'],
  activePageId: 'create-joke',
})