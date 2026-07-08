const navItems = [
  { label: 'Home', href: '/index.html', pageId: 'home' },
  { label: 'Login', href: '/login.html', pageId: 'login' },
  { label: 'Register', href: '/register.html', pageId: 'register' },
  { label: 'Add Joke', href: '/add-joke.html', pageId: 'add-joke' },
  { label: 'Details', href: '/joke-details.html', pageId: 'joke-details' },
  { label: 'Edit Joke', href: '/edit-joke.html', pageId: 'edit-joke' },
  { label: 'Profile', href: '/profile.html', pageId: 'profile' },
  { label: 'Admin', href: '/admin.html', pageId: 'admin' },
]

export function renderNavbar(activePageId = 'home') {
  return `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark border-bottom border-dark sticky-top">
      <div class="container">
        <a class="navbar-brand fw-bold letter-spacing-wide" href="/index.html">JokeArena</a>
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
                      class="nav-link${item.pageId === activePageId ? ' active' : ''}"
                      ${item.pageId === activePageId ? 'aria-current="page"' : ''}
                      href="${item.href}"
                    >
                      ${item.label}
                    </a>
                  </li>
                `,
              )
              .join('')}
          </ul>
        </div>
      </div>
    </nav>
  `
}