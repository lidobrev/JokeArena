import { renderPlaceholderPage } from '../utils/page-layout.js'

document.querySelector('#app').innerHTML = renderPlaceholderPage({
  pageTitle: 'Edit Joke',
  eyebrow: 'Jokes',
  lead: 'This page is a placeholder for editing an existing joke.',
  noteTitle: 'Planned page',
  noteText: 'Editing and ownership checks will be added in a later milestone.',
  cards: ['Edit form placeholder.', 'Ownership rules later.', 'No update logic yet.'],
  activePageId: 'edit-joke',
})