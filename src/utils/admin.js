// ============================================================
// AUTHENTIFICATION ADMIN — côté client, basée sur hash
// ============================================================
import { ADMIN_PASSWORD_HASH, ADMIN_SESSION_HOURS } from './config.js'

const SESSION_KEY = 'ds_admin_session'

// Génère un hash simple depuis un mot de passe
// En production utilisez SHA-256 via SubtleCrypto
export async function hashPassword(password) {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Vérifie le mot de passe
export async function checkPassword(inputPassword) {
  const inputHash = await hashPassword(inputPassword)
  return inputHash === ADMIN_PASSWORD_HASH
}

// Crée une session admin
export function createSession() {
  const session = {
    token: crypto.randomUUID(),
    expiresAt: Date.now() + ADMIN_SESSION_HOURS * 60 * 60 * 1000,
  }
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return session.token
}

// Vérifie si la session est valide
export function isSessionValid() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return false
    const { expiresAt } = JSON.parse(raw)
    return Date.now() < expiresAt
  } catch { return false }
}

// Récupère le token de session
export function getSessionToken() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const { token, expiresAt } = JSON.parse(raw)
    if (Date.now() >= expiresAt) return null
    return token
  } catch { return null }
}

// Détruit la session
export function destroySession() {
  sessionStorage.removeItem(SESSION_KEY)
}

// ============================================================
// UTILITAIRE : génère un hash SHA-256 depuis la console
// Ouvrez la console et tapez :
//   import('/src/utils/admin.js').then(m => m.hashPassword('mon_mdp').then(h => console.log(h)))
// Copiez le résultat dans ADMIN_PASSWORD_HASH dans config.js
// ============================================================
