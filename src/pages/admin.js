import { bindLogoutButton, getAuthState } from '../services/authService.js'
import { fetchActivityLogs } from '../services/activityService.js'
import { createCategory, deleteCategory, deleteUserAppData, fetchAdminCategories, fetchAdminProfiles, setUserRole, updateCategory } from '../services/adminService.js'
import {
  deleteJokeById,
  fetchAllJokesForAdmin,
  fetchPendingJokes,
  updateJokeStatus,
} from '../services/jokeService.js'
import { escapeHtml, formatDateTime, setDocumentTitle } from '../utils/dom.js'
import { renderPageShell, renderStatCard } from '../utils/page-layout.js'

function getActiveTab() {
  return new URL(window.location.href).searchParams.get('tab') || 'dashboard'
}

function tabHref(tab) {
  return `/admin.html${tab === 'dashboard' ? '' : `?tab=${tab}`}`
}

function renderAdminTabs(activeTab) {
  const tabs = [
    ['dashboard', 'Dashboard'],
    ['jokes', 'Jokes'],
    ['users', 'Users'],
    ['categories', 'Categories'],
    ['logs', 'Log'],
  ]

  return `
    <div class="admin-tabs-wrapper mb-4" aria-label="Admin sections">
      <ul class="nav nav-pills admin-tabs flex-nowrap mb-0">
        ${tabs
          .map(([id, label]) => `<li class="nav-item"><a class="nav-link${activeTab === id ? ' active' : ''}" href="${tabHref(id)}">${label}</a></li>`)
          .join('')}
      </ul>
    </div>
  `
}

function renderDashboard(pendingJokes) {
  const stats = [
    { icon: '🃏', label: 'Pending jokes', value: String(pendingJokes.length) },
    { icon: '🚦', label: 'Moderation items', value: String(pendingJokes.length) },
    { icon: '✅', label: 'Dashboard', value: 'Live' },
  ]

  const pendingJokesRows = pendingJokes.length
    ? pendingJokes.map((joke) => `
      <tr>
        <td data-label="Item">
          <div class="d-flex align-items-center gap-3">
            ${joke.imageUrl ? `<img class="admin-joke-thumb" src="${escapeHtml(joke.imageUrl)}" alt="${escapeHtml(joke.title)}" />` : ''}
            <span>${escapeHtml(joke.title)}</span>
          </div>
        </td>
        <td data-label="Category">${escapeHtml(joke.category)}</td>
        <td data-label="Author"><a href="${escapeHtml(joke.authorHref)}">${escapeHtml(joke.authorName)}</a></td>
        <td data-label="Submitted">${escapeHtml(formatDateTime(joke.createdAt))}</td>
        <td data-label="Actions">
          <div class="d-flex flex-wrap gap-2">
            <button class="btn btn-sm btn-success" type="button" data-joke-action="approve" data-joke-id="${joke.id}">Approve</button>
            <button class="btn btn-sm btn-outline-danger" type="button" data-joke-action="reject" data-joke-id="${joke.id}">Reject</button>
          </div>
        </td>
      </tr>`).join('')
    : '<tr><td colspan="5" class="text-body-secondary">There are no pending jokes right now.</td></tr>'

  return `
    <div class="row g-4 mb-4">${stats.map(renderStatCard).join('')}</div>

    <div class="card admin-table-card border-0 shadow-sm mb-4">
      <div class="card-body p-4 p-xl-5">
        <div class="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
          <div><p class="text-uppercase small fw-semibold text-body-secondary mb-1">Moderation queue</p><h2 class="h4 fw-bold mb-0">Pending jokes</h2></div>
          <span class="badge rounded-pill text-bg-warning">Live data</span>
        </div>
        <div class="table-responsive"><table class="table align-middle mb-0"><thead><tr><th>Item</th><th>Category</th><th>Author</th><th>Submitted</th><th>Actions</th></tr></thead><tbody>${pendingJokesRows}</tbody></table></div>
      </div>
    </div>
  `
}

