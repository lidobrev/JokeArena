import { supabase } from './supabaseClient.js'

export async function getSession() {
  const { data, error } = await supabase.auth.getSession()
  if (error) {
    throw error
  }

  return data.session ?? null
}

export async function getCurrentUser() {
  const session = await getSession()
  return session?.user ?? null
}

export async function getCurrentProfile() {
  const user = await getCurrentUser()
  if (!user) {
    return null
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url, bio, created_at, updated_at')
    .eq('id', user.id)
    .maybeSingle()

  if (error) {
    throw error
  }

  if (data) {
    return data
  }

  return {
    id: user.id,
    username: user.email?.split('@')[0] ?? 'user',
    display_name: user.user_metadata?.display_name ?? user.user_metadata?.username ?? user.email?.split('@')[0] ?? 'User',
    avatar_url: null,
    bio: null,
    created_at: user.created_at ?? new Date().toISOString(),
    updated_at: user.updated_at ?? new Date().toISOString(),
  }
}


export async function ensureCurrentProfile(user, usernameOverride = '') {
  if (!user?.id) {
    throw new Error('You must be logged in before creating profile data.')
  }

  const fallbackUsername = String(usernameOverride || user.user_metadata?.username || user.email?.split('@')[0] || 'user')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '') || `user_${user.id.slice(0, 8)}`

  const displayName = user.user_metadata?.display_name || user.user_metadata?.username || fallbackUsername

  const { data: existing, error: selectError } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url, bio, created_at, updated_at')
    .eq('id', user.id)
    .maybeSingle()

  if (selectError) {
    throw selectError
  }

  if (existing) {
    return existing
  }

  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: user.id,
      username: fallbackUsername,
      display_name: displayName,
      avatar_url: null,
      bio: null,
    })
    .select('id, username, display_name, avatar_url, bio, created_at, updated_at')
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function getUserRoles(userId) {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)

  if (error) {
    throw error
  }

  return (data ?? []).map((row) => row.role)
}

export async function getAuthState() {
  const session = await getSession()
  const user = session?.user ?? null

  if (!user) {
    return {
      loggedIn: false,
      isAdmin: false,
      session: null,
      user: null,
      profile: null,
      roles: [],
    }
  }

  const [profile, roles] = await Promise.all([getCurrentProfile(), getUserRoles(user.id)])

  return {
    loggedIn: true,
    isAdmin: roles.includes('admin'),
    session,
    user,
    profile,
    roles,
  }
}

export async function signUpWithEmail({ email, password, username }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: username,
        username,
      },
    },
  })

  if (error) {
    throw error
  }

  if (data.user) {
    try {
      await ensureCurrentProfile(data.user, username)
    } catch (profileError) {
      console.warn('Supabase Auth user was created, but profile creation needs attention:', profileError)
    }
  }

  return data
}

export async function signInWithEmail({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw error
  }

  return data
}

export async function updateUserEmail(email) {
  const { data, error } = await supabase.auth.updateUser({ email })

  if (error) {
    throw error
  }

  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) {
    throw error
  }
}

export function bindLogoutButton({ redirectTo = '/index.html' } = {}) {
  const button = document.querySelector('[data-logout-button]')
  if (!button) {
    return
  }

  button.addEventListener('click', async () => {
    try {
      await signOut()
      window.location.assign(redirectTo)
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Unable to log out right now.')
    }
  })
}
