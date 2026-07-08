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