function renderJokesTab(jokes) {
  const rows = jokes.length
    ? jokes.map((joke) => `
      <tr>
        <td data-label="Joke">
          <div class="d-flex align-items-center gap-3">
            ${joke.imageUrl ? `<img class="admin-joke-thumb" src="${escapeHtml(joke.imageUrl)}" alt="${escapeHtml(joke.title)}" />` : ''}
            <div><strong>${escapeHtml(joke.title)}</strong><div class="small text-body-secondary">${escapeHtml(joke.content.slice(0, 90))}${joke.content.length > 90 ? '...' : ''}</div></div>
          </div>
        </td>
        <td data-label="Category">${escapeHtml(joke.category)}</td>
        <td data-label="Author"><a href="${escapeHtml(joke.authorHref)}">${escapeHtml(joke.authorName)}</a></td>
        <td data-label="Status"><span class="badge rounded-pill ${joke.status === 'approved' ? 'text-bg-success' : joke.status === 'rejected' ? 'text-bg-danger' : 'text-bg-warning'}">${escapeHtml(joke.status)}</span></td>
        <td data-label="Submitted">${escapeHtml(formatDateTime(joke.createdAt))}</td>
        <td data-label="Actions">
          <div class="d-flex flex-wrap gap-2">
            <a class="btn btn-sm btn-outline-dark" href="/edit-joke.html?id=${joke.id}">Edit</a>
            <button class="btn btn-sm btn-outline-danger" type="button" data-delete-joke-id="${joke.id}" data-delete-joke-title="${escapeHtml(joke.title)}">Delete</button>
          </div>
        </td>
      </tr>`).join('')
    : '<tr><td colspan="6" class="text-body-secondary">No jokes found.</td></tr>'

  return `
    <div class="card admin-table-card border-0 shadow-sm">
      <div class="card-body p-4 p-xl-5">
        <div class="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4"><div><p class="text-uppercase small fw-semibold text-body-secondary mb-1">Full moderation</p><h2 class="h4 fw-bold mb-0">All jokes</h2></div><span class="badge rounded-pill joke-pill">Edit or delete</span></div>
        <div class="table-responsive"><table class="table align-middle mb-0"><thead><tr><th>Joke</th><th>Category</th><th>Author</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead><tbody>${rows}</tbody></table></div>
      </div>
    </div>
  `
}

function renderUsersTab(users) {
  const rows = users.length
    ? users.map((user) => {
      const isAdmin = user.roles.includes('admin')
      return `
        <tr>
          <td data-label="User">
            <div class="d-flex align-items-center gap-3">
              ${user.avatar_url ? `<img class="admin-user-avatar" src="${escapeHtml(user.avatar_url)}" alt="${escapeHtml(user.display_name || 'User')} avatar" />` : '<div class="admin-user-avatar admin-user-avatar-placeholder" aria-hidden="true"></div>'}
              <div><strong>${escapeHtml(user.display_name || 'JokeArena user')}</strong><div class="small text-body-secondary">User profile</div></div>
            </div>
          </td>
          <td data-label="Roles">${escapeHtml(user.roles.join(', ') || 'user')}</td>
          <td data-label="Created">${escapeHtml(formatDateTime(user.created_at))}</td>
          <td data-label="Actions">
            <div class="d-flex flex-wrap gap-2">
              <button class="btn btn-sm ${isAdmin ? 'btn-outline-warning' : 'btn-outline-success'}" type="button" data-toggle-admin-user="${user.id}" data-enable-admin="${isAdmin ? 'false' : 'true'}">${isAdmin ? 'Remove admin' : 'Make admin'}</button>
              <button class="btn btn-sm btn-outline-danger" type="button" data-delete-user-id="${user.id}" data-delete-user-name="${escapeHtml(user.display_name || 'this user')}">Delete data</button>
            </div>
          </td>
        </tr>
      `
    }).join('')
    : '<tr><td colspan="4" class="text-body-secondary">No users found.</td></tr>'

  return `
    <div class="alert alert-warning" role="alert">Deleting a user here removes their app profile, roles, jokes, ratings, avatar, and joke images.</div>
    <div class="card admin-table-card border-0 shadow-sm">
      <div class="card-body p-4 p-xl-5">
        <div class="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4"><div><p class="text-uppercase small fw-semibold text-body-secondary mb-1">Accounts</p><h2 class="h4 fw-bold mb-0">Users</h2></div><span class="badge rounded-pill joke-pill">Roles and deletion</span></div>
        <div class="table-responsive"><table class="table align-middle mb-0"><thead><tr><th>User</th><th>Roles</th><th>Created</th><th>Actions</th></tr></thead><tbody>${rows}</tbody></table></div>
      </div>
    </div>
  `
}


