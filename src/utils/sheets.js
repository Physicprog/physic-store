// ============================================================
// GOOGLE SHEETS — Lecture et écriture via Apps Script Web App
// ============================================================
import { APPS_SCRIPT_URL, DEFAULT_PRODUCTS, DEFAULT_PROMOS } from './config.js'

const CACHE_KEY = 'ds_sheets_cache'
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

// ---------- HELPERS ----------

function getCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { data, ts } = JSON.parse(raw)
    if (Date.now() - ts > CACHE_TTL) return null
    return data
  } catch { return null }
}

function setCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }))
  } catch {}
}

export function clearCache() {
  localStorage.removeItem(CACHE_KEY)
}

// ---------- FETCH DEPUIS GOOGLE SHEETS ----------

export async function fetchStoreData() {
  // 1. Essayer le cache
  const cached = getCache()
  if (cached) return cached

  // 2. Si Apps Script non configuré, utiliser les données par défaut
  if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes('YOUR_SCRIPT_ID')) {
    const fallback = { products: DEFAULT_PRODUCTS, promos: DEFAULT_PROMOS }
    setCache(fallback)
    return fallback
  }

  // 3. Fetch depuis Google Apps Script
  try {
    const res = await fetch(`${APPS_SCRIPT_URL}?action=read`, {
      method: 'GET',
      mode: 'cors',
    })
    if (!res.ok) throw new Error('HTTP ' + res.status)
    const data = await res.json()
    if (data.error) throw new Error(data.error)
    setCache(data)
    return data
  } catch (err) {
    console.warn('[Sheets] Erreur fetch, fallback local:', err.message)
    const fallback = { products: DEFAULT_PRODUCTS, promos: DEFAULT_PROMOS }
    setCache(fallback)
    return fallback
  }
}

// ---------- ÉCRITURE DEPUIS L'ADMIN ----------

export async function writeStoreData(payload, adminToken) {
  if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes('YOUR_SCRIPT_ID')) {
    // Mode dev : sauvegarder dans localStorage uniquement
    const current = getCache() || { products: DEFAULT_PRODUCTS, promos: DEFAULT_PROMOS }
    const updated = { ...current, ...payload }
    setCache(updated)
    clearCache() // force re-fetch
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data: updated, ts: Date.now() }))
    return { success: true, mode: 'local' }
  }

  try {
    const res = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'write', adminToken, ...payload }),
    })
    if (!res.ok) throw new Error('HTTP ' + res.status)
    const data = await res.json()
    if (data.error) throw new Error(data.error)
    clearCache()
    return { success: true }
  } catch (err) {
    throw new Error('Erreur sauvegarde: ' + err.message)
  }
}

// ---------- UTILITAIRES PRODUITS ----------

export function getActiveProducts(products) {
  return (products || []).filter(p => p.active)
}

export function getFeaturedProducts(products) {
  return (products || []).filter(p => p.featured && p.active)
}

export function getProductById(products, id) {
  return (products || []).find(p => p.id === id)
}

export function getCategories(products) {
  return [...new Set((products || []).map(p => p.category))]
}

export function getFinalPrice(product) {
  return product.salePrice != null && product.salePrice !== '' && product.salePrice > 0
    ? Number(product.salePrice)
    : Number(product.price)
}

export function getDiscountPct(product) {
  if (!product.salePrice || Number(product.salePrice) <= 0) return 0
  return Math.round((1 - Number(product.salePrice) / Number(product.price)) * 100)
}

export function validatePromo(promos, code, cartTotal) {
  if (!promos || !code) return { valid: false, error: 'Code invalide' }
  const promo = promos.find(p => p.code.toUpperCase() === code.trim().toUpperCase())
  if (!promo) return { valid: false, error: 'Code promo introuvable' }
  if (!promo.active) return { valid: false, error: 'Code promo inactif' }
  if (new Date(promo.expiresAt) < new Date()) return { valid: false, error: 'Code promo expiré' }
  if (Number(promo.currentUses) >= Number(promo.maxUses)) return { valid: false, error: 'Code promo épuisé' }
  if (cartTotal < Number(promo.minOrderAmount)) return {
    valid: false,
    error: `Commande minimum : ${promo.minOrderAmount} EUR`
  }
  let discount = 0
  if (promo.type === 'percentage') discount = (cartTotal * Number(promo.value)) / 100
  else discount = Math.min(Number(promo.value), cartTotal)
  return { valid: true, discount: Math.round(discount * 100) / 100, promo }
}
