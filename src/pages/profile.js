import { bindLogoutButton, getAuthState } from '../services/authService.js'
import { fetchProfileByUserId, fetchProfileJokes, removeAvatar, updateProfile, uploadAvatar } from '../services/profileService.js'
import { escapeHtml, initialsFromName, setDocumentTitle } from '../utils/dom.js'
import { renderFormField, renderMiniJokeCard, renderPageShell } from '../utils/page-layout.js'

function getProfileId(authState) {
  return new URL(window.location.href).searchParams.get('id') || authState.user?.id || null
}

function renderAvatar(profile, displayName) {
  if (profile.avatar_url) {
    return `<img class="profile-avatar-image mx-auto mb-3" src="${escapeHtml(profile.avatar_url)}" alt="${escapeHtml(displayName)} avatar" />`
  }
  return `<div class="avatar-placeholder mx-auto mb-3">${escapeHtml(initialsFromName(displayName))}</div>`
}

function renderJokeSection(title, jokes, emptyText) {
  return `
    <div class="card profile-card border-0 shadow-sm mb-4">
      <div class="card-body p-4 p-xl-5">
        <div class="d-flex align-items-center justify-content-between gap-3 mb-4">
          <div>
            <p class="text-uppercase small fw-semibold text-body-secondary mb-1">${escapeHtml(title)}</p>
            <h2 class="h4 fw-bold mb-0">${escapeHtml(title)}</h2>
          </div>
        </div>
        ${jokes.length
          ? `<div class="row g-3">${jokes.map((joke) => renderMiniJokeCard({ id: joke.id, category: joke.category, title: joke.title, reactions: joke.ratingCount, status: joke.status, imageUrl: joke.imageUrl })).join('')}</div>`
          : `<div class="alert alert-info mb-0" role="alert">${escapeHtml(emptyText)}</div>`}
      </div>
    </div>
  `
}

function renderEditForm(profile, authState) {
  const email = authState.user?.email || ''
  const removeButton = profile.avatar_url
    ? '<button class="btn btn-outline-danger btn-lg" type="button" data-remove-avatar>Delete Avatar</button>'
    : ''

  return `
    <div class="card profile-card border-0 shadow-sm mb-4">
      <div class="card-body p-4 p-xl-5">
        <div class="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
          <div>
            <p class="text-uppercase small fw-semibold text-body-secondary mb-1">Account settings</p>
            <h2 class="h4 fw-bold mb-0">Edit Profile</h2>
          </div>
          <span class="badge rounded-pill joke-pill">Supabase Storage avatar</span>
        </div>
        <form id="profile-edit-form" novalidate>
          ${renderFormField({ label: 'Display name', name: 'display_name', placeholder: 'Your public name', value: profile.display_name || '' })}
          <div class="mb-3">
            <label class="form-label fw-semibold" for="profile-email">Email</label>
            <input class="form-control form-control-lg" id="profile-email" type="email" value="${escapeHtml(email)}" readonly />
            <p class="form-text mb-0">Email is managed by Supabase Auth and cannot be changed from this profile page.</p>
          </div>
          ${renderFormField({ label: 'Avatar image', type: 'file', name: 'avatar' })}
          <div class="d-flex flex-column flex-sm-row gap-3">
            <button class="btn btn-warning btn-lg" type="submit">Save Profile</button>
            ${removeButton}
          </div>
        </form>
      </div>
    </div>
  `
}

function buildMainHtml(profile, allJokes, authState, isOwnProfile, messageHtml = '') {
  const displayName = profile.display_name || 'JokeArena user'
  const publishedJokes = allJokes.filter((joke) => joke.status === 'approved')
  const pendingJokes = allJokes.filter((joke) => joke.status === 'pending')

  return `
    <section class="py-5 py-lg-6">
      <div class="container">
        ${messageHtml}
        <div class="row g-4 align-items-start">
          <div class="col-lg-4">
            <div class="card profile-card border-0 shadow-lg">
              <div class="card-body p-4 p-xl-5 text-center">
                ${renderAvatar(profile, displayName)}
                <h1 class="h3 fw-bold mb-2">${escapeHtml(displayName)}</h1>
                ${isOwnProfile ? `<p class="text-body-secondary mb-3">${escapeHtml(authState.user.email || '')}</p>` : ''}
                <p class="small text-body-secondary mb-0">Joined ${escapeHtml(new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(profile.created_at || Date.now())))}</p>
              </div>
            </div>
          </div>

          <div class="col-lg-8">
            ${isOwnProfile ? renderEditForm(profile, authState) : ''}
            ${renderJokeSection('Published jokes', publishedJokes, isOwnProfile ? 'You do not have approved jokes yet.' : 'This creator does not have approved jokes yet.')}
            ${isOwnProfile ? renderJokeSection('Pending jokes', pendingJokes, 'You do not have pending jokes right now.') : ''}
            ${isOwnProfile ? '<a class="btn btn-warning" href="/create-joke.html">Create joke</a>' : ''}
          </div>
        </div>
      </div>
    </section>
  `
}