function renderCategoriesTab(categories) {
  const rows = categories.length
    ? categories.map((category) => `
      <tr>
        <td data-label="Name"><strong>${escapeHtml(category.name)}</strong></td>
        <td data-label="Slug"><code>${escapeHtml(category.slug)}</code></td>
        <td data-label="Description">${escapeHtml(category.description || '—')}</td>
        <td data-label="Jokes">${escapeHtml(category.jokeCount)}</td>
        <td data-label="Actions">
          <div class="d-flex flex-wrap gap-2">
            <button
              class="btn btn-sm btn-outline-dark"
              type="button"
              data-edit-category-id="${category.id}"
              data-edit-category-name="${escapeHtml(category.name)}"
              data-edit-category-slug="${escapeHtml(category.slug)}"
              data-edit-category-description="${escapeHtml(category.description || '')}"
            >Edit</button>
            <button class="btn btn-sm btn-outline-danger" type="button" data-delete-category-id="${category.id}" data-delete-category-name="${escapeHtml(category.name)}" data-category-joke-count="${category.jokeCount}">Delete</button>
          </div>
        </td>
      </tr>`).join('')
    : '<tr><td colspan="5" class="text-body-secondary">No categories found.</td></tr>'

  return `
    <div class="card admin-table-card border-0 shadow-sm mb-4">
      <div class="card-body p-4 p-xl-5">
        <div class="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
          <div><p class="text-uppercase small fw-semibold text-body-secondary mb-1">Taxonomy</p><h2 class="h4 fw-bold mb-0">Categories</h2></div>
          <span class="badge rounded-pill joke-pill">Add and edit</span>
        </div>
        <form id="category-form" class="admin-category-form mb-4">
          <input type="hidden" name="categoryId" />
          <div class="row g-3 align-items-end">
            <div class="col-md-4">
              <label class="form-label fw-semibold" for="category-name">Name</label>
              <input class="form-control" id="category-name" name="name" placeholder="Animals" required />
            </div>
            <div class="col-md-3">
              <label class="form-label fw-semibold" for="category-slug">Slug</label>
              <input class="form-control" id="category-slug" name="slug" placeholder="animals" required />
            </div>
            <div class="col-md-3">
              <label class="form-label fw-semibold" for="category-description">Description</label>
              <input class="form-control" id="category-description" name="description" placeholder="Short description" />
            </div>
            <div class="col-md-2 d-grid gap-2">
              <button class="btn btn-warning" type="submit" data-category-submit>Save</button>
              <button class="btn btn-outline-dark d-none" type="button" data-category-cancel>Cancel</button>
            </div>
          </div>
          <div class="form-text mt-2">Slug is used for category URLs. Example: <code>animals</code>.</div>
        </form>
        <div class="table-responsive"><table class="table align-middle mb-0"><thead><tr><th>Name</th><th>Slug</th><th>Description</th><th>Jokes</th><th>Actions</th></tr></thead><tbody>${rows}</tbody></table></div>
      </div>
    </div>
  `
}

