import { fetchRatingSummaries, rateJoke } from '../services/ratingService.js'

function setStars(container, rating) {
  container.querySelectorAll('.rating-star').forEach((star) => {
    const starRating = Number(star.dataset.rating)
    star.classList.toggle('active', starRating <= rating)
    star.disabled = false
  })
}

function setLoading(container, loading) {
  container.querySelectorAll('.rating-star').forEach((star) => {
    star.disabled = loading
  })
  container.classList.toggle('is-saving', loading)
}

function showMessage(container, message, type = 'success') {
  const holder = container.closest('.rating-strip')
  if (!holder) return

  holder.querySelector('.rating-inline-message')?.remove()
  holder.insertAdjacentHTML(
    'beforeend',
    `<p class="rating-inline-message small mt-2 mb-0 text-${type === 'success' ? 'success' : 'danger'}">${message}</p>`
  )
}

export function bindInlineRatingControls(authState) {
  document.querySelectorAll('.rating-star[data-joke-id]').forEach((button) => {
    button.addEventListener('click', async (event) => {
      event.preventDefault()
      event.stopPropagation()

      if (!authState.loggedIn) {
        window.location.assign('/login.html')
        return
      }

      const jokeId = button.dataset.jokeId
      const rating = Number(button.dataset.rating)
      const container = button.closest('.rating-stars')

      if (!container || !jokeId || !rating) {
        return
      }

      try {
        setLoading(container, true)
        await rateJoke({ jokeId, userId: authState.user.id, rating })
        setStars(container, rating)

        const summaries = await fetchRatingSummaries([jokeId])
        const summary = summaries.get(jokeId)
        const summaryElement = document.querySelector(`[data-rating-summary-for="${jokeId}"]`)
        if (summaryElement && summary) {
          summaryElement.innerHTML = `<span class="joke-rating-summary-star" aria-hidden="true">★</span><span>${summary.average.toFixed(1)} / ${summary.count} votes</span>`
        }

        showMessage(container, 'Rating saved.')
      } catch (error) {
        setStars(container, Number(container.dataset.currentRating || 0))
        showMessage(container, error instanceof Error ? error.message : 'Unable to save your rating right now.', 'danger')
      }
    })
  })
}
