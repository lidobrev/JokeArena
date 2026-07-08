import { bindLogoutButton, getAuthState } from '../services/authService.js'
import { fetchEditSuggestions, fetchPendingJokes, updateEditSuggestionStatus, updateJokeStatus } from '../services/jokeService.js'
import { escapeHtml, formatDateTime, setDocumentTitle } from '../utils/dom.js'
import { renderPageShell, renderStatCard } from '../utils/page-layout.js'

function buildMainHtml(pendingJokes, suggestions) {
  const stats = [
    { icon: '🃏', label: 'Pending jokes', value: String(pendingJokes.length) },
    { icon: '✏️', label: 'Edit suggestions', value: String(suggestions.length) },
    { icon: '🚦', label: 'Moderation items', value: String(pendingJokes.length + suggestions.length) },
  ]

  const pendingJokesRows = pendingJokes.length
    ? pendingJokes
        .map(
          (joke) => `
            <tr>
              <td>
                <div class="d-flex align-items-center gap-3">
                  ${joke.imageUrl ? `<img class="admin-joke-thumb" src="${escapeHtml(joke.imageUrl)}" alt="${escapeHtml(joke.title)}" />` : '<div class="admin-joke-thumb admin-joke-thumb-placeholder" aria-hidden="true"></div>'}
                  <span>${escapeHtml(joke.title)}</span>
                </div>
              </td>
              <td>${escapeHtml(joke.category)}</td>
              <td>${escapeHtml(joke.authorName)}</td>
              <td>${escapeHtml(formatDateTime(joke.createdAt))}</td>
              <td>
                <div class="d-flex flex-wrap gap-2">
                  <button class="btn btn-sm btn-success" type="button" data-joke-action="approve" data-joke-id="${joke.id}">Approve</button>
                  <button class="btn btn-sm btn-outline-danger" type="button" data-joke-action="reject" data-joke-id="${joke.id}">Reject</button>
                </div>
              </td>
            </tr>
          `
        )
        .join('')
    : '<tr><td colspan="5" class="text-body-secondary">There are no pending jokes right now.</td></tr>'

  const suggestionRows = suggestions.length
    ? suggestions
        .map(
          (suggestion) => `
            <tr>
              <td>${escapeHtml(suggestion.jokes?.title || 'Unknown joke')}</td>
              <td>${escapeHtml(suggestion.suggested_title || suggestion.jokes?.title || '')}</td>
              <td>${escapeHtml((suggestion.suggested_content || '').slice(0, 120))}${suggestion.suggested_content && suggestion.suggested_content.length > 120 ? '...' : ''}</td>
              <td>Anonymous</td>
              <td>
                <div class="d-flex flex-wrap gap-2">
                  <button class="btn btn-sm btn-success" type="button" data-suggestion-action="approve" data-suggestion-id="${suggestion.id}">Approve</button>
                  <button class="btn btn-sm btn-outline-danger" type="button" data-suggestion-action="reject" data-suggestion-id="${suggestion.id}">Reject</button>
                </div>
              </td>
            </tr>
          `
        )
        .join('')
    : '<tr><td colspan="5" class="text-body-secondary">There are no open edit suggestions right now.</td></tr>'

  return `
    <section class="py-5 py-lg-6">
      <div class="container">
        <div class="page-header mb-4">
          <span class="badge rounded-pill joke-pill mb-3">Admin dashboard</span>
          <h1 class="display-5 fw-bold mb-3">Admin Page</h1>
          <p class="lead text-body-secondary mb-0">Moderate jokes, review edit suggestions, and manage platform activity.</p>
        </div>

        <div class="row g-4 mb-4">
          ${stats.map(renderStatCard).join('')}
        </div>

        <div class="card admin-table-card border-0 shadow-sm mb-4">
          <div class="card-body p-4 p-xl-5">
            <div class="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
              <div>
                <p class="text-uppercase small fw-semibold text-body-secondary mb-1">Moderation queue</p>
                <h2 class="h4 fw-bold mb-0">Pending jokes</h2>
              </div>
              <span class="badge rounded-pill text-bg-warning">Live data</span>
            </div>
            <div class="table-responsive">
              <table class="table align-middle mb-0">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Category</th>
                    <th>Author</th>
                    <th>Submitted</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${pendingJokesRows}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="card admin-table-card border-0 shadow-sm">
          <div class="card-body p-4 p-xl-5">
            <div class="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
              <div>
                <p class="text-uppercase small fw-semibold text-body-secondary mb-1">Edit suggestions</p>
                <h2 class="h4 fw-bold mb-0">Pending suggestions</h2>
              </div>
              <span class="badge rounded-pill text-bg-warning">Live data</span>
            </div>
            <div class="table-responsive">
              <table class="table align-middle mb-0">
                <thead>
                  <tr>
                    <th>Original joke</th>
                    <th>Suggested title</th>
                    <th>Suggested content</th>
                    <th>Suggested by</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${suggestionRows}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  `
}

async function boot() {
  setDocumentTitle('Admin')

  const authState = await getAuthState()
  if (!authState.loggedIn) {
    window.location.assign('/login.html')
    return
  }

  if (!authState.isAdmin) {
    window.location.assign('/index.html')
    return
  }

  const [pendingJokes, suggestions] = await Promise.all([fetchPendingJokes(), fetchEditSuggestions()])
  document.querySelector('#app').innerHTML = renderPageShell('admin', buildMainHtml(pendingJokes, suggestions), authState)
  bindLogoutButton()

  document.querySelectorAll('[data-joke-action]').forEach((button) => {
    button.addEventListener('click', async () => {
      const jokeId = button.dataset.jokeId
      const status = button.dataset.jokeAction === 'approve' ? 'approved' : 'rejected'

      try {
        button.disabled = true
        await updateJokeStatus(jokeId, status)
        window.location.reload()
      } catch (error) {
        window.alert(error instanceof Error ? error.message : 'Unable to update the joke right now.')
        button.disabled = false
      }
    })
  })

  document.querySelectorAll('[data-suggestion-action]').forEach((button) => {
    button.addEventListener('click', async () => {
      const suggestionId = button.dataset.suggestionId
      const status = button.dataset.suggestionAction === 'approve' ? 'approved' : 'rejected'

      try {
        button.disabled = true
        await updateEditSuggestionStatus(suggestionId, status)
        window.location.reload()
      } catch (error) {
        window.alert(error instanceof Error ? error.message : 'Unable to update the suggestion right now.')
        button.disabled = false
      }
    })
  })
}

boot().catch((error) => {
  document.querySelector('#app').innerHTML = `<div class="container py-5"><div class="alert alert-danger mb-0">${escapeHtml(error instanceof Error ? error.message : 'Unable to load the admin page.')}</div></div>`
})