function renderLogsTab(logs) {
  const rows = logs.length
    ? logs.map((log) => `
      <tr>
        <td data-label="When">${escapeHtml(formatDateTime(log.created_at))}</td>
        <td data-label="User">${escapeHtml(log.profiles?.display_name || log.user_id || 'Unknown user')}</td>
        <td data-label="Action"><span class="badge rounded-pill joke-pill">${escapeHtml(log.action)}</span></td>
        <td data-label="Metadata"><code class="small">${escapeHtml(JSON.stringify(log.metadata || {}))}</code></td>
      </tr>`).join('')
    : '<tr><td colspan="4" class="text-body-secondary">No activity logs found yet.</td></tr>'

  return `
    <div class="card admin-table-card border-0 shadow-sm">
      <div class="card-body p-4 p-xl-5">
        <div class="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4"><div><p class="text-uppercase small fw-semibold text-body-secondary mb-1">Audit trail</p><h2 class="h4 fw-bold mb-0">Activity log</h2></div><span class="badge rounded-pill joke-pill">Latest 100</span></div>
        <div class="table-responsive"><table class="table align-middle mb-0"><thead><tr><th>When</th><th>User</th><th>Action</th><th>Metadata</th></tr></thead><tbody>${rows}</tbody></table></div>
      </div>
    </div>
  `
}

function buildMainHtml(activeTab, contentHtml) {
  return `
    <section class="py-5 py-lg-6">
      <div class="container">
        <div class="page-header mb-4">
          <span class="badge rounded-pill joke-pill mb-3">Admin dashboard</span>
          <h1 class="display-5 fw-bold mb-3">Admin Page</h1>
          <p class="lead text-body-secondary mb-0">Moderate jokes, review users, and audit platform activity.</p>
        </div>
        ${renderAdminTabs(activeTab)}
        ${contentHtml}
      </div>
    </section>
  `
}

async function getTabContent(activeTab) {
  if (activeTab === 'jokes') {
    return renderJokesTab(await fetchAllJokesForAdmin())
  }

  if (activeTab === 'users') {
    return renderUsersTab(await fetchAdminProfiles())
  }

  if (activeTab === 'categories') {
    return renderCategoriesTab(await fetchAdminCategories())
  }

  if (activeTab === 'logs') {
    return renderLogsTab(await fetchActivityLogs({ limit: 100 }))
  }

  return renderDashboard(await fetchPendingJokes())
}

