import { escapeHtml } from '../utils/dom.js'

const guestNavItems = [
  { label: 'Home', href: '/index.html', pageId: 'home' },
  { label: 'Login', href: '/login.html', pageId: 'login' },
  { label: 'Register', href: '/register.html', pageId: 'register' },
]

const userNavItems = [
  { label: 'Home', href: '/index.html', pageId: 'home' },
  { label: 'Create Joke', href: '/create-joke.html', pageId: 'create-joke' },
  { label: 'Profile', href: '/profile.html', pageId: 'profile' },
]

export function renderNavbar(activePageId = 'home', authState = {}) {
  const navItems = authState.loggedIn ? userNavItems : guestNavItems

  return `
    <nav class="navbar navbar-expand-lg navbar-dark joke-navbar sticky-top shadow-sm">
      <div class="container">
        <a class="navbar-brand fw-bold letter-spacing-wide d-flex align-items-center gap-2" href="/index.html">
          <span class="brand-mark">🤡</span>
          <span>JokeArena</span>
        </a>
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNavbar"
          aria-controls="mainNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="mainNavbar">
          <ul class="navbar-nav ms-auto mb-2 mb-lg-0 align-items-lg-center gap-lg-2 flex-wrap">
            ${navItems
              .map(
                (item) => `
                  <li class="nav-item">
                    <a
                      class="nav-link nav-pill${item.pageId === activePageId ? ' active' : ''}"
                      ${item.pageId === activePageId ? 'aria-current="page"' : ''}
                      href="${item.href}"
                    >
                      ${item.label}
                    </a>
                  </li>
                `,
              )
              .join('')}
            ${authState.loggedIn && authState.isAdmin
              ? `
                <li class="nav-item">
                  <a
                    class="nav-link nav-pill${activePageId === 'admin' ? ' active' : ''}"
                    ${activePageId === 'admin' ? 'aria-current="page"' : ''}
                    href="/admin.html"
                  >
                    Admin
                  </a>
                </li>
              `
              : ''}
            ${authState.loggedIn
              ? `
                <li class="nav-item">
                  <button class="btn btn-warning btn-sm rounded-pill px-3 fw-semibold" type="button" data-logout-button>
                    Logout
                  </button>
                </li>
              `
              : ''}
          </ul>
        </div>
      </div>
    </nav>
  `
}