import { supabase } from './supabaseClient.js'
import { fetchRatingSummaries } from './ratingService.js'

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
    authorHref: '/profile.html',
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

export async function fetchApprovedJokes() {
  return fetchJokesWithRatings(
    supabase
      .from('jokes')
      .select(
        'id, title, content, image_url, status, created_at, updated_at, author_id, category_id, joke_categories(name, slug), profiles(display_name, username)'
      )
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
  )
}

export async function fetchApprovedJokeById(jokeId) {
  const { data, error } = await supabase
    .from('jokes')
    .select(
      'id, title, content, image_url, status, created_at, updated_at, author_id, category_id, joke_categories(name, slug), profiles(display_name, username)'
    )
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
  const { data, error } = await supabase
    .from('jokes')
    .select(
      'id, title, content, image_url, status, created_at, updated_at, author_id, category_id, joke_categories(name, slug), profiles(display_name, username)'
    )
    .eq('id', jokeId)
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

export async function fetchEditableJokeById(userId, jokeId) {
  const { data, error } = await supabase
    .from('jokes')
    .select(
      'id, title, content, image_url, status, created_at, updated_at, author_id, category_id, joke_categories(name, slug), profiles(display_name, username)'
    )
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

export async function fetchUserJokes(userId) {
  return fetchJokesWithRatings(
    supabase
      .from('jokes')
      .select(
        'id, title, content, image_url, status, created_at, updated_at, author_id, category_id, joke_categories(name, slug), profiles(display_name, username)'
      )
      .eq('author_id', userId)
      .order('created_at', { ascending: false })
  )
}

export async function fetchPendingJokes() {
  return fetchJokesWithRatings(
    supabase
      .from('jokes')
      .select(
        'id, title, content, image_url, status, created_at, updated_at, author_id, category_id, joke_categories(name, slug), profiles(display_name, username)'
      )
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
  )
}

export async function fetchEditSuggestions() {
  const { data, error } = await supabase
    .from('joke_edit_suggestions')
    .select(
      'id, joke_id, suggested_title, suggested_content, status, admin_notes, created_at, reviewed_at, jokes(id, title, content, status, joke_categories(name, slug))'
    )
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data ?? []
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

  return data
}

export async function updateJokeStatus(jokeId, status) {
  const { data, error } = await supabase
    .from('jokes')
    .update({ status })
    .eq('id', jokeId)
    .select('id, status')
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function updateJokeDraft(jokeId, { title, content, categoryId }) {
  const { data, error } = await supabase
    .from('jokes')
    .update({
      title,
      content,
      category_id: categoryId,
    })
    .eq('id', jokeId)
    .select('id, title, content, category_id, status')
    .single()

  if (error) {
    throw error
  }

  return data
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

  return data
}
