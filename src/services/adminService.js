import { supabase } from './supabaseClient.js'
import { deleteJokeImageByUrl, fetchAllJokesForAdmin } from './jokeService.js'
import { logActivity } from './activityService.js'

export async function fetchAdminProfiles() {
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_url, created_at, updated_at')
    .order('created_at', { ascending: false })

  if (profileError) {
    throw profileError
  }

  const userIds = (profiles ?? []).map((profile) => profile.id)
  const { data: roles, error: roleError } = userIds.length
    ? await supabase.from('user_roles').select('user_id, role').in('user_id', userIds)
    : { data: [], error: null }

  if (roleError) {
    throw roleError
  }

  const rolesByUser = new Map()
  for (const role of roles ?? []) {
    const list = rolesByUser.get(role.user_id) ?? []
    list.push(role.role)
    rolesByUser.set(role.user_id, list)
  }

  return (profiles ?? []).map((profile) => ({
    ...profile,
    roles: rolesByUser.get(profile.id) ?? [],
  }))
}

function extractStoragePath(bucket, publicUrl) {
  if (!publicUrl) return null
  const marker = `/storage/v1/object/public/${bucket}/`
  const index = publicUrl.indexOf(marker)
  if (index === -1) return null
  return decodeURIComponent(publicUrl.slice(index + marker.length))
}

async function deleteAvatarByUrl(avatarUrl) {
  const path = extractStoragePath('avatars', avatarUrl)
  if (!path) return

  const { error } = await supabase.storage.from('avatars').remove([path])
  if (error) {
    console.warn('Unable to remove avatar from storage:', error.message)
  }
}

export async function deleteUserAppData(userId) {
  if (!userId) {
    throw new Error('Missing user id.')
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, avatar_url')
    .eq('id', userId)
    .maybeSingle()

  if (profileError) {
    throw profileError
  }

  const jokes = await fetchAllJokesForAdmin({ authorId: userId })
  await Promise.all(jokes.filter((joke) => joke.imageUrl).map((joke) => deleteJokeImageByUrl(joke.imageUrl)))
  await deleteAvatarByUrl(profile?.avatar_url)

  const jokeIds = jokes.map((joke) => joke.id)

  if (jokeIds.length) {
    const { error: deleteSuggestionsForJokesError } = await supabase.from('joke_edit_suggestions').delete().in('joke_id', jokeIds)
    if (deleteSuggestionsForJokesError) throw deleteSuggestionsForJokesError

    const { error: deleteRatingsForJokesError } = await supabase.from('joke_ratings').delete().in('joke_id', jokeIds)
    if (deleteRatingsForJokesError) throw deleteRatingsForJokesError

    const { error: deleteJokesError } = await supabase.from('jokes').delete().in('id', jokeIds)
    if (deleteJokesError) throw deleteJokesError
  }

  const { error: deleteOwnRatingsError } = await supabase.from('joke_ratings').delete().eq('user_id', userId)
  if (deleteOwnRatingsError) throw deleteOwnRatingsError

  const { error: deleteOwnSuggestionsError } = await supabase.from('joke_edit_suggestions').delete().eq('suggested_by', userId)
  if (deleteOwnSuggestionsError) throw deleteOwnSuggestionsError

  const { error: clearReviewedByError } = await supabase.from('joke_edit_suggestions').update({ reviewed_by: null }).eq('reviewed_by', userId)
  if (clearReviewedByError) throw clearReviewedByError

  const { error: roleError } = await supabase.from('user_roles').delete().eq('user_id', userId)
  if (roleError) throw roleError

  const { error: profileDeleteError } = await supabase.from('profiles').delete().eq('id', userId)
  if (profileDeleteError) throw profileDeleteError

  await logActivity('admin_delete_user_data', { deleted_user_id: userId, deleted_jokes: jokes.length })
}

export async function setUserRole(userId, role, enabled) {
  if (!userId || !role) {
    throw new Error('Missing user or role.')
  }

  if (enabled) {
    const { error } = await supabase.from('user_roles').upsert({ user_id: userId, role }, { onConflict: 'user_id,role' })
    if (error) throw error
  } else {
    const { error } = await supabase.from('user_roles').delete().eq('user_id', userId).eq('role', role)
    if (error) throw error
  }

  await logActivity('admin_update_user_role', { user_id: userId, role, enabled })
}


export async function fetchAdminCategories() {
  const { data: categories, error: categoryError } = await supabase
    .from('joke_categories')
    .select('id, name, slug, description, created_at')
    .order('name', { ascending: true })

  if (categoryError) {
    throw categoryError
  }

  const { data: jokes, error: jokesError } = await supabase
    .from('jokes')
    .select('category_id')

  if (jokesError) {
    throw jokesError
  }

  const counts = new Map()
  for (const joke of jokes ?? []) {
    counts.set(joke.category_id, (counts.get(joke.category_id) ?? 0) + 1)
  }

  return (categories ?? []).map((category) => ({
    ...category,
    jokeCount: counts.get(category.id) ?? 0,
  }))
}

export function slugifyCategory(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export async function createCategory({ name, slug, description }) {
  const cleanName = String(name || '').trim()
  const cleanSlug = slugifyCategory(slug || cleanName)

  if (!cleanName || !cleanSlug) {
    throw new Error('Category name and slug are required.')
  }

  const { data, error } = await supabase
    .from('joke_categories')
    .insert({
      name: cleanName,
      slug: cleanSlug,
      description: String(description || '').trim() || null,
    })
    .select('id, name, slug, description')
    .single()

  if (error) {
    throw error
  }

  await logActivity('admin_create_category', { category_id: data.id, name: data.name })
  return data
}

export async function updateCategory(categoryId, { name, slug, description }) {
  const cleanName = String(name || '').trim()
  const cleanSlug = slugifyCategory(slug || cleanName)

  if (!categoryId || !cleanName || !cleanSlug) {
    throw new Error('Category id, name and slug are required.')
  }

  const { data, error } = await supabase
    .from('joke_categories')
    .update({
      name: cleanName,
      slug: cleanSlug,
      description: String(description || '').trim() || null,
    })
    .eq('id', categoryId)
    .select('id, name, slug, description')
    .single()

  if (error) {
    throw error
  }

  await logActivity('admin_update_category', { category_id: data.id, name: data.name })
  return data
}

export async function deleteCategory(categoryId) {
  if (!categoryId) {
    throw new Error('Missing category id.')
  }

  const { count, error: countError } = await supabase
    .from('jokes')
    .select('id', { count: 'exact', head: true })
    .eq('category_id', categoryId)

  if (countError) {
    throw countError
  }

  if ((count ?? 0) > 0) {
    throw new Error('This category has jokes. Move or delete those jokes before deleting the category.')
  }

  const { error } = await supabase
    .from('joke_categories')
    .delete()
    .eq('id', categoryId)

  if (error) {
    throw error
  }

  await logActivity('admin_delete_category', { category_id: categoryId })
}
