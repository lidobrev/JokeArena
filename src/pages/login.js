import { renderFormField, renderPageShell } from '../utils/page-layout.js'

const mainHtml = `
  <section class="py-5 py-lg-6">
    <div class="container">
      <div class="row justify-content-center align-items-center g-4">
        <div class="col-lg-5">
          <div class="auth-illustration p-4 p-xl-5 rounded-4 h-100">
            <span class="display-5">🔐</span>
            <h1 class="h2 fw-bold mt-3 mb-3">Welcome back to JokeArena</h1>
            <p class="text-body-secondary mb-0">Sign in to vote, comment, and publish jokes after authentication is added later.</p>
          </div>
        </div>

        <div class="col-lg-6">
          <div class="card form-card border-0 shadow-lg">
            <div class="card-body p-4 p-xl-5">
              <h2 class="h3 fw-bold mb-2">Login</h2>
              <p class="text-body-secondary mb-4">Use your JokeArena account to join the comedy battle.</p>
              <form>
                ${renderFormField({ label: 'Email', type: 'email', name: 'email', placeholder: 'you@example.com' })}
                ${renderFormField({ label: 'Password', type: 'password', name: 'password', placeholder: 'Enter your password' })}
                <div class="d-flex justify-content-between align-items-center gap-3 mb-4">
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="" id="rememberMe" />
                    <label class="form-check-label" for="rememberMe">Remember me</label>
                  </div>
                  <a class="small fw-semibold" href="/register.html">Need an account?</a>
                </div>
                <button class="btn btn-warning btn-lg w-100" type="button">Login</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
`

document.querySelector('#app').innerHTML = renderPageShell('login', mainHtml)