import { getAuthState, signInWithEmail } from '../services/authService.js'
import { escapeHtml, setDocumentTitle } from '../utils/dom.js'
import { renderFormField, renderPageShell } from '../utils/page-layout.js'

function buildMainHtml(messageHtml = '') {
  return `
    <section class="py-5 py-lg-6">
      <div class="container">
        <div class="row justify-content-center align-items-center g-4">
          <div class="col-lg-5">
            <div class="auth-illustration p-4 p-xl-5 rounded-4 h-100">
              <span class="display-5">🔐</span>
              <h1 class="h2 fw-bold mt-3 mb-3">Welcome back to JokeArena</h1>
              <p class="text-body-secondary mb-0">Sign in to vote, publish jokes, and manage your profile.</p>
            </div>
          </div>

          <div class="col-lg-6">
            <div class="card form-card border-0 shadow-lg">
              <div class="card-body p-4 p-xl-5">
                <h2 class="h3 fw-bold mb-2">Login</h2>
                <p class="text-body-secondary mb-4">Use your JokeArena account to join the comedy battle.</p>
                ${messageHtml}
                <form id="login-form" novalidate>
                  ${renderFormField({ label: 'Email', type: 'email', name: 'email', placeholder: 'you@example.com' })}
                  ${renderFormField({ label: 'Password', type: 'password', name: 'password', placeholder: 'Enter your password' })}
                  <div class="d-flex justify-content-between align-items-center gap-3 mb-4">
                    <p class="small text-body-secondary mb-0">Need an account?</p>
                    <a class="small fw-semibold" href="/register.html">Register</a>
                  </div>
                  <button class="btn btn-warning btn-lg w-100" type="submit">Login</button>
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
  setDocumentTitle('Login')

  const authState = await getAuthState()
  if (authState.loggedIn) {
    window.location.assign('/index.html')
    return
  }

  const url = new URL(window.location.href)
  const messageHtml = url.searchParams.get('registered')
    ? '<div class="alert alert-success" role="alert">Registration completed. Sign in to continue.</div>'
    : ''

  document.querySelector('#app').innerHTML = renderPageShell('login', buildMainHtml(messageHtml), authState)

  const form = document.querySelector('#login-form')
  const emailInput = form.querySelector('input[name="email"]')
  const passwordInput = form.querySelector('input[name="password"]')
  const cardBody = form.parentElement

  form.addEventListener('submit', async (event) => {
    event.preventDefault()

    const email = emailInput.value.trim()
    const password = passwordInput.value

    if (!email || !password) {
      const errorMessage = '<div class="alert alert-danger" role="alert">Please enter both email and password.</div>'
      cardBody.querySelector('.alert')?.remove()
      cardBody.insertAdjacentHTML('afterbegin', errorMessage)
      return
    }

    try {
      const submitButton = form.querySelector('button[type="submit"]')
      submitButton.disabled = true
      submitButton.textContent = 'Signing in...'
      await signInWithEmail({ email, password })
      window.location.assign('/index.html')
    } catch (error) {
      cardBody.querySelector('.alert')?.remove()
      cardBody.insertAdjacentHTML('afterbegin', `<div class="alert alert-danger" role="alert">${escapeHtml(error instanceof Error ? error.message : 'Unable to sign in right now.')}</div>`)
      const submitButton = form.querySelector('button[type="submit"]')
      submitButton.disabled = false
      submitButton.textContent = 'Login'
    }
  })
}

boot().catch((error) => {
  document.querySelector('#app').innerHTML = `<div class="container py-5"><div class="alert alert-danger mb-0">${escapeHtml(error instanceof Error ? error.message : 'Unable to load the login page.')}</div></div>`
})