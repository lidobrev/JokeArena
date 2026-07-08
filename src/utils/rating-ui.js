import { fetchRatingSummaries, rateJoke } from '../services/ratingService.js'

function setStars(container, rating, className = 'active') {
  container.querySelectorAll('.rating-star').forEach((star) => {
    const starRating = Number(star.dataset.rating)
    star.classList.toggle(className, starRating <= rating)
    star.disabled = false
  })
}

function clearHoverStars(container) {
  container.querySelectorAll('.rating-star.hovered').forEach((star) => star.classList.remove('hovered'))
}

function setHoverStars(container, rating) {
  clearHoverStars(container)
  setStars(container, rating, 'hovered')
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

  const messageElement = holder.querySelector('.rating-inline-message')
  if (messageElement && type === 'success') {
    window.setTimeout(() => messageElement.remove(), 2200)
  }
}

export function bindInlineRatingControls(authState) {
  document.querySelectorAll('.rating-stars').forEach((container) => {
    const resetToCurrent = () => {
      clearHoverStars(container)
      setStars(container, Number(container.dataset.currentRating || 0))
    }

    container.querySelectorAll('.rating-star[data-joke-id]').forEach((button) => {
      button.addEventListener('mouseenter', () => setHoverStars(container, Number(button.dataset.rating || 0)))
      button.addEventListener('focus', () => setHoverStars(container, Number(button.dataset.rating || 0)))

      button.addEventListener('mouseleave', resetToCurrent)
      button.addEventListener('blur', resetToCurrent)

      button.addEventListener('click', async (event) => {
        event.preventDefault()
        event.stopPropagation()

        if (!authState.loggedIn) {
          window.location.assign('/login.html')
          return
        }

        const jokeId = button.dataset.jokeId
        const rating = Number(button.dataset.rating)

        if (!jokeId || !rating) {
          return
        }

        try {
          setLoading(container, true)
          await rateJoke({ jokeId, userId: authState.user.id, rating })
          container.dataset.currentRating = String(rating)
          clearHoverStars(container)
          setStars(container, rating)

          const summaries = await fetchRatingSummaries([jokeId])
          const summary = summaries.get(jokeId)
          const summaryElement = document.querySelector(`[data-rating-summary-for="${jokeId}"]`)
          if (summaryElement && summary) {
            summaryElement.innerHTML = `<span class="joke-rating-summary-star" aria-hidden="true">★</span><span>${summary.average.toFixed(1)} / ${summary.count} votes</span>`
          }

          showMessage(container, 'Rating saved.')
        } catch (error) {
          resetToCurrent()
          showMessage(container, error instanceof Error ? error.message : 'Unable to save your rating right now.', 'danger')
        } finally {
          setLoading(container, false)
        }
      })
    })
  })
}
