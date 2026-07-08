import { bindLogoutButton, getAuthState } from '../services/authService.js'
import { fetchApprovedJokeById } from '../services/jokeService.js'
import { fetchUserRating, rateJoke } from '../services/ratingService.js'
import { escapeHtml, formatDateTime, getQueryParam, setDocumentTitle } from '../utils/dom.js'
import { renderPageShell } from '../utils/page-layout.js'

function renderRatingButtons(currentRating = 0) {
  return Array.from({ length: 5 }, (_, index) => {
    const rating = index + 1
    const buttonClass = rating <= currentRating ? 'btn-warning' : 'btn-outline-dark'
    return `<button class="btn ${buttonClass} rating-choice" type="button" data-rating="${rating}">${rating}</button>`
  }).join('')
}

function buildMainHtml(joke, authState, currentRating = 0) {
  const imageMarkup = joke.imageUrl
    ? `<div class="mb-4"><img class="img-fluid rounded-4" src="${escapeHtml(joke.imageUrl)}" alt="${escapeHtml(joke.title)}" /></div>`
    : ''

  return `
    <section class="py-5 py-lg-6">
      <div class="container">
        <div class="row justify-content-center g-4">
          <div class="col-lg-8">
            <article class="card joke-details-card border-0 shadow-lg mb-4">
              <div class="card-body p-4 p-xl-5">
                <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
                  <span class="badge rounded-pill joke-category">${escapeHtml(joke.category)}</span>
                  <span class="small text-body-secondary">By ${escapeHtml(joke.authorName)} · ${joke.ratingCount} votes</span>
                </div>
                <h1 class="display-6 fw-bold mb-3">${escapeHtml(joke.title)}</h1>
                ${imageMarkup}
                <p class="text-body-secondary mb-4">${escapeHtml(joke.content)}</p>
                <div class="d-flex flex-wrap gap-2 mb-4">
                  <span class="badge rounded-pill joke-pill">Average rating: ${joke.ratingCount ? joke.ratingAverage.toFixed(1) : '0.0'}</span>
                  <span class="badge rounded-pill joke-pill">Votes: ${joke.ratingCount}</span>
                  <span class="badge rounded-pill joke-pill">Posted ${escapeHtml(formatDateTime(joke.createdAt))}</span>
                  ${authState.loggedIn && currentRating ? `<span class="badge rounded-pill joke-pill">Your rating: ${currentRating}/5</span>` : ''}
                </div>
                ${authState.loggedIn
                  ? `
                    <div class="d-flex flex-wrap align-items-center gap-3">
                      <span class="small text-body-secondary fw-semibold">Rate this joke:</span>
                      <div class="d-flex flex-wrap gap-2" id="rating-controls">
                        ${renderRatingButtons(currentRating)}
                      </div>
                    </div>
                  `
                  : '<div class="alert alert-info mb-0" role="alert"><a href="/login.html">Log in</a> to rate this joke.</div>'}
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

  if (!authState.loggedIn) {
    return
  }

  document.querySelectorAll('.rating-choice').forEach((button) => {
    button.addEventListener('click', async () => {
      const rating = Number(button.dataset.rating)
      try {
        button.disabled = true
        await rateJoke({ jokeId: joke.id, userId: authState.user.id, rating })
        window.location.reload()
      } catch (error) {
        window.alert(error instanceof Error ? error.message : 'Unable to save your rating right now.')
        button.disabled = false
      }
    })
  })
}

boot().catch((error) => {
  document.querySelector('#app').innerHTML = `<div class="container py-5"><div class="alert alert-danger mb-0">${escapeHtml(error instanceof Error ? error.message : 'Unable to load the joke details page.')}</div></div>`
})