async function boot() {
  setDocumentTitle('Profile')

  const authState = await getAuthState()
  const profileId = getProfileId(authState)

  if (!profileId) {
    window.location.assign('/login.html')
    return
  }

  const isOwnProfile = authState.loggedIn && profileId === authState.user.id
  const [profile, jokes] = await Promise.all([fetchProfileByUserId(profileId), fetchProfileJokes(profileId)])

  if (!profile) {
    document.querySelector('#app').innerHTML = renderPageShell('', '<div class="container py-5"><div class="alert alert-warning mb-0">Profile not found.</div></div>', authState)
    bindLogoutButton()
    return
  }

  const url = new URL(window.location.href)
  const messageHtml = url.searchParams.get('submitted')
    ? '<div class="alert alert-success mb-4" role="alert">Your joke was submitted and is waiting for admin review.</div>'
    : ''

  document.querySelector('#app').innerHTML = renderPageShell('profile', buildMainHtml(profile, jokes, authState, isOwnProfile, messageHtml), authState)
  bindLogoutButton()

  if (!isOwnProfile) {
    return
  }

  const form = document.querySelector('#profile-edit-form')
  const cardBody = form.parentElement

  document.querySelector('[data-remove-avatar]')?.addEventListener('click', async () => {
    if (!window.confirm('Delete your current avatar?')) return

    try {
      await removeAvatar(authState.user.id, profile.avatar_url)
      window.location.assign('/profile.html')
    } catch (error) {
      cardBody.querySelector('.alert-danger, .alert-success')?.remove()
      cardBody.insertAdjacentHTML('afterbegin', `<div class="alert alert-danger" role="alert">${escapeHtml(error instanceof Error ? error.message : 'Unable to delete avatar.')}</div>`)
    }
  })

  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    cardBody.querySelector('.alert-danger, .alert-success')?.remove()

    const formData = new FormData(form)
    const displayName = String(formData.get('display_name') ?? '').trim()
    const avatarFile = formData.get('avatar')

    if (!displayName) {
      cardBody.insertAdjacentHTML('afterbegin', '<div class="alert alert-danger" role="alert">Display name is required.</div>')
      return
    }

    try {
      const button = form.querySelector('button[type="submit"]')
      button.disabled = true
      button.textContent = 'Saving...'

      let avatarUrl = profile.avatar_url
      if (avatarFile instanceof File && avatarFile.size > 0) {
        avatarUrl = await uploadAvatar(avatarFile, authState.user.id, profile.avatar_url)
      }

      await updateProfile(authState.user.id, {
        display_name: displayName,
        avatar_url: avatarUrl,
      })

      cardBody.insertAdjacentHTML('afterbegin', '<div class="alert alert-success" role="alert">Profile updated successfully.</div>')
      setTimeout(() => window.location.assign('/profile.html'), 900)
    } catch (error) {
      cardBody.insertAdjacentHTML('afterbegin', `<div class="alert alert-danger" role="alert">${escapeHtml(error instanceof Error ? error.message : 'Unable to update profile.')}</div>`)
      const button = form.querySelector('button[type="submit"]')
      button.disabled = false
      button.textContent = 'Save Profile'
    }
  })
}

boot().catch((error) => {
  document.querySelector('#app').innerHTML = `<div class="container py-5"><div class="alert alert-danger mb-0">${escapeHtml(error instanceof Error ? error.message : 'Unable to load the profile page.')}</div></div>`
})
