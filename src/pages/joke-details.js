import { renderPageShell } from '../utils/page-layout.js'

const mainHtml = `
  <section class="py-5 py-lg-6">
    <div class="container">
      <div class="row justify-content-center g-4">
        <div class="col-lg-8">
          <article class="card joke-details-card border-0 shadow-lg mb-4">
            <div class="card-body p-4 p-xl-5">
              <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
                <span class="badge rounded-pill joke-category">Programming</span>
                <span class="small text-body-secondary">By Mia Carter · 128 reactions</span>
              </div>
              <h1 class="display-6 fw-bold mb-3">The function that needed space</h1>
              <p class="text-body-secondary mb-4">I told my code to stop being so dramatic. It said it just needed a little space and some semicolons.</p>
              <div class="d-flex flex-wrap gap-2 mb-4">
                <span class="badge rounded-pill joke-pill">Laughs: 128</span>
                <span class="badge rounded-pill joke-pill">Comments: 14</span>
                <span class="badge rounded-pill joke-pill">Posted 2 hours ago</span>
              </div>
              <div class="d-flex flex-wrap gap-3">
                <button class="btn btn-warning" type="button">Add Laugh</button>
                <button class="btn btn-outline-dark" type="button">Comment</button>
              </div>
            </div>
          </article>

          <section class="card comments-card border-0 shadow-sm mb-4">
            <div class="card-body p-4 p-xl-5">
              <div class="d-flex align-items-center justify-content-between gap-3 mb-4">
                <h2 class="h4 fw-bold mb-0">Comments Preview</h2>
                <span class="badge rounded-pill text-bg-light">Static example</span>
              </div>
              <div class="comment-item mb-3">
                <div class="d-flex justify-content-between gap-3 mb-1"><strong>Alex</strong><span class="small text-body-secondary">12 min ago</span></div>
                <p class="mb-0 text-body-secondary">This joke deserves a standing ovation and a keyboard shortcut.</p>
              </div>
              <div class="comment-item">
                <div class="d-flex justify-content-between gap-3 mb-1"><strong>Jules</strong><span class="small text-body-secondary">41 min ago</span></div>
                <p class="mb-0 text-body-secondary">The semicolon line really carried this one.</p>
              </div>
            </div>
          </section>

          <div class="d-flex flex-wrap gap-3">
            <a class="btn btn-warning" href="/create-joke.html">Write a joke</a>
            <a class="btn btn-outline-dark" href="/index.html">Back to home</a>
          </div>
        </div>
      </div>
    </div>
  </section>
`

document.querySelector('#app').innerHTML = renderPageShell('', mainHtml)