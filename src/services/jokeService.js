import { supabase } from './supabaseClient.js'
import { fetchRatingSummaries } from './ratingService.js'
import { logActivity } from './activityService.js'

const JOKE_SELECT = 'id, title, content, image_url, status, created_at, updated_at, author_id, category_id, joke_categories(name, slug), profiles(display_name, username)'

function normalizeJoke(joke, ratingSummaries = new Map()) {
  const summary = ratingSummaries.get(joke.id) ?? { count: 0, average: 0 }
  const category = joke.joke_categories?.name ?? 'Uncategorized'
  const categorySlug = joke.joke_categories?.slug ?? 'random'
  const authorName = joke.profiles?.display_name || joke.profiles?.username || 'JokeArena'

  return {
    id: joke.id,
    title: joke.title,
    content: joke.content,
    imageUrl: joke.image_url,
    status: joke.status,
    createdAt: joke.created_at,
    updatedAt: joke.updated_at,
    authorId: joke.author_id,
    authorName,
    authorHref: `/profile.html?id=${joke.author_id}`,
    category,
    categorySlug,
    categoryId: joke.category_id,
    ratingAverage: summary.average,
    ratingCount: summary.count,
  }
}

async function fetchJokesWithRatings(queryBuilder) {
  const { data, error } = await queryBuilder

  if (error) {
    throw error
  }

  const jokes = data ?? []
  const ratingSummaries = await fetchRatingSummaries(jokes.map((joke) => joke.id))

  return jokes.map((joke) => normalizeJoke(joke, ratingSummaries))
}

export async function fetchCategories() {
  const { data, error } = await supabase
    .from('joke_categories')
    .select('id, name, slug, description')
    .order('name', { ascending: true })

  if (error) {
    throw error
  }

  return data ?? []
}

export async function fetchApprovedJokes({ limit, page = 1, pageSize } = {}) {
  let query = supabase
    .from('jokes')
    .select(JOKE_SELECT)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  if (pageSize) {
    const from = Math.max(0, (page - 1) * pageSize)
    query = query.range(from, from + pageSize - 1)
  } else if (limit) {
    query = query.limit(limit)
  }

  return fetchJokesWithRatings(query)
}

export async function fetchApprovedJokesCount() {
  const { count, error } = await supabase
    .from('jokes')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'approved')

  if (error) {
    throw error
  }

  return count ?? 0
}

export async function fetchTopRatedJokes({ limit = 9, page = 1, pageSize } = {}) {
  const allJokes = await fetchApprovedJokes()
  const sorted = allJokes
    .filter((joke) => joke.ratingCount > 0)
    .sort((a, b) => b.ratingAverage - a.ratingAverage || b.ratingCount - a.ratingCount || new Date(b.createdAt) - new Date(a.createdAt))

  if (pageSize) {
    const start = Math.max(0, (page - 1) * pageSize)
    return sorted.slice(start, start + pageSize)
  }

  return sorted.slice(0, limit)
}

export async function fetchApprovedJokeById(jokeId) {
  const { data, error } = await supabase
    .from('jokes')
    .select(JOKE_SELECT)
    .eq('id', jokeId)
    .eq('status', 'approved')
    .maybeSingle()

  if (error) {
    throw error
  }

  if (!data) {
    return null
  }

  const ratingSummaries = await fetchRatingSummaries([data.id])
  return normalizeJoke(data, ratingSummaries)
}

export async function fetchJokeByIdForAdmin(jokeId) {
  const { data, error } = await supabase.from('jokes').select(JOKE_SELECT).eq('id', jokeId).maybeSingle()

  if (error) {
    throw error
  }

  if (!data) {
    return null
  }

  const ratingSummaries = await fetchRatingSummaries([data.id])
  return normalizeJoke(data, ratingSummaries)
}

export async function fetchEditableJokeById(userId, jokeId) {
  const { data, error } = await supabase
    .from('jokes')
    .select(JOKE_SELECT)
    .eq('id', jokeId)
    .eq('author_id', userId)
    .eq('status', 'pending')
    .maybeSingle()

  if (error) {
    throw error
  }

  if (!data) {
    return null
  }

  const ratingSummaries = await fetchRatingSummaries([data.id])
  return normalizeJoke(data, ratingSummaries)
}

