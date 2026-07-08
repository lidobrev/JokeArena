import { renderFormField, renderPageShell } from '../utils/page-layout.js'

const mainHtml = `
  <section class="py-5 py-lg-6">
    <div class="container">
      <div class="row justify-content-center align-items-center g-4">
        <div class="col-lg-5">
          <div class="auth-illustration register-illustration p-4 p-xl-5 rounded-4 h-100">
            <span class="display-5">🎉</span>
            <h1 class="h2 fw-bold mt-3 mb-3">Create your JokeArena account</h1>
            <p class="text-body-secondary mb-0">Register to publish jokes, react to the feed, and build your profile once authentication is connected.</p>
          </div>
        </div>

        <div class="col-lg-6">
          <div class="card form-card border-0 shadow-lg">
            <div class="card-body p-4 p-xl-5">
              <h2 class="h3 fw-bold mb-2">Create Account</h2>
              <p class="text-body-secondary mb-4">Set up your Comedy Club identity for future use.</p>
              <form>
                ${renderFormField({ label: 'Username', type: 'text', name: 'username', placeholder: 'Your display name' })}
                ${renderFormField({ label: 'Email', type: 'email', name: 'email', placeholder: 'you@example.com' })}
                ${renderFormField({ label: 'Password', type: 'password', name: 'password', placeholder: 'Create a password' })}
                ${renderFormField({ label: 'Confirm Password', type: 'password', name: 'confirm-password', placeholder: 'Repeat your password' })}
                <div class="d-flex justify-content-between align-items-center gap-3 mb-4">
                  <p class="small text-body-secondary mb-0">Already have an account?</p>
                  <a class="small fw-semibold" href="/login.html">Login</a>
                </div>
                <button class="btn btn-warning btn-lg w-100" type="button">Create Account</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
`

document.querySelector('#app').innerHTML = renderPageShell('register', mainHtml)