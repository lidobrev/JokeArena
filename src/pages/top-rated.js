import { bindLogoutButton, getAuthState } from '../services/authService.js'
import { fetchApprovedJokes, fetchTopRatedJokes } from '../services/jokeService.js'
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
    return `<li class="page-item${page === currentPage ? ' active' : ''}"><a class="page-link" href="/top-rated.html?page=${page}">${page}</a></li>`
  }).join('')
  return `<nav aria-label="Top rated jokes pages"><ul class="pagination justify-content-center mt-5">${items}</ul></nav>`
}

function buildMainHtml(jokes, page, totalCount) {
  return `
    <section class="py-5 py-lg-6">
      <div class="container">
        <div class="page-header mb-4">
          <span class="badge rounded-pill joke-pill mb-3">Audience favorites</span>
          <h1 class="display-5 fw-bold mb-3">Top Rated Jokes</h1>
          <p class="lead text-body-secondary mb-0">The best rated jokes, sorted by average rating and vote count.</p>
        </div>
        ${renderJokeGrid(jokes)}
        ${renderPagination(page, totalCount)}
      </div>
    </section>
  `
}

async function boot() {
  setDocumentTitle('Top Rated Jokes')
  const page = getPage()
  const [authState, topJokes, allJokes] = await Promise.all([
    getAuthState(),
    fetchTopRatedJokes({ page, pageSize: PAGE_SIZE }),
    fetchApprovedJokes(),
  ])

  document.querySelector('#app').innerHTML = renderPageShell('', buildMainHtml(topJokes, page, allJokes.filter((joke) => joke.ratingCount > 0).length), authState)
  bindLogoutButton()
  bindInlineRatingControls(authState)
}

boot().catch((error) => {
  document.querySelector('#app').innerHTML = `<div class="container py-5"><div class="alert alert-danger mb-0">${escapeHtml(error instanceof Error ? error.message : 'Unable to load top rated jokes.')}</div></div>`
})
