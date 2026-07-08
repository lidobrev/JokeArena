import { bindLogoutButton, getAuthState } from '../services/authService.js'
import { fetchProfileByUserId, fetchProfileJokes } from '../services/profileService.js'
import { escapeHtml, initialsFromName, setDocumentTitle } from '../utils/dom.js'
import { renderMiniJokeCard, renderPageShell } from '../utils/page-layout.js'

function buildMainHtml(profile, jokes, messageHtml = '') {
  const displayName = profile.display_name || profile.username
  const avatarText = initialsFromName(displayName)
  const bioText = profile.bio || 'No bio yet. Add one later when profile editing is connected.'

  return `
    <section class="py-5 py-lg-6">
      <div class="container">
        ${messageHtml}
        <div class="row g-4 align-items-start">
          <div class="col-lg-4">
            <div class="card profile-card border-0 shadow-lg">
              <div class="card-body p-4 p-xl-5 text-center">
                <div class="avatar-placeholder mx-auto mb-3">${escapeHtml(avatarText)}</div>
                <h1 class="h3 fw-bold mb-2">${escapeHtml(displayName)}</h1>
                <p class="text-body-secondary mb-3">@${escapeHtml(profile.username)}</p>
                <p class="mb-4">${escapeHtml(bioText)}</p>
                <p class="small text-body-secondary mb-0">Joined ${escapeHtml(new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(profile.created_at)))}</p>
              </div>
            </div>
          </div>

          <div class="col-lg-8">
            <div class="card profile-card border-0 shadow-sm mb-4">
              <div class="card-body p-4 p-xl-5">
                <div class="d-flex align-items-center justify-content-between gap-3 mb-3">
                  <div>
                    <p class="text-uppercase small fw-semibold text-body-secondary mb-1">About</p>
                    <h2 class="h4 fw-bold mb-0">Bio</h2>
                  </div>
                  <span class="badge rounded-pill joke-pill">Live profile</span>
                </div>
                <p class="text-body-secondary mb-0">${escapeHtml(bioText)}</p>
              </div>
            </div>

            <div class="card profile-card border-0 shadow-sm mb-4">
              <div class="card-body p-4 p-xl-5">
                <div class="d-flex align-items-center justify-content-between gap-3 mb-4">
                  <div>
                    <p class="text-uppercase small fw-semibold text-body-secondary mb-1">User jokes</p>
                    <h2 class="h4 fw-bold mb-0">Published jokes</h2>
                  </div>
                  <a class="btn btn-warning" href="/create-joke.html">Create joke</a>
                </div>
                ${jokes.length
                  ? `<div class="row g-3">${jokes
                      .map((joke) => renderMiniJokeCard({ category: joke.category, title: joke.title, reactions: joke.ratingCount }))
                      .join('')}</div>`
                  : '<div class="alert alert-info mb-0" role="alert">You have not posted any jokes yet.</div>'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `
}

async function boot() {
  setDocumentTitle('Profile')

  const authState = await getAuthState()
  if (!authState.loggedIn) {
    window.location.assign('/login.html')
    return
  }

  const [profile, jokes] = await Promise.all([fetchProfileByUserId(authState.user.id), fetchProfileJokes(authState.user.id)])
  const safeProfile = profile ?? authState.profile ?? {
    id: authState.user.id,
    username: authState.user.email?.split('@')[0] ?? 'user',
    display_name: authState.user.user_metadata?.display_name ?? authState.user.user_metadata?.username ?? authState.user.email?.split('@')[0] ?? 'User',
    avatar_url: null,
    bio: null,
    created_at: authState.user.created_at ?? new Date().toISOString(),
    updated_at: authState.user.updated_at ?? new Date().toISOString(),
  }

  const messageHtml = new URL(window.location.href).searchParams.get('submitted')
    ? '<div class="alert alert-success mb-4" role="alert">Your joke was submitted and is waiting for admin review.</div>'
    : ''

  document.querySelector('#app').innerHTML = renderPageShell('profile', buildMainHtml(safeProfile, jokes, messageHtml), authState)
  bindLogoutButton()
}

boot().catch((error) => {
  document.querySelector('#app').innerHTML = `<div class="container py-5"><div class="alert alert-danger mb-0">${escapeHtml(error instanceof Error ? error.message : 'Unable to load the profile page.')}</div></div>`
})