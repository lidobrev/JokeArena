import { bindLogoutButton, getAuthState } from '../services/authService.js'
import { fetchApprovedJokesByCategoryCount, fetchApprovedJokesByCategorySlug, fetchCategoryBySlug } from '../services/jokeService.js'
import { escapeHtml, setDocumentTitle } from '../utils/dom.js'
import { renderJokeGrid, renderPageShell } from '../utils/page-layout.js'
import { bindInlineRatingControls } from '../utils/rating-ui.js'

const PAGE_SIZE = 36

function getPage() {
  const page = Number(new URL(window.location.href).searchParams.get('page') || '1')
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1
}

function getCategorySlug() {
  return new URL(window.location.href).searchParams.get('category') || ''
}

function renderPagination(slug, currentPage, totalCount) {
  const pageCount = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
  if (pageCount <= 1) return ''
  const items = Array.from({ length: pageCount }, (_, index) => {
    const page = index + 1
    return `<li class="page-item${page === currentPage ? ' active' : ''}"><a class="page-link" href="/category-jokes.html?category=${escapeHtml(slug)}&page=${page}">${page}</a></li>`
  }).join('')
  return `<nav aria-label="Category joke pages"><ul class="pagination justify-content-center mt-5">${items}</ul></nav>`
}

async function boot() {
  const slug = getCategorySlug()
  const page = getPage()
  const authState = await getAuthState()

  if (!slug) {
    document.querySelector('#app').innerHTML = renderPageShell('', '<div class="container py-5"><div class="alert alert-warning mb-0">Missing category.</div></div>', authState)
    bindLogoutButton()
    return
  }

  const [category, jokes, totalCount] = await Promise.all([
    fetchCategoryBySlug(slug),
    fetchApprovedJokesByCategorySlug(slug, { page, pageSize: PAGE_SIZE }),
    fetchApprovedJokesByCategoryCount(slug),
  ])

  setDocumentTitle(category?.name ? `${category.name} Jokes` : 'Category Jokes')

  document.querySelector('#app').innerHTML = renderPageShell('', `
    <section class="py-5 py-lg-6">
      <div class="container">
        <div class="page-header mb-4">
          <span class="badge rounded-pill joke-pill mb-3">Category</span>
          <h1 class="display-5 fw-bold mb-3">${escapeHtml(category?.name || 'Category')} Jokes</h1>
          <p class="lead text-body-secondary mb-0">
            ${escapeHtml(category?.description || 'Browse approved jokes from this category.')}
          </p>
        </div>
        ${renderJokeGrid(jokes)}
        ${renderPagination(slug, page, totalCount)}
      </div>
    </section>
  `, authState)
  bindLogoutButton()
  bindInlineRatingControls(authState)
}

boot().catch((error) => {
  document.querySelector('#app').innerHTML = `<div class="container py-5"><div class="alert alert-danger mb-0">${escapeHtml(error instanceof Error ? error.message : 'Unable to load category jokes.')}</div></div>`
})
