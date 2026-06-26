import { supabaseClient } from './supabase.js'

async function login(email, password) {
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  })
  if (error) throw error
  return data
}

async function logout() {
  const { error } = await supabaseClient.auth.signOut()
  if (error) throw error
}

async function getSession() {
  const { data, error } = await supabaseClient.auth.getSession()
  if (error) throw error
  return data.session
}

async function requireAuth() {
  const session = await getSession()
  if (!session) {
    window.location.href = '/admin/'
    return null
  }
  return session
}

async function redirectIfLoggedIn() {
  const session = await getSession()
  if (session) {
    window.location.replace('/admin/dashboard.html')
  }
}

export { login, logout, getSession, requireAuth, redirectIfLoggedIn }
