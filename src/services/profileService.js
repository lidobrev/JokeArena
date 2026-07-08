import { supabase } from './supabaseClient.js'
import { fetchRatingSummaries } from './ratingService.js'
import { logActivity } from './activityService.js'

export async function fetchProfileByUserId(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url, created_at, updated_at')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data
}

export async function fetchProfileJokes(userId, { status } = {}) {
  let query = supabase
    .from('jokes')
    .select('id, title, content, image_url, status, created_at, updated_at, joke_categories(name, slug)')
    .eq('author_id', userId)
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) {
    throw error
  }

  const jokes = data ?? []
  const ratingSummaries = await fetchRatingSummaries(jokes.map((joke) => joke.id))

  return jokes.map((joke) => {
    const summary = ratingSummaries.get(joke.id) ?? { count: 0, average: 0 }

    return {
      id: joke.id,
      title: joke.title,
      content: joke.content,
      imageUrl: joke.image_url,
      status: joke.status,
      createdAt: joke.created_at,
      updatedAt: joke.updated_at,
      category: joke.joke_categories?.name ?? 'Uncategorized',
      categorySlug: joke.joke_categories?.slug ?? 'random',
      ratingAverage: summary.average,
      ratingCount: summary.count,
    }
  })
}

export async function updateProfile(userId, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select('id, username, display_name, avatar_url, created_at, updated_at')
    .single()

  if (error) {
    throw error
  }

  await logActivity('update_profile', { user_id: userId })
  return data
}

export async function uploadAvatar(file, userId) {
  if (!file || !userId) {
    return null
  }

  const extension = file.name.split('.').pop() || 'jpg'
  const path = `${userId}/avatar-${Date.now()}.${extension}`
  const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, {
    cacheControl: '3600',
    upsert: true,
  })

  if (uploadError) {
    throw uploadError
  }

  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  await logActivity('upload_avatar', { bucket: 'avatars', path })
  return data.publicUrl
}
