// ============================================================
// GOOGLE APPS SCRIPT — DigitalStore Backend
// ============================================================
// INSTRUCTIONS :
// 1. Allez sur https://sheets.new → créez une feuille "DigitalStore"
// 2. Ajoutez 2 onglets : "products" et "promos"
// 3. Extensions > Apps Script → Collez ce code
// 4. Déployez : Déployer > Nouveau déploiement > Type = Application Web
//    - Exécuter en tant que : Moi
//    - Qui peut y accéder : Tout le monde
// 5. Copiez l'URL et collez-la dans src/utils/config.js (APPS_SCRIPT_URL)
// ============================================================

const SHEET_NAME_PRODUCTS = 'products'
const SHEET_NAME_PROMOS   = 'promos'

// Token admin (CHANGEZ-LE — utilisez une chaîne secrète longue)
const ADMIN_TOKEN = 'CHANGEZ-MOI-TOKEN-SECRET-LONG'

// ============================================================
// GET — lecture des données
// ============================================================
function doGet(e) {
  const action = e.parameter.action || 'read'

  if (action === 'read') {
    const products = readSheet(SHEET_NAME_PRODUCTS)
    const promos   = readSheet(SHEET_NAME_PROMOS)
    return jsonResponse({ products, promos })
  }

  return jsonResponse({ error: 'Action inconnue' })
}

// ============================================================
// POST — écriture des données (admin authentifié)
// ============================================================
function doPost(e) {
  let body
  try { body = JSON.parse(e.postData.contents) }
  catch { return jsonResponse({ error: 'JSON invalide' }) }

  // Vérification du token admin
  if (body.adminToken !== ADMIN_TOKEN) {
    return jsonResponse({ error: 'Non autorise' })
  }

  const action = body.action || 'write'

  if (action === 'write') {
    if (body.products) writeSheet(SHEET_NAME_PRODUCTS, body.products, PRODUCT_COLUMNS)
    if (body.promos)   writeSheet(SHEET_NAME_PROMOS,   body.promos,   PROMO_COLUMNS)
    return jsonResponse({ success: true })
  }

  return jsonResponse({ error: 'Action inconnue' })
}

// ============================================================
// COLONNES
// ============================================================
const PRODUCT_COLUMNS = [
  'id','name','tagline','description','price','salePrice',
  'image','category','tags','featured','active',
  'driveLink','stripeLink','paypalAmount','fileSize','rating','reviewCount'
]

const PROMO_COLUMNS = [
  'code','type','value','description','expiresAt',
  'maxUses','currentUses','active','minOrderAmount'
]

// ============================================================
// HELPERS
// ============================================================
function readSheet(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  const sheet = ss.getSheetByName(sheetName)
  if (!sheet) return []

  const data = sheet.getDataRange().getValues()
  if (data.length < 2) return []

  const headers = data[0]
  const rows = data.slice(1)

  return rows
    .filter(row => row.some(cell => cell !== '' && cell !== null))
    .map(row => {
      const obj = {}
      headers.forEach((h, i) => {
        let val = row[i]
        // Convertir les booléens
        if (val === 'TRUE' || val === true)  val = true
        if (val === 'FALSE' || val === false) val = false
        // Convertir les nombres
        if (val !== '' && !isNaN(Number(val)) && typeof val !== 'boolean') val = Number(val)
        obj[h] = val
      })
      return obj
    })
}

function writeSheet(sheetName, data, columns) {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  let sheet = ss.getSheetByName(sheetName)

  // Créer l'onglet s'il n'existe pas
  if (!sheet) {
    sheet = ss.insertSheet(sheetName)
  }

  // Vider et réécrire
  sheet.clearContents()

  // En-têtes
  sheet.getRange(1, 1, 1, columns.length).setValues([columns])

  // Données
  if (data.length > 0) {
    const rows = data.map(item =>
      columns.map(col => {
        const val = item[col]
        if (val === null || val === undefined) return ''
        return val
      })
    )
    sheet.getRange(2, 1, rows.length, columns.length).setValues(rows)
  }
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON)
}
