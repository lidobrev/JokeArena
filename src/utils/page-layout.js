import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import '../styles/main.css'
import { escapeHtml } from './dom.js'
import { renderNavbar } from '../components/navbar.js'

export function renderPageShell(activePageId, mainHtml, authState = {}) {
  return `${renderNavbar(activePageId, authState)}<main>${mainHtml}</main>`
}

export function renderStars({ jokeId, currentRating = 0 } = {}) {
  return Array.from({ length: 5 }, (_, index) => {
    const rating = index + 1
    const active = rating <= Math.round(Number(currentRating) || 0)
    return `
      <button
        class="rating-star${active ? ' active' : ''}"
        type="button"
        data-joke-id="${escapeHtml(jokeId)}"
        data-rating="${rating}"
        aria-label="Rate ${rating} star${rating === 1 ? '' : 's'}"
      >★</button>
    `
  }).join('')
}

export function renderFeaturedJokeCard({ category, title = 'Untitled joke', text, author, authorHref = '/profile.html', reactions, rating = 0, href, id, imageUrl }) {
  const numericRating = Number(rating) || 0
  const safeCategory = escapeHtml(category)
  const safeTitle = escapeHtml(title)
  const safeText = escapeHtml(text)
  const safeAuthor = escapeHtml(author)
  const safeAuthorHref = escapeHtml(authorHref)
  const safeHref = escapeHtml(href)
  const safeId = escapeHtml(id || '')
  const safeImageUrl = imageUrl ? escapeHtml(imageUrl) : ''
  const authorMarkup = authorHref
    ? `<a class="joke-author-link fw-semibold" href="${safeAuthorHref}">By ${safeAuthor}</a>`
    : `<span class="joke-author-link fw-semibold">By ${safeAuthor}</span>`

  return `
    <div class="col-lg-4 col-md-6">
      <article class="card joke-card h-100 border-0 shadow-sm">
        <a class="joke-card-overlay" href="${safeHref}" aria-label="View joke details"></a>

        <div class="joke-card-image-wrap">
          ${safeImageUrl
            ? `<img class="joke-card-image" src="${safeImageUrl}" alt="${safeTitle}" loading="lazy" />`
            : `<div class="joke-card-image-placeholder" aria-hidden="true"><span></span></div>`}
        </div>

        <div class="card-body p-4 d-flex flex-column position-relative">
          <div class="d-flex align-items-center justify-content-between gap-3 mb-3">
            <span class="badge rounded-pill joke-category">${safeCategory}</span>
            <span class="joke-rating-summary"><span class="joke-rating-summary-star" aria-hidden="true">★</span><span>${numericRating.toFixed(1)} / ${escapeHtml(reactions)} votes</span></span>
          </div>

          <h3 class="h5 fw-bold mb-2">${safeTitle}</h3>
          <p class="text-body mb-4 flex-grow-1 joke-text">${safeText}</p>

          <div class="d-flex align-items-center justify-content-between gap-3 mb-3 small text-body-secondary">${authorMarkup}</div>

          <div class="rating-strip text-center position-relative">
            <p class="small text-body-secondary mb-2">Rate this joke</p>
            <div class="rating-stars" aria-label="Rate this joke from 1 to 5 stars">
              ${renderStars({ jokeId: safeId, currentRating: numericRating })}
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
        <input class="form-control form-control-lg" type="file" id="${safeName}" name="${safeName}" accept="image/*" />
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

export function renderMiniJokeCard({ id, category, title, reactions, status, imageUrl }) {
  const href = id ? `/joke-details.html?id=${escapeHtml(id)}` : '#'
  const statusBadge = status ? `<span class="badge rounded-pill ${status === 'approved' ? 'text-bg-success' : 'text-bg-warning'}">${escapeHtml(status)}</span>` : ''
  const imageMarkup = imageUrl
    ? `<img class="mini-joke-image" src="${escapeHtml(imageUrl)}" alt="${escapeHtml(title)}" loading="lazy" />`
    : '<div class="mini-joke-image mini-joke-image-placeholder" aria-hidden="true"></div>'

  return `
    <article class="mini-joke-card p-3 rounded-4 h-100">
      <a class="mini-joke-media d-block mb-3" href="${href}">${imageMarkup}</a>
      <div class="d-flex align-items-center justify-content-between mb-2 gap-2">
        <span class="badge rounded-pill joke-category">${escapeHtml(category)}</span>
        ${statusBadge}
      </div>
      <h3 class="h6 fw-bold mb-2"><a href="${href}">${escapeHtml(title)}</a></h3>
      <p class="small text-body-secondary mb-0">${escapeHtml(reactions)} votes</p>
    </article>
  `
}

export function renderJokeGrid(jokes) {
  if (!jokes.length) {
    return '<div class="alert alert-info mb-0" role="alert">No jokes to show yet.</div>'
  }

  return `<div class="row g-4">${jokes
    .map((joke) =>
      renderFeaturedJokeCard({
        id: joke.id,
        category: joke.category,
        title: joke.title,
        text: joke.content,
        author: joke.authorName,
        authorHref: joke.authorHref,
        reactions: joke.ratingCount,
        rating: joke.ratingAverage,
        href: `/joke-details.html?id=${joke.id}`,
        imageUrl: joke.imageUrl,
      }),
    )
    .join('')}</div>`
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
