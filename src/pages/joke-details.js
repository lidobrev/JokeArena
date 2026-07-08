import { bindLogoutButton, getAuthState } from '../services/authService.js'
import { fetchApprovedJokeById } from '../services/jokeService.js'
import { fetchUserRating } from '../services/ratingService.js'
import { escapeHtml, formatDateTime, getQueryParam, setDocumentTitle } from '../utils/dom.js'
import { renderPageShell, renderStars } from '../utils/page-layout.js'
import { bindInlineRatingControls } from '../utils/rating-ui.js'

function buildMainHtml(joke, authState, currentRating = 0) {
  const imageMarkup = joke.imageUrl
    ? `<div class="joke-details-image-wrap mb-4"><img class="joke-details-image" src="${escapeHtml(joke.imageUrl)}" alt="${escapeHtml(joke.title)}" /></div>`
    : ''

  return `
    <section class="py-5 py-lg-6">
      <div class="container">
        <div class="row justify-content-center g-4">
          <div class="col-lg-9">
            <article class="card joke-details-card border-0 shadow-lg mb-4">
              ${imageMarkup}
              <div class="card-body p-4 p-xl-5">
                <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
                  <a class="badge rounded-pill joke-category joke-category-link" href="/category-jokes.html?category=${escapeHtml(joke.categorySlug)}">${escapeHtml(joke.category)}</a>
                  <span class="joke-rating-summary" data-rating-summary-for="${escapeHtml(joke.id)}"><span class="joke-rating-summary-star" aria-hidden="true">★</span><span>${joke.ratingCount ? joke.ratingAverage.toFixed(1) : '0.0'} / ${joke.ratingCount} votes</span></span>
                </div>

                <h1 class="display-6 fw-bold mb-3">${escapeHtml(joke.title)}</h1>
                <p class="lead text-body-secondary mb-4">${escapeHtml(joke.content)}</p>

                <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 small text-body-secondary">
                  <a class="joke-author-link fw-semibold" href="${escapeHtml(joke.authorHref || '/profile.html')}">By ${escapeHtml(joke.authorName)}</a>
                  <span>Posted ${escapeHtml(formatDateTime(joke.createdAt))}</span>
                </div>

                <div class="rating-strip text-center position-relative details-rating-strip">
                  <p class="small text-body-secondary mb-2">Rate this joke</p>
                  ${authState.loggedIn
                    ? `<div class="rating-stars" data-current-rating="${Number(currentRating || 0)}" aria-label="Rate this joke from 1 to 5 stars">${renderStars({ jokeId: joke.id, currentRating })}</div>`
                    : '<div class="alert alert-info mb-0" role="alert"><a href="/login.html">Log in</a> to rate this joke.</div>'}
                </div>
              </div>
            </article>

            <div class="d-flex flex-wrap gap-3">
              <a class="btn btn-warning" href="/create-joke.html">Write a joke</a>
              <a class="btn btn-outline-dark" href="/index.html">Back to home</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  `
}

async function boot() {
  setDocumentTitle('Joke Details')

  const jokeId = getQueryParam('id')
  const authState = await getAuthState()

  if (!jokeId) {
    document.querySelector('#app').innerHTML = `<div class="container py-5"><div class="alert alert-danger mb-0">Missing joke id in the URL.</div></div>`
    return
  }

  const joke = await fetchApprovedJokeById(jokeId)
  if (!joke) {
    document.querySelector('#app').innerHTML = `<div class="container py-5"><div class="alert alert-warning mb-0">That joke is not available yet.</div></div>`
    return
  }

  const currentRating = authState.loggedIn ? await fetchUserRating(joke.id, authState.user.id) : 0
  document.querySelector('#app').innerHTML = renderPageShell('', buildMainHtml(joke, authState, currentRating), authState)
  bindLogoutButton()
  bindInlineRatingControls(authState)
}

boot().catch((error) => {
  document.querySelector('#app').innerHTML = `<div class="container py-5"><div class="alert alert-danger mb-0">${escapeHtml(error instanceof Error ? error.message : 'Unable to load the joke details page.')}</div></div>`
})
