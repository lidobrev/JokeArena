import { bindLogoutButton, getAuthState } from '../services/authService.js'
import { fetchCategories, fetchEditableJokeById, fetchJokeByIdForAdmin, updateJokeDraft } from '../services/jokeService.js'
import { escapeHtml, getQueryParam, setDocumentTitle } from '../utils/dom.js'
import { renderFormField, renderPageShell } from '../utils/page-layout.js'

function buildMainHtml(joke, categories, messageHtml = '') {
  const categoryOptions = categories.map((category) => ({ value: category.id, label: category.name }))

  return `
    <section class="py-5 py-lg-6">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-lg-9">
            <div class="page-header mb-4">
              <span class="badge rounded-pill joke-pill mb-3">Edit joke draft</span>
              <h1 class="display-5 fw-bold mb-3">Edit Joke</h1>
              <p class="lead text-body-secondary mb-0">Adjust the setup, refine the punchline, and save the draft again.</p>
            </div>

            <div class="card form-card border-0 shadow-lg">
              <div class="card-body p-4 p-xl-5">
                ${messageHtml}
                <form id="edit-joke-form" novalidate>
                  ${renderFormField({ label: 'Title', name: 'title', placeholder: 'Why the programmer crossed the road', value: joke.title })}
                  ${renderFormField({
                    label: 'Category',
                    type: 'select',
                    name: 'categoryId',
                    options: categoryOptions,
                    selectedValue: joke.categoryId,
                  })}
                  ${renderFormField({ label: 'Joke Text', type: 'textarea', name: 'content', placeholder: 'Write the full joke here...', value: joke.content })}
                  ${renderFormField({ label: 'Optional Image Upload', type: 'file', name: 'image-upload' })}
                  <div class="alert alert-info mb-4" role="alert">Only pending jokes can be edited after submission.</div>
                  <button class="btn btn-warning btn-lg" type="submit">Save Changes</button>
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
  setDocumentTitle('Edit Joke')

  const jokeId = getQueryParam('id')
  if (!jokeId) {
    document.querySelector('#app').innerHTML = `<div class="container py-5"><div class="alert alert-warning mb-0">Missing joke id in the URL.</div></div>`
    return
  }

  const authState = await getAuthState()
  if (!authState.loggedIn) {
    window.location.assign('/login.html')
    return
  }

  const categories = await fetchCategories()
  const joke = authState.isAdmin ? await fetchJokeByIdForAdmin(jokeId) : await fetchEditableJokeById(authState.user.id, jokeId)

  if (!joke) {
    document.querySelector('#app').innerHTML = `<div class="container py-5"><div class="alert alert-warning mb-0">You do not have access to edit this joke.</div></div>`
    return
  }

  document.querySelector('#app').innerHTML = renderPageShell('', buildMainHtml(joke, categories), authState)
  bindLogoutButton()

  const form = document.querySelector('#edit-joke-form')
  const cardBody = form.parentElement

  form.addEventListener('submit', async (event) => {
    event.preventDefault()

    const formData = new FormData(form)
    const title = String(formData.get('title') ?? '').trim()
    const content = String(formData.get('content') ?? '').trim()
    const categoryId = String(formData.get('categoryId') ?? '').trim()

    cardBody.querySelector('.alert:not(.alert-info)')?.remove()

    if (!title || !content || !categoryId) {
      cardBody.insertAdjacentHTML('afterbegin', '<div class="alert alert-danger" role="alert">Please fill in the title, category, and joke text.</div>')
      return
    }

    try {
      const submitButton = form.querySelector('button[type="submit"]')
      submitButton.disabled = true
      submitButton.textContent = 'Saving...'

      await updateJokeDraft(joke.id, { title, content, categoryId })
      window.location.assign(`/joke-details.html?id=${joke.id}`)
    } catch (error) {
      cardBody.insertAdjacentHTML('afterbegin', `<div class="alert alert-danger" role="alert">${escapeHtml(error instanceof Error ? error.message : 'Unable to save the changes right now.')}</div>`)
      const submitButton = form.querySelector('button[type="submit"]')
      submitButton.disabled = false
      submitButton.textContent = 'Save Changes'
    }
  })
}

boot().catch((error) => {
  document.querySelector('#app').innerHTML = `<div class="container py-5"><div class="alert alert-danger mb-0">${escapeHtml(error instanceof Error ? error.message : 'Unable to load the edit joke page.')}</div></div>`
})