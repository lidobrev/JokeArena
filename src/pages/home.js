import { bindLogoutButton, getAuthState } from '../services/authService.js'
import { fetchApprovedJokes, fetchCategories, fetchTopRatedJokes } from '../services/jokeService.js'
import { fetchCreators } from '../services/profileService.js'
import { rateJoke } from '../services/ratingService.js'
import { escapeHtml, setDocumentTitle } from '../utils/dom.js'
import { renderCategorySlider, renderCreatorsGrid, renderJokeGrid, renderPageShell, renderSeeMoreButton, renderStatCard } from '../utils/page-layout.js'

function buildMainHtml(authState, categories, latestJokes, topRatedJokes, creators) {
  const allPreviewJokes = [...latestJokes, ...topRatedJokes]
  const totalVotes = allPreviewJokes.reduce((sum, joke) => sum + joke.ratingCount, 0)
  const weightedRating = allPreviewJokes.reduce((sum, joke) => sum + joke.ratingAverage * joke.ratingCount, 0)
  const averageRating = totalVotes > 0 ? weightedRating / totalVotes : 0
  const heroBadge = authState.loggedIn ? 'Signed in' : 'Guest browsing'
  const heroTitle = authState.loggedIn
    ? `Welcome back${authState.profile?.display_name ? `, ${authState.profile.display_name}` : ''}`
    : 'JokeArena - Where jokes battle for laughs'
  const heroCopy = authState.loggedIn
    ? 'Post a joke, rate the feed, and keep your profile moving up the rankings.'
    : 'Share jokes, vote for the funniest ones, and climb the comedy leaderboard.'
  const primaryAction = authState.loggedIn ? '/create-joke.html' : '/register.html'
  const primaryLabel = authState.loggedIn ? 'Create Joke' : 'Join the Arena'
  const secondaryAction = authState.loggedIn ? '/profile.html' : '/login.html'
  const secondaryLabel = authState.loggedIn ? 'View Profile' : 'Login'

  return `
    <section class="hero-section hero-home py-5 py-lg-6">
      <div class="hero-orb hero-orb-one"></div>
      <div class="hero-orb hero-orb-two"></div>
      <div class="container position-relative">
        <div class="row align-items-center g-5">
          <div class="col-lg-7">
            <span class="badge rounded-pill joke-pill mb-3">${heroBadge}</span>
            <h1 class="display-4 fw-bold mb-3">${escapeHtml(heroTitle)}</h1>
            <p class="lead text-body-secondary mb-4">${escapeHtml(heroCopy)}</p>
            <div class="d-flex flex-wrap gap-3">
              <a class="btn btn-warning btn-lg" href="${primaryAction}">${primaryLabel}</a>
              <a class="btn btn-outline-dark btn-lg" href="${secondaryAction}">${secondaryLabel}</a>
            </div>
          </div>
        </div>
      </div>
    </section>

    ${renderCategorySlider(categories)}

    <section class="py-4 py-lg-5 border-top border-opacity-10">
      <div class="container">
        <div class="row g-3">
          ${renderStatCard({ icon: '🤣', label: 'Latest jokes', value: latestJokes.length.toString() })}
          ${renderStatCard({ icon: '⭐', label: 'Average rating', value: totalVotes ? averageRating.toFixed(1) : '0.0' })}
          ${renderStatCard({ icon: '🗳️', label: 'Total votes', value: totalVotes.toString() })}
        </div>
      </div>
    </section>

    <section id="jokes-feed" class="py-5 py-lg-6 border-top border-opacity-10">
      <div class="container">
        <div class="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
          <div>
            <p class="text-uppercase small fw-semibold text-body-secondary mb-1">Newest approved jokes</p>
            <h2 class="h3 mb-0">Latest Jokes</h2>
          </div>
        </div>
        ${renderJokeGrid(latestJokes)}
        ${renderSeeMoreButton('/latest-jokes.html', 'See more latest jokes')}
      </div>
    </section>

    <section class="py-5 py-lg-6 border-top border-opacity-10">
      <div class="container">
        <div class="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
          <div>
            <p class="text-uppercase small fw-semibold text-body-secondary mb-1">Audience favorites</p>
            <h2 class="h3 mb-0">Top Rated Jokes</h2>
          </div>
        </div>
        ${renderJokeGrid(topRatedJokes)}
        ${renderSeeMoreButton('/top-rated.html', 'See more top rated jokes')}
      </div>
    </section>

    <section class="py-5 py-lg-6 border-top border-opacity-10">
      <div class="container">
        <div class="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
          <div>
            <p class="text-uppercase small fw-semibold text-body-secondary mb-1">Community</p>
            <h2 class="h3 mb-0">Joke Creators</h2>
          </div>
        </div>
        ${renderCreatorsGrid(creators)}
        ${renderSeeMoreButton('/creators.html', 'See all creators')}
      </div>
    </section>
  `
}

function bindListRatings(authState) {
  document.querySelectorAll('.rating-star[data-joke-id]').forEach((button) => {
    button.addEventListener('click', async (event) => {
      event.preventDefault()
      event.stopPropagation()

      if (!authState.loggedIn) {
        window.location.assign('/login.html')
        return
      }

      const jokeId = button.dataset.jokeId
      const rating = Number(button.dataset.rating)

      try {
        button.closest('.rating-stars')?.querySelectorAll('button').forEach((star) => {
          star.disabled = true
        })
        await rateJoke({ jokeId, userId: authState.user.id, rating })
        window.location.reload()
      } catch (error) {
        window.alert(error instanceof Error ? error.message : 'Unable to save your rating right now.')
      }
    })
  })
}

async function boot() {
  setDocumentTitle('Home')

  const [authState, categories, latestJokes, topRatedJokes, creators] = await Promise.all([
    getAuthState(),
    fetchCategories(),
    fetchApprovedJokes({ limit: 9 }),
    fetchTopRatedJokes({ limit: 9 }),
    fetchCreators({ limit: 4 }).catch(() => []),
  ])

  document.querySelector('#app').innerHTML = renderPageShell('home', buildMainHtml(authState, categories, latestJokes, topRatedJokes, creators), authState)
  bindLogoutButton()
  bindListRatings(authState)
}

boot().catch((error) => {
  document.querySelector('#app').innerHTML = `<div class="container py-5"><div class="alert alert-danger mb-0">${escapeHtml(error instanceof Error ? error.message : 'Unable to load the home page.')}</div></div>`
})
