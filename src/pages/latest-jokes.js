import { bindLogoutButton, getAuthState } from '../services/authService.js'
import { fetchApprovedJokes, fetchApprovedJokesCount } from '../services/jokeService.js'
import { escapeHtml, setDocumentTitle } from '../utils/dom.js'
import { renderJokeGrid, renderPageShell } from '../utils/page-layout.js'
import { bindInlineRatingControls } from '../utils/rating-ui.js'

const PAGE_SIZE = 36

function getPage() {
  const page = Number(new URL(window.location.href).searchParams.get('page') || '1')
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1
}

function renderPagination(currentPage, totalCount) {
  const pageCount = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
  if (pageCount <= 1) return ''
  const items = Array.from({ length: pageCount }, (_, index) => {
    const page = index + 1
    return `<li class="page-item${page === currentPage ? ' active' : ''}"><a class="page-link" href="/latest-jokes.html?page=${page}">${page}</a></li>`
  }).join('')
  return `<nav aria-label="Latest jokes pages"><ul class="pagination justify-content-center mt-5">${items}</ul></nav>`
}

function buildMainHtml(jokes, page, totalCount) {
  return `
    <section class="py-5 py-lg-6">
      <div class="container">
        <div class="page-header mb-4">
          <span class="badge rounded-pill joke-pill mb-3">Fresh feed</span>
          <h1 class="display-5 fw-bold mb-3">Latest Jokes</h1>
          <p class="lead text-body-secondary mb-0">Browse the newest approved jokes, 36 per page.</p>
        </div>
        ${renderJokeGrid(jokes)}
        ${renderPagination(page, totalCount)}
      </div>
    </section>
  `
}

async function boot() {
  setDocumentTitle('Latest Jokes')
  const page = getPage()
  const [authState, jokes, totalCount] = await Promise.all([
    getAuthState(),
    fetchApprovedJokes({ page, pageSize: PAGE_SIZE }),
    fetchApprovedJokesCount(),
  ])

  document.querySelector('#app').innerHTML = renderPageShell('', buildMainHtml(jokes, page, totalCount), authState)
  bindLogoutButton()
  bindInlineRatingControls(authState)
}

boot().catch((error) => {
  document.querySelector('#app').innerHTML = `<div class="container py-5"><div class="alert alert-danger mb-0">${escapeHtml(error instanceof Error ? error.message : 'Unable to load latest jokes.')}</div></div>`
})
