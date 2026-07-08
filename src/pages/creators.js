import { bindLogoutButton, getAuthState } from '../services/authService.js'
import { fetchCreators, fetchCreatorsCount } from '../services/profileService.js'
import { escapeHtml, setDocumentTitle } from '../utils/dom.js'
import { renderCreatorsGrid, renderPageShell } from '../utils/page-layout.js'

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
    return `<li class="page-item${page === currentPage ? ' active' : ''}"><a class="page-link" href="/creators.html?page=${page}">${page}</a></li>`
  }).join('')
  return `<nav aria-label="Creators pages"><ul class="pagination justify-content-center mt-5">${items}</ul></nav>`
}

async function boot() {
  setDocumentTitle('Joke Creators')
  const page = getPage()
  const [authState, creators, totalCount] = await Promise.all([
    getAuthState(),
    fetchCreators({ page, pageSize: PAGE_SIZE }),
    fetchCreatorsCount(),
  ])

  document.querySelector('#app').innerHTML = renderPageShell('', `
    <section class="py-5 py-lg-6">
      <div class="container">
        <div class="page-header mb-4">
          <span class="badge rounded-pill joke-pill mb-3">Community</span>
          <h1 class="display-5 fw-bold mb-3">Joke Creators</h1>
          <p class="lead text-body-secondary mb-0">Browse JokeArena creators and open their public profiles.</p>
        </div>
        ${renderCreatorsGrid(creators)}
        ${renderPagination(page, totalCount)}
      </div>
    </section>
  `, authState)
  bindLogoutButton()
}

boot().catch((error) => {
  document.querySelector('#app').innerHTML = `<div class="container py-5"><div class="alert alert-danger mb-0">${escapeHtml(error instanceof Error ? error.message : 'Unable to load creators.')}</div></div>`
})
