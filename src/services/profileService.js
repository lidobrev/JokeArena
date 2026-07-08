import { supabase } from './supabaseClient.js'
import { fetchRatingSummaries } from './ratingService.js'
import { logActivity } from './activityService.js'

function extractStoragePath(bucket, publicUrl) {
  if (!publicUrl) return null
  const marker = `/storage/v1/object/public/${bucket}/`
  const index = publicUrl.indexOf(marker)
  if (index === -1) return null
  return decodeURIComponent(publicUrl.slice(index + marker.length))
}

export async function deleteAvatarByUrl(avatarUrl) {
  const path = extractStoragePath('avatars', avatarUrl)
  if (!path) return

  const { error } = await supabase.storage.from('avatars').remove([path])
  if (error) {
    console.warn('Unable to delete avatar from storage:', error.message)
  }
}

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

export async function uploadAvatar(file, userId, previousAvatarUrl = null) {
  if (!file || !userId) {
    return null
  }

  if (previousAvatarUrl) {
    await deleteAvatarByUrl(previousAvatarUrl)
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

export async function removeAvatar(userId, avatarUrl) {
  if (avatarUrl) {
    await deleteAvatarByUrl(avatarUrl)
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({ avatar_url: null, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select('id, username, display_name, avatar_url, created_at, updated_at')
    .single()

  if (error) {
    throw error
  }

  await logActivity('remove_avatar', { user_id: userId })
  return data
}

export async function fetchCreators({ limit, page = 1, pageSize } = {}) {
  let query = supabase
    .from('profiles')
    .select('id, display_name, avatar_url, created_at')
    .order('created_at', { ascending: false })

  if (pageSize) {
    const from = Math.max(0, (page - 1) * pageSize)
    query = query.range(from, from + pageSize - 1)
  } else if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query
  if (error) throw error

  const profiles = data ?? []
  const ids = profiles.map((profile) => profile.id)
  const { data: jokes, error: jokesError } = ids.length
    ? await supabase.from('jokes').select('author_id, status').in('author_id', ids).eq('status', 'approved')
    : { data: [], error: null }

  if (jokesError) throw jokesError

  const jokeCountByUser = new Map()
  for (const joke of jokes ?? []) {
    jokeCountByUser.set(joke.author_id, (jokeCountByUser.get(joke.author_id) ?? 0) + 1)
  }

  return profiles.map((profile) => ({
    ...profile,
    displayName: profile.display_name || 'JokeArena creator',
    jokeCount: jokeCountByUser.get(profile.id) ?? 0,
    href: `/profile.html?id=${profile.id}`,
  }))
}

export async function fetchCreatorsCount() {
  const { count, error } = await supabase.from('profiles').select('id', { count: 'exact', head: true })
  if (error) throw error
  return count ?? 0
}
