import { supabase } from './supabaseClient.js'

export async function logActivity(action, metadata = {}) {
  try {
    const { data: sessionData } = await supabase.auth.getSession()
    const userId = sessionData.session?.user?.id ?? null

    if (!userId) {
      return null
    }

    const { data, error } = await supabase
      .from('activity_logs')
      .insert({
        user_id: userId,
        action,
        metadata,
      })
      .select('id')
      .single()

    if (error) {
      console.warn('Activity log failed:', error.message)
      return null
    }

    return data
  } catch (error) {
    console.warn('Activity log failed:', error)
    return null
  }
}

export async function fetchActivityLogs({ limit = 100 } = {}) {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('id, user_id, action, metadata, created_at, profiles(display_name)')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw error
  }

  return data ?? []
}
