import { getAuthState, bindLogoutButton, ensureCurrentProfile } from '../services/authService.js'
import { createJoke, fetchCategories } from '../services/jokeService.js'
import { escapeHtml, setDocumentTitle } from '../utils/dom.js'
import { renderFormField, renderPageShell } from '../utils/page-layout.js'

function buildMainHtml(categories, messageHtml = '') {
  const categoryOptions = categories.map((category) => ({ value: category.id, label: category.name }))

  return `
    <section class="py-5 py-lg-6">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-lg-9">
            <div class="page-header mb-4">
              <span class="badge rounded-pill joke-pill mb-3">Publish a joke</span>
              <h1 class="display-5 fw-bold mb-3">Create a Joke</h1>
              <p class="lead text-body-secondary mb-0">Draft your setup, choose a category, and submit it for review.</p>
            </div>

            <div class="card form-card border-0 shadow-lg">
              <div class="card-body p-4 p-xl-5">
                ${messageHtml}
                <form id="create-joke-form" novalidate>
                  ${renderFormField({ label: 'Title', name: 'title', placeholder: 'Why the programmer crossed the road' })}
                  ${renderFormField({ label: 'Category', type: 'select', name: 'categoryId', options: categoryOptions })}
                  ${renderFormField({ label: 'Joke Text', type: 'textarea', name: 'content', placeholder: 'Write the full joke here...' })}
                  ${renderFormField({ label: 'Optional Image Upload', type: 'file', name: 'image-upload' })}
                  <div class="alert alert-warning mb-4" role="alert">New jokes are saved as pending until an admin reviews them.</div>
                  <button class="btn btn-warning btn-lg" type="submit">Publish Joke</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `
}

async function boot() {
  setDocumentTitle('Create Joke')

  const authState = await getAuthState()
  if (!authState.loggedIn) {
    window.location.assign('/login.html')
    return
  }

  const categories = await fetchCategories()
  if (!categories.length) {
    document.querySelector('#app').innerHTML = renderPageShell(
      'create-joke',
      '<div class="container py-5"><div class="alert alert-warning" role="alert">No joke categories are available. Run the Supabase seed/migration first.</div></div>',
      authState,
    )
    bindLogoutButton()
    return
  }

  document.querySelector('#app').innerHTML = renderPageShell('create-joke', buildMainHtml(categories), authState)
  bindLogoutButton()

  const form = document.querySelector('#create-joke-form')
  const cardBody = form.parentElement

  form.addEventListener('submit', async (event) => {
    event.preventDefault()

    const formData = new FormData(form)
    const title = String(formData.get('title') ?? '').trim()
    const content = String(formData.get('content') ?? '').trim()
    const categoryId = String(formData.get('categoryId') ?? '').trim()

    cardBody.querySelector('.alert:not(.alert-warning)')?.remove()

    if (!title || !content || !categoryId) {
      cardBody.insertAdjacentHTML('afterbegin', '<div class="alert alert-danger" role="alert">Please fill in the title, category, and joke text.</div>')
      return
    }

    try {
      const submitButton = form.querySelector('button[type="submit"]')
      submitButton.disabled = true
      submitButton.textContent = 'Publishing...'

      await ensureCurrentProfile(authState.user)

      await createJoke({
        title,
        content,
        categoryId,
        authorId: authState.user.id,
      })

      window.location.assign('/profile.html?submitted=1')
    } catch (error) {
      cardBody.insertAdjacentHTML('afterbegin', `<div class="alert alert-danger" role="alert">${escapeHtml(error instanceof Error ? error.message : 'Unable to publish the joke right now.')}</div>`)
      const submitButton = form.querySelector('button[type="submit"]')
      submitButton.disabled = false
      submitButton.textContent = 'Publish Joke'
    }
  })
}

boot().catch((error) => {
  document.querySelector('#app').innerHTML = `<div class="container py-5"><div class="alert alert-danger mb-0">${escapeHtml(error instanceof Error ? error.message : 'Unable to load the create joke page.')}</div></div>`
})