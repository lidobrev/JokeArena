import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import '../styles/main.css'
import { escapeHtml } from './dom.js'
import { renderNavbar } from '../components/navbar.js'

export function renderPageShell(activePageId, mainHtml, authState = {}) {
  return `${renderNavbar(activePageId, authState)}<main>${mainHtml}</main>`
}

export function renderFeaturedJokeCard({ category, title = 'Untitled joke', text, author, authorHref = '/profile.html', reactions, rating = 0, href }) {
  const numericRating = Number(rating) || 0
  const safeCategory = escapeHtml(category)
  const safeTitle = escapeHtml(title)
  const safeText = escapeHtml(text)
  const safeAuthor = escapeHtml(author)
  const safeAuthorHref = escapeHtml(authorHref)
  const safeHref = escapeHtml(href)
  const authorMarkup = authorHref ? `<a class="joke-author-link fw-semibold" href="${safeAuthorHref}">By ${safeAuthor}</a>` : `<span class="joke-author-link fw-semibold">By ${safeAuthor}</span>`

  const starsMarkup = Array.from({ length: 5 }, (_, index) => `
    <button class="rating-star" type="button" aria-label="Rate ${index + 1} star${index === 0 ? '' : 's'}">
      ★
    </button>
  `).join('')

  return `
    <div class="col-lg-4 col-md-6">
      <article class="card joke-card h-100 border-0 shadow-sm">
        <a class="joke-card-overlay" href="${safeHref}" aria-label="View joke details"></a>

        <div class="card-body p-4 d-flex flex-column position-relative">
          <div class="d-flex align-items-center justify-content-between gap-3 mb-3">
            <span class="badge rounded-pill joke-category">${safeCategory}</span>
            <span class="joke-rating-summary"><span class="joke-rating-summary-star" aria-hidden="true">★</span><span>${numericRating.toFixed(1)} / ${reactions} votes</span></span>
          </div>

          <h3 class="h5 fw-bold mb-2">${safeTitle}</h3>
          <p class="text-body mb-4 flex-grow-1 joke-text">${safeText}</p>

          <div class="d-flex align-items-center justify-content-between gap-3 mb-3 small text-body-secondary">${authorMarkup}</div>

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

export function renderFormField({ label, type = 'text', name, placeholder, value = '', options = [], selectedValue = '' }) {
  const safeLabel = escapeHtml(label)
  const safeName = escapeHtml(name)
  const safePlaceholder = escapeHtml(placeholder)
  const safeValue = escapeHtml(value)

  if (type === 'textarea') {
    return `
      <div class="mb-3">
        <label class="form-label fw-semibold" for="${safeName}">${safeLabel}</label>
        <textarea class="form-control form-control-lg" id="${safeName}" name="${safeName}" rows="6" placeholder="${safePlaceholder}">${safeValue}</textarea>
      </div>
    `
  }

  if (type === 'select') {
    return `
      <div class="mb-3">
        <label class="form-label fw-semibold" for="${safeName}">${safeLabel}</label>
        <select class="form-select form-select-lg" id="${safeName}" name="${safeName}">
          ${options
            .map((option) => {
              const selectedAttribute = String(option.value) === String(selectedValue) ? ' selected' : ''
              return `<option value="${escapeHtml(option.value)}"${selectedAttribute}>${escapeHtml(option.label)}</option>`
            })
            .join('')}
        </select>
      </div>
    `
  }

  if (type === 'file') {
    return `
      <div class="mb-3">
        <label class="form-label fw-semibold" for="${safeName}">${safeLabel}</label>
        <input class="form-control form-control-lg" type="file" id="${safeName}" name="${safeName}" />
      </div>
    `
  }

  return `
    <div class="mb-3">
      <label class="form-label fw-semibold" for="${safeName}">${safeLabel}</label>
      <input class="form-control form-control-lg" type="${escapeHtml(type)}" id="${safeName}" name="${safeName}" placeholder="${safePlaceholder}" value="${safeValue}" />
    </div>
  `
}

export function renderStatCard({ icon, label, value }) {
  return `
    <div class="col-sm-6 col-lg-4">
      <div class="stat-card h-100 p-4 rounded-4">
        <div class="stat-icon mb-3">${escapeHtml(icon)}</div>
        <p class="text-uppercase small fw-semibold text-body-secondary mb-2">${escapeHtml(label)}</p>
        <h3 class="h4 mb-0">${escapeHtml(value)}</h3>
      </div>
    </div>
  `
}

export function renderMiniJokeCard({ category, title, reactions }) {
  return `
    <article class="mini-joke-card p-3 rounded-4 h-100">
      <div class="d-flex align-items-center justify-content-between mb-2">
        <span class="badge rounded-pill joke-category">${escapeHtml(category)}</span>
        <span class="small text-body-secondary">${escapeHtml(reactions)} reactions</span>
      </div>
      <h3 class="h6 fw-bold mb-2">${escapeHtml(title)}</h3>
      <p class="small text-body-secondary mb-0">A joke entry from the current profile.</p>
    </article>
  `
}

export function renderModerationRow({ type, item, status, reportedBy, updatedAt }) {
  return `
    <tr>
      <td>${escapeHtml(type)}</td>
      <td>${escapeHtml(item)}</td>
      <td><span class="badge rounded-pill text-bg-warning">${escapeHtml(status)}</span></td>
      <td>${escapeHtml(reportedBy)}</td>
      <td>${escapeHtml(updatedAt)}</td>
    </tr>
  `
}