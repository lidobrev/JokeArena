import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import '../styles/main.css'
import { renderNavbar } from '../components/navbar.js'

export function renderPlaceholderPage({
  pageTitle,
  eyebrow,
  lead,
  noteTitle,
  noteText,
  cards = [],
  activePageId = 'home',
}) {
  const cardsMarkup = cards
    .map(
      (cardText) => `
        <div class="col-md-4">
          <div class="info-card h-100 p-4 rounded-4">
            <p class="mb-0 text-body-secondary">${cardText}</p>
          </div>
        </div>
      `,
    )
    .join('')

  return `
    ${renderNavbar(activePageId)}
    <main>
      <section class="hero-section py-5 py-lg-6">
        <div class="container">
          <div class="row align-items-center g-4 g-lg-5">
            <div class="col-lg-7">
              <span class="eyebrow text-uppercase fw-semibold">${eyebrow}</span>
              <h1 class="display-4 fw-bold mt-3 mb-3">${pageTitle}</h1>
              <p class="lead text-body-secondary mb-0">${lead}</p>
            </div>

            <div class="col-lg-5">
              <div class="feature-card card border-0 shadow-lg">
                <div class="card-body p-4 p-xl-5">
                  <p class="text-uppercase text-body-secondary small fw-semibold mb-2">${noteTitle}</p>
                  <h2 class="h4 mb-3">Placeholder content</h2>
                  <p class="mb-0 text-body-secondary">${noteText}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="py-5 py-lg-6 border-top border-opacity-10">
        <div class="container">
          <div class="row g-4">
            ${cardsMarkup}
          </div>
        </div>
      </section>
    </main>
  `
}