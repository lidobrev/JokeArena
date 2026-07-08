import { renderModerationRow, renderPageShell, renderStatCard } from '../utils/page-layout.js'

const stats = [
  { icon: '🃏', label: 'Total jokes', value: '84' },
  { icon: '👥', label: 'Registered users', value: '31' },
  { icon: '🚩', label: 'Open reports', value: '6' },
]

const moderationRows = [
  { type: 'Joke', item: 'The function that needed space', status: 'Review', reportedBy: 'Mia', updatedAt: 'Today, 10:42' },
  { type: 'Comment', item: 'Too many puns in one thread', status: 'Approved', reportedBy: 'Alex', updatedAt: 'Today, 09:18' },
  { type: 'Joke', item: 'Meeting minutes with overtime', status: 'Flagged', reportedBy: 'Nina', updatedAt: 'Yesterday, 16:05' },
]

const mainHtml = `
  <section class="py-5 py-lg-6">
    <div class="container">
      <div class="page-header mb-4">
        <span class="badge rounded-pill joke-pill mb-3">Admin dashboard</span>
        <h1 class="display-5 fw-bold mb-3">Admin Page</h1>
        <p class="lead text-body-secondary mb-0">Moderate jokes, review reports, and manage platform activity once the admin role check is added later.</p>
      </div>

      <div class="row g-4 mb-4">
        ${stats.map(renderStatCard).join('')}
      </div>

      <div class="card admin-table-card border-0 shadow-sm mb-4">
        <div class="card-body p-4 p-xl-5">
          <div class="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
            <div>
              <p class="text-uppercase small fw-semibold text-body-secondary mb-1">Moderation queue</p>
              <h2 class="h4 fw-bold mb-0">Example moderation rows</h2>
            </div>
            <span class="badge rounded-pill text-bg-warning">Static data</span>
          </div>
          <div class="table-responsive">
            <table class="table align-middle mb-0">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Item</th>
                  <th>Status</th>
                  <th>Reported by</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                ${moderationRows.map(renderModerationRow).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="alert alert-warning mb-0" role="alert">Admin role checks will be implemented later.</div>
    </div>
  </section>
`

document.querySelector('#app').innerHTML = renderPageShell('', mainHtml)