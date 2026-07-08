import { renderPlaceholderPage } from '../utils/page-layout.js'

document.querySelector('#app').innerHTML = renderPlaceholderPage({
  pageTitle: 'Add Joke',
  eyebrow: 'Jokes',
  lead: 'This page is a placeholder for creating a joke in a future milestone.',
  noteTitle: 'Planned page',
  noteText: 'The joke form and submit logic will be added later.',
  cards: ['Create joke form placeholder.', 'Validation comes later.', 'No save action yet.'],
  activePageId: 'add-joke',
})