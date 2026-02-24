import { CURRENCY, LOCALE } from './config.js'

export function formatPrice(amount) {
  return new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: CURRENCY,
    minimumFractionDigits: 2,
  }).format(Number(amount) || 0)
}

export function formatDate(dateStr) {
  return new Intl.DateTimeFormat(LOCALE, {
    day: '2-digit', month: '2-digit', year: 'numeric'
  }).format(new Date(dateStr))
}

export function slugify(str) {
  return str.toLowerCase()
    .replace(/[àáâãäå]/g,'a').replace(/[èéêë]/g,'e')
    .replace(/[ìíîï]/g,'i').replace(/[òóôõö]/g,'o')
    .replace(/[ùúûü]/g,'u').replace(/[ç]/g,'c')
    .replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')
}
