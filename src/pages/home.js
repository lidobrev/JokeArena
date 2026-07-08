import { bindLogoutButton, getAuthState } from '../services/authService.js'
import { fetchApprovedJokes } from '../services/jokeService.js'
import { escapeHtml, setDocumentTitle } from '../utils/dom.js'
import { renderFeaturedJokeCard, renderPageShell, renderStatCard } from '../utils/page-layout.js'

function buildMainHtml(authState, jokes) {
  const totalVotes = jokes.reduce((sum, joke) => sum + joke.ratingCount, 0)
  const weightedRating = jokes.reduce((sum, joke) => sum + joke.ratingAverage * joke.ratingCount, 0)
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

    <section class="py-4 py-lg-5 border-top border-opacity-10">
      <div class="container">
        <div class="row g-3">
          ${renderStatCard({ icon: '🤣', label: 'Approved jokes', value: jokes.length.toString() })}
          ${renderStatCard({ icon: '⭐', label: 'Average rating', value: totalVotes ? averageRating.toFixed(1) : '0.0' })}
          ${renderStatCard({ icon: '🗳️', label: 'Total votes', value: totalVotes.toString() })}
        </div>
      </div>
    </section>

    <section id="jokes-feed" class="py-5 py-lg-6 border-top border-opacity-10">
      <div class="container">
        <div class="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
          <div>
            <h2 class="h3 mb-0">Approved Jokes</h2>
          </div>
          <span class="badge rounded-pill joke-pill">Live data</span>
        </div>
        ${jokes.length
          ? `<div class="row g-4">${jokes
              .map(
                (joke) => renderFeaturedJokeCard({
                  category: joke.category,
                  title: joke.title,
                  text: joke.content,
                  author: joke.authorName,
                  authorHref: '',
                  reactions: joke.ratingCount,
                  rating: joke.ratingAverage,
                  href: `/joke-details.html?id=${joke.id}`,
                })
              )
              .join('')}</div>`
          : '<div class="alert alert-info mb-0" role="alert">No approved jokes yet. Check back after the first submissions are reviewed.</div>'}
      </div>
    </section>
  `
}

async function boot() {
  setDocumentTitle('Home')

  const [authState, jokes] = await Promise.all([getAuthState(), fetchApprovedJokes()])
  document.querySelector('#app').innerHTML = renderPageShell('home', buildMainHtml(authState, jokes), authState)
  bindLogoutButton()
}

boot().catch((error) => {
  document.querySelector('#app').innerHTML = `<div class="container py-5"><div class="alert alert-danger mb-0">${escapeHtml(error instanceof Error ? error.message : 'Unable to load the home page.')}</div></div>`
})