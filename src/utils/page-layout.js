import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import '../styles/main.css'
import { renderNavbar } from '../components/navbar.js'

export function renderPageShell(activePageId, mainHtml) {
  return `${renderNavbar(activePageId)}<main>${mainHtml}</main>`
}

export function renderFeaturedJokeCard({ category, text, author, authorHref = '/profile.html', reactions, rating = 0, href }) {
  const numericRating = Number(rating) || 0

  const starsMarkup = Array.from({ length: 5 }, (_, index) => `
    <button class="rating-star" type="button" aria-label="Rate ${index + 1} star${index === 0 ? '' : 's'}">
      ★
    </button>
  `).join('')

  return `
    <div class="col-lg-4 col-md-6">
      <article class="card joke-card h-100 border-0 shadow-sm">
        <a class="joke-card-overlay" href="${href}" aria-label="View joke details"></a>

        <div class="card-body p-4 d-flex flex-column position-relative">
          <div class="d-flex align-items-center justify-content-between gap-3 mb-3">
            <span class="badge rounded-pill joke-category">${category}</span>
            <span class="joke-rating-summary"><span class="joke-rating-summary-star" aria-hidden="true">★</span><span>${numericRating.toFixed(1)} / ${reactions} votes</span></span>
          </div>

          <p class="text-body mb-4 flex-grow-1 joke-text">${text}</p>

          <div class="d-flex align-items-center justify-content-between gap-3 mb-3 small text-body-secondary">
            <a class="joke-author-link fw-semibold" href="${authorHref}">By ${author}</a>
          </div>

          <div class="rating-strip text-center position-relative">
            <p class="small text-body-secondary mb-2">Rate this joke</p>
            <div class="rating-stars" aria-label="Rate this joke from 1 to 5 stars">
              ${starsMarkup}
            </div>
          </div>
        </div>
      </article>
    </div>
  `
}

export function renderFormField({ label, type = 'text', name, placeholder, value = '', options = [] }) {
  if (type === 'textarea') {
    return `
      <div class="mb-3">
        <label class="form-label fw-semibold" for="${name}">${label}</label>
        <textarea class="form-control form-control-lg" id="${name}" name="${name}" rows="6" placeholder="${placeholder}">${value}</textarea>
      </div>
    `
  }

  if (type === 'select') {
    return `
      <div class="mb-3">
        <label class="form-label fw-semibold" for="${name}">${label}</label>
        <select class="form-select form-select-lg" id="${name}" name="${name}">
          ${options.map((option) => `<option value="${option.value}">${option.label}</option>`).join('')}
        </select>
      </div>
    `
  }

  if (type === 'file') {
    return `
      <div class="mb-3">
        <label class="form-label fw-semibold" for="${name}">${label}</label>
        <input class="form-control form-control-lg" type="file" id="${name}" name="${name}" />
      </div>
    `
  }

  return `
    <div class="mb-3">
      <label class="form-label fw-semibold" for="${name}">${label}</label>
      <input class="form-control form-control-lg" type="${type}" id="${name}" name="${name}" placeholder="${placeholder}" value="${value}" />
    </div>
  `
}

export function renderStatCard({ icon, label, value }) {
  return `
    <div class="col-sm-6 col-lg-4">
      <div class="stat-card h-100 p-4 rounded-4">
        <div class="stat-icon mb-3">${icon}</div>
        <p class="text-uppercase small fw-semibold text-body-secondary mb-2">${label}</p>
        <h3 class="h4 mb-0">${value}</h3>
      </div>
    </div>
  `
}

export function renderMiniJokeCard({ category, title, reactions }) {
  return `
    <article class="mini-joke-card p-3 rounded-4 h-100">
      <div class="d-flex align-items-center justify-content-between mb-2">
        <span class="badge rounded-pill joke-category">${category}</span>
        <span class="small text-body-secondary">${reactions} reactions</span>
      </div>
      <h3 class="h6 fw-bold mb-2">${title}</h3>
      <p class="small text-body-secondary mb-0">A joke entry from the current profile.</p>
    </article>
  `
}

export function renderModerationRow({ type, item, status, reportedBy, updatedAt }) {
  return `
    <tr>
      <td>${type}</td>
      <td>${item}</td>
      <td><span class="badge rounded-pill text-bg-warning">${status}</span></td>
      <td>${reportedBy}</td>
      <td>${updatedAt}</td>
    </tr>
  `
}