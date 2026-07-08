import { getAuthState, signUpWithEmail } from '../services/authService.js'
import { escapeHtml, setDocumentTitle } from '../utils/dom.js'
import { renderFormField, renderPageShell } from '../utils/page-layout.js'

function buildMainHtml(messageHtml = '') {
  return `
    <section class="py-5 py-lg-6">
      <div class="container">
        <div class="row justify-content-center align-items-center g-4">
          <div class="col-lg-5">
            <div class="auth-illustration register-illustration p-4 p-xl-5 rounded-4 h-100">
              <span class="display-5">🎉</span>
              <h1 class="h2 fw-bold mt-3 mb-3">Create your JokeArena account</h1>
              <p class="text-body-secondary mb-0">Register to publish jokes, react to the feed, and build your profile.</p>
            </div>
          </div>

          <div class="col-lg-6">
            <div class="card form-card border-0 shadow-lg">
              <div class="card-body p-4 p-xl-5">
                <h2 class="h3 fw-bold mb-2">Create Account</h2>
                <p class="text-body-secondary mb-4">Set up your public JokeArena identity.</p>
                ${messageHtml}
                <form id="register-form" novalidate>
                  ${renderFormField({ label: 'Display name', type: 'text', name: 'displayName', placeholder: 'Your public name' })}
                  ${renderFormField({ label: 'Email', type: 'email', name: 'email', placeholder: 'you@example.com' })}
                  ${renderFormField({ label: 'Password', type: 'password', name: 'password', placeholder: 'Create a password' })}
                  ${renderFormField({ label: 'Confirm Password', type: 'password', name: 'confirm-password', placeholder: 'Repeat your password' })}
                  <div class="d-flex justify-content-between align-items-center gap-3 mb-4">
                    <p class="small text-body-secondary mb-0">Already have an account?</p>
                    <a class="small fw-semibold" href="/login.html">Login</a>
                  </div>
                  <button class="btn btn-warning btn-lg w-100" type="submit">Create Account</button>
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
  setDocumentTitle('Register')

  const authState = await getAuthState()
  if (authState.loggedIn) {
    window.location.assign('/index.html')
    return
  }

  document.querySelector('#app').innerHTML = renderPageShell('register', buildMainHtml(), authState)

  const form = document.querySelector('#register-form')
  const cardBody = form.parentElement

  form.addEventListener('submit', async (event) => {
    event.preventDefault()

    const formData = new FormData(form)
    const displayName = String(formData.get('displayName') ?? '').trim()
    const email = String(formData.get('email') ?? '').trim()
    const password = String(formData.get('password') ?? '')
    const confirmPassword = String(formData.get('confirm-password') ?? '')

    cardBody.querySelector('.alert')?.remove()

    if (!displayName || !email || !password || !confirmPassword) {
      cardBody.insertAdjacentHTML('afterbegin', '<div class="alert alert-danger" role="alert">Please fill in all fields.</div>')
      return
    }

    if (password !== confirmPassword) {
      cardBody.insertAdjacentHTML('afterbegin', '<div class="alert alert-danger" role="alert">Passwords do not match.</div>')
      return
    }

    try {
      const submitButton = form.querySelector('button[type="submit"]')
      submitButton.disabled = true
      submitButton.textContent = 'Creating account...'
      const response = await signUpWithEmail({ email, password, displayName })

      if (response.session) {
        window.location.assign('/index.html')
        return
      }

      window.location.assign('/login.html?registered=1')
    } catch (error) {
      cardBody.insertAdjacentHTML('afterbegin', `<div class="alert alert-danger" role="alert">${escapeHtml(error instanceof Error ? error.message : 'Unable to create the account right now.')}</div>`)
      const submitButton = form.querySelector('button[type="submit"]')
      submitButton.disabled = false
      submitButton.textContent = 'Create Account'
    }
  })
}

boot().catch((error) => {
  document.querySelector('#app').innerHTML = `<div class="container py-5"><div class="alert alert-danger mb-0">${escapeHtml(error instanceof Error ? error.message : 'Unable to load the register page.')}</div></div>`
})