export async function fetchUserJokes(userId, { status } = {}) {
  let query = supabase.from('jokes').select(JOKE_SELECT).eq('author_id', userId).order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  return fetchJokesWithRatings(query)
}

export async function fetchPendingJokes() {
  return fetchJokesWithRatings(
    supabase.from('jokes').select(JOKE_SELECT).eq('status', 'pending').order('created_at', { ascending: false })
  )
}

export async function fetchAllJokesForAdmin({ authorId } = {}) {
  let query = supabase.from('jokes').select(JOKE_SELECT).order('created_at', { ascending: false })

  if (authorId) {
    query = query.eq('author_id', authorId)
  }

  return fetchJokesWithRatings(query)
}

export async function fetchEditSuggestions() {
  const { data, error } = await supabase
    .from('joke_edit_suggestions')
    .select('id, joke_id, suggested_title, suggested_content, status, admin_notes, created_at, reviewed_at, jokes(id, title, content, status, joke_categories(name, slug))')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data ?? []
}

export function extractStoragePath(bucket, publicUrl) {
  if (!publicUrl) return null
  const marker = `/storage/v1/object/public/${bucket}/`
  const index = publicUrl.indexOf(marker)
  if (index === -1) return null
  return decodeURIComponent(publicUrl.slice(index + marker.length))
}

export async function deleteJokeImageByUrl(imageUrl) {
  const path = extractStoragePath('joke-images', imageUrl)
  if (!path) return

  const { error } = await supabase.storage.from('joke-images').remove([path])
  if (error) {
    console.warn('Unable to delete joke image from storage:', error.message)
  }
}

export async function uploadJokeImage(file, userId) {
  if (!file || !userId) {
    return null
  }

  const extension = file.name.split('.').pop() || 'jpg'
  const path = `${userId}/${crypto.randomUUID()}.${extension}`
  const { error: uploadError } = await supabase.storage.from('joke-images').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })

  if (uploadError) {
    throw uploadError
  }

  const { data } = supabase.storage.from('joke-images').getPublicUrl(path)
  await logActivity('upload_joke_image', { bucket: 'joke-images', path })
  return data.publicUrl
}

export async function createJoke({ title, content, categoryId, authorId, imageUrl = null }) {
  const { data, error } = await supabase
    .from('jokes')
    .insert({
      title,
      content,
      category_id: categoryId,
      author_id: authorId,
      image_url: imageUrl,
      status: 'pending',
    })
    .select('id')
    .single()

  if (error) {
    throw error
  }

  await logActivity('create_joke', { joke_id: data.id, title, category_id: categoryId, has_image: Boolean(imageUrl) })
  return data
}

export async function updateJokeStatus(jokeId, status) {
  const { data, error } = await supabase.from('jokes').update({ status }).eq('id', jokeId).select('id, status').single()

  if (error) {
    throw error
  }

  await logActivity('admin_update_joke_status', { joke_id: jokeId, status })
  return data
}

export async function updateJokeDraft(jokeId, { title, content, categoryId, imageUrl }) {
  const updates = { title, content, category_id: categoryId }
  if (imageUrl !== undefined) {
    updates.image_url = imageUrl
  }

  const { data, error } = await supabase
    .from('jokes')
    .update(updates)
    .eq('id', jokeId)
    .select('id, title, content, category_id, image_url, status')
    .single()

  if (error) {
    throw error
  }

  await logActivity('update_joke_draft', { joke_id: jokeId })
  return data
}

export async function deleteJokeById(jokeId) {
  const joke = await fetchJokeByIdForAdmin(jokeId)
  if (!joke) {
    throw new Error('Joke not found.')
  }

  if (joke.imageUrl) {
    await deleteJokeImageByUrl(joke.imageUrl)
  }

  const { error } = await supabase.from('jokes').delete().eq('id', jokeId)
  if (error) {
    throw error
  }

  await logActivity('admin_delete_joke', { joke_id: jokeId, title: joke.title })
}

export async function updateEditSuggestionStatus(suggestionId, status, adminNotes = null) {
  const { data, error } = await supabase
    .from('joke_edit_suggestions')
    .update({
      status,
      admin_notes: adminNotes,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', suggestionId)
    .select('id, status')
    .single()

  if (error) {
    throw error
  }

  await logActivity('admin_update_edit_suggestion', { suggestion_id: suggestionId, status })
  return data
}
