import { supabase } from './supabaseClient.js'
import { logActivity } from './activityService.js'

export async function fetchRatingSummaries(jokeIds = []) {
  if (!jokeIds.length) {
    return new Map()
  }

  const { data, error } = await supabase.from('joke_ratings').select('joke_id, rating').in('joke_id', jokeIds)

  if (error) {
    throw error
  }

  const summaryMap = new Map()

  for (const jokeId of jokeIds) {
    summaryMap.set(jokeId, { count: 0, average: 0 })
  }

  for (const row of data ?? []) {
    const existing = summaryMap.get(row.joke_id) ?? { count: 0, average: 0 }
    summaryMap.set(row.joke_id, {
      count: existing.count + 1,
      average: existing.average + Number(row.rating || 0),
    })
  }

  for (const [jokeId, summary] of summaryMap.entries()) {
    if (summary.count > 0) {
      summaryMap.set(jokeId, {
        count: summary.count,
        average: summary.average / summary.count,
      })
    }
  }

  return summaryMap
}

export async function fetchUserRating(jokeId, userId) {
  if (!jokeId || !userId) {
    return null
  }

  const { data, error } = await supabase
    .from('joke_ratings')
    .select('rating')
    .eq('joke_id', jokeId)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data?.rating ?? null
}

export async function rateJoke({ jokeId, userId, rating }) {
  const safeRating = Number(rating)
  if (!jokeId || !userId || safeRating < 1 || safeRating > 5) {
    throw new Error('Choose a rating between 1 and 5.')
  }

  const { data, error } = await supabase
    .from('joke_ratings')
    .upsert({ joke_id: jokeId, user_id: userId, rating: safeRating }, { onConflict: 'joke_id,user_id' })
    .select('id, joke_id, user_id, rating')
    .single()

  if (error) {
    throw error
  }

  await logActivity('rate_joke', { joke_id: jokeId, rating: safeRating })
  return data
}
