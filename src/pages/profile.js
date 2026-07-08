import { renderMiniJokeCard, renderPageShell } from '../utils/page-layout.js'

const userJokes = [
  { category: 'Programming', title: 'CSS walked into a bar', reactions: 76 },
  { category: 'Office', title: 'The calendar and the meeting', reactions: 54 },
  { category: 'Food', title: 'The taco that told a secret', reactions: 31 },
]

const mainHtml = `
  <section class="py-5 py-lg-6">
    <div class="container">
      <div class="row g-4 align-items-start">
        <div class="col-lg-4">
          <div class="card profile-card border-0 shadow-lg">
            <div class="card-body p-4 p-xl-5 text-center">
              <div class="avatar-placeholder mx-auto mb-3">AJ</div>
              <h1 class="h3 fw-bold mb-2">Alex Johnson</h1>
              <p class="text-body-secondary mb-3">Comedy enthusiast · JokeArena regular</p>
              <p class="mb-4">Writing clever setups, collecting reactions, and testing punchlines one post at a time.</p>
              <label class="btn btn-outline-dark w-100">
                Upload avatar
                <input class="d-none" type="file" />
              </label>
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
                <span class="badge rounded-pill joke-pill">Static profile</span>
              </div>
              <p class="text-body-secondary mb-0">Alex writes clean puns, loves bad wordplay, and always brings the setup before the punchline.</p>
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
              <div class="row g-3">
                ${userJokes.map(renderMiniJokeCard).join('')}
              </div>
            </div>
          </div>

          <div class="card profile-card border-0 shadow-sm">
            <div class="card-body p-4 p-xl-5">
              <h2 class="h4 fw-bold mb-3">Avatar upload</h2>
              <p class="text-body-secondary mb-4">Choose a profile image later when account storage is connected.</p>
              <input class="form-control form-control-lg" type="file" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
`

document.querySelector('#app').innerHTML = renderPageShell('', mainHtml)