function bindAdminActions() {
  document.querySelectorAll('[data-joke-action]').forEach((button) => {
    button.addEventListener('click', async () => {
      const jokeId = button.dataset.jokeId
      const status = button.dataset.jokeAction === 'approve' ? 'approved' : 'rejected'
      try {
        button.disabled = true
        await updateJokeStatus(jokeId, status)
        window.location.reload()
      } catch (error) {
        window.alert(error instanceof Error ? error.message : 'Unable to update the joke right now.')
        button.disabled = false
      }
    })
  })

  document.querySelectorAll('[data-delete-joke-id]').forEach((button) => {
    button.addEventListener('click', async () => {
      const title = button.dataset.deleteJokeTitle || 'this joke'
      if (!window.confirm(`Delete "${title}"? If it has an image, the image will also be removed from Storage.`)) return
      try {
        button.disabled = true
        await deleteJokeById(button.dataset.deleteJokeId)
        window.location.reload()
      } catch (error) {
        window.alert(error instanceof Error ? error.message : 'Unable to delete the joke right now.')
        button.disabled = false
      }
    })
  })

  document.querySelectorAll('[data-delete-user-id]').forEach((button) => {
    button.addEventListener('click', async () => {
      const name = button.dataset.deleteUserName || 'this user'
      const warning = `Delete all app data for ${name}? This removes their profile, roles, jokes, ratings, avatar, and joke images.`
      if (!window.confirm(warning)) return
      try {
        button.disabled = true
        await deleteUserAppData(button.dataset.deleteUserId)
        window.location.reload()
      } catch (error) {
        window.alert(error instanceof Error ? error.message : 'Unable to delete this user data right now.')
        button.disabled = false
      }
    })
  })

  document.querySelectorAll('[data-toggle-admin-user]').forEach((button) => {
    button.addEventListener('click', async () => {
      try {
        button.disabled = true
        await setUserRole(button.dataset.toggleAdminUser, 'admin', button.dataset.enableAdmin === 'true')
        window.location.reload()
      } catch (error) {
        window.alert(error instanceof Error ? error.message : 'Unable to update the user role right now.')
        button.disabled = false
      }
    })
  })

  const categoryForm = document.querySelector('#category-form')
  if (categoryForm) {
    const cancelButton = categoryForm.querySelector('[data-category-cancel]')
    const submitButton = categoryForm.querySelector('[data-category-submit]')
    const resetForm = () => {
      categoryForm.reset()
      categoryForm.elements.categoryId.value = ''
      submitButton.textContent = 'Save'
      cancelButton.classList.add('d-none')
    }

    categoryForm.addEventListener('submit', async (event) => {
      event.preventDefault()
      const formData = new FormData(categoryForm)
      const categoryId = String(formData.get('categoryId') || '').trim()
      const payload = {
        name: String(formData.get('name') || '').trim(),
        slug: String(formData.get('slug') || '').trim(),
        description: String(formData.get('description') || '').trim(),
      }

      try {
        submitButton.disabled = true
        if (categoryId) {
          await updateCategory(categoryId, payload)
        } else {
          await createCategory(payload)
        }
        window.location.assign('/admin.html?tab=categories')
      } catch (error) {
        window.alert(error instanceof Error ? error.message : 'Unable to save category right now.')
        submitButton.disabled = false
      }
    })

    cancelButton.addEventListener('click', resetForm)
  }

  document.querySelectorAll('[data-edit-category-id]').forEach((button) => {
    button.addEventListener('click', () => {
      const categoryForm = document.querySelector('#category-form')
      if (!categoryForm) return
      categoryForm.elements.categoryId.value = button.dataset.editCategoryId || ''
      categoryForm.elements.name.value = button.dataset.editCategoryName || ''
      categoryForm.elements.slug.value = button.dataset.editCategorySlug || ''
      categoryForm.elements.description.value = button.dataset.editCategoryDescription || ''
      categoryForm.querySelector('[data-category-submit]').textContent = 'Update'
      categoryForm.querySelector('[data-category-cancel]').classList.remove('d-none')
      categoryForm.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
  })

  document.querySelectorAll('[data-delete-category-id]').forEach((button) => {
    button.addEventListener('click', async () => {
      const name = button.dataset.deleteCategoryName || 'this category'
      const jokeCount = Number(button.dataset.categoryJokeCount || 0)
      const message = jokeCount > 0
        ? `Cannot safely delete "${name}" because it has ${jokeCount} jokes. Move or delete those jokes first.`
        : `Delete category "${name}"?`
      if (jokeCount > 0) {
        window.alert(message)
        return
      }
      if (!window.confirm(message)) return
      try {
        button.disabled = true
        await deleteCategory(button.dataset.deleteCategoryId)
        window.location.assign('/admin.html?tab=categories')
      } catch (error) {
        window.alert(error instanceof Error ? error.message : 'Unable to delete category right now.')
        button.disabled = false
      }
    })
  })
}

async function boot() {
  setDocumentTitle('Admin')

  const authState = await getAuthState()
  if (!authState.loggedIn) {
    window.location.assign('/login.html')
    return
  }

  if (!authState.isAdmin) {
    window.location.assign('/index.html')
    return
  }

  const activeTab = getActiveTab()
  const contentHtml = await getTabContent(activeTab)
  document.querySelector('#app').innerHTML = renderPageShell('admin', buildMainHtml(activeTab, contentHtml), authState)
  bindLogoutButton()
  bindAdminActions()
}

boot().catch((error) => {
  document.querySelector('#app').innerHTML = `<div class="container py-5"><div class="alert alert-danger mb-0">${escapeHtml(error instanceof Error ? error.message : 'Unable to load the admin page.')}</div></div>`
})
