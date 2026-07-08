import { renderFeaturedJokeCard, renderPageShell } from '../utils/page-layout.js'

const featuredJokes = [
  {
    category: 'Programming',
    text: 'I told my code to stop being so dramatic. It said it just needed a little space and some semicolons.',
    author: 'Mia Carter',
    reactions: 128,
    rating: 4.8,
    authorHref: '/profile.html',
    href: '/joke-details.html',
  },
  {
    category: 'Food',
    text: 'The donut arrived late to the office meeting and apologized. It had been stuck in a jam.',
    author: 'Derek Lee',
    reactions: 94,
    rating: 4.5,
    authorHref: '/profile.html',
    href: '/joke-details.html',
  },
  {
    category: 'Office',
    text: 'Our team meeting ran so long that the minutes asked whether they were getting paid by the hour.',
    author: 'Nina Ross',
    reactions: 211,
    rating: 4.2,
    authorHref: '/profile.html',
    href: '/joke-details.html',
  },

  {
    category: 'Office',
    text: 'Our team meeting ran so long that the minutes asked whether they were getting paid by the hour.',
    author: 'Nina Ross',
    reactions: 211,
    rating: 4.2,
    authorHref: '/profile.html',
    href: '/joke-details.html',
  },
]

const mainHtml = `
  <section class="hero-section hero-home py-5 py-lg-6">
    <div class="hero-orb hero-orb-one"></div>
    <div class="hero-orb hero-orb-two"></div>
    <div class="container position-relative">
      <div class="row align-items-center g-5">
        <div class="col-lg-7">
          <span class="badge rounded-pill joke-pill mb-3">Guest browsing</span>
          <h1 class="display-4 fw-bold mb-3">JokeArena – Where Jokes Battle for Laughs</h1>
          <p class="lead text-body-secondary mb-4">Share jokes, vote for the funniest ones, and climb the comedy leaderboard.</p>
          <div class="d-flex flex-wrap gap-3">
            <a class="btn btn-warning btn-lg" href="/register.html">Join the Arena</a>
            <a class="btn btn-outline-dark btn-lg" href="/index.html#jokes-feed">Browse Jokes</a>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="py-4 py-lg-5 border-top border-opacity-10">
    <div class="container">
        <div class="row g-3">
        <div class="col-sm-6 col-lg-4"><div class="stat-card h-100 p-4 rounded-4"><div class="stat-icon mb-3">🤣</div><p class="text-uppercase small fw-semibold text-body-secondary mb-2">Jokes</p><h3 class="h4 mb-0">1,284</h3></div></div>
        <div class="col-sm-6 col-lg-4"><div class="stat-card h-100 p-4 rounded-4"><div class="stat-icon mb-3">🧑‍🎤</div><p class="text-uppercase small fw-semibold text-body-secondary mb-2">Featured comedians</p><h3 class="h4 mb-0">36</h3></div></div>
        <div class="col-sm-6 col-lg-4"><div class="stat-card h-100 p-4 rounded-4"><div class="stat-icon mb-3">🥇</div><p class="text-uppercase small fw-semibold text-body-secondary mb-2">Votes</p><h3 class="h4 mb-0">128</h3></div></div>
        </div>
    </div>
  </section>

  <section id="jokes-feed" class="py-5 py-lg-6 border-top border-opacity-10">
    <div class="container">
      <div class="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
        <div>
          <h2 class="h3 mb-0">Featured Jokes</h2>
        </div>
        <span class="badge rounded-pill joke-pill">Static examples</span>
      </div>
      <div class="row g-4">
        ${featuredJokes.map(renderFeaturedJokeCard).join('')}
      </div>
    </div>
  </section>
`

document.querySelector('#app').innerHTML = renderPageShell('home', mainHtml)