import { useState, useEffect } from 'react'
import { useStore } from '../hooks/useStore.jsx'
import { isSessionValid, checkPassword, createSession, destroySession } from '../utils/admin.js'
import { getSessionToken } from '../utils/admin.js'
import { formatPrice } from '../utils/format.js'
import { getFinalPrice, getDiscountPct } from '../utils/sheets.js'
import { slugify } from '../utils/format.js'
import './AdminPage.css'

// ---------------------------------------------------------------
// PANEL ADMIN — protégé par mot de passe (hash SHA-256)
// Accès : /admin
// Données : lues depuis Google Sheets, modifiables ici
// ---------------------------------------------------------------

const EMPTY_PRODUCT = {
  id: '', name: '', tagline: '', description: '', price: '', salePrice: '',
  image: '', category: 'Design', tags: '', featured: false, active: true,
  driveLink: '', stripeLink: '', paypalAmount: '', fileSize: '', rating: '', reviewCount: '',
}

const EMPTY_PROMO = {
  code: '', type: 'percentage', value: '', description: '',
  expiresAt: '', maxUses: '', currentUses: 0, active: true, minOrderAmount: 0,
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(isSessionValid())
  const [pw, setPw] = useState('')
  const [pwErr, setPwErr] = useState('')
  const [pwLoading, setPwLoading] = useState(false)
  const [tab, setTab] = useState('products')

  const handleLogin = async (e) => {
    e.preventDefault()
    setPwLoading(true); setPwErr('')
    try {
      const ok = await checkPassword(pw)
      if (ok) { createSession(); setAuthed(true) }
      else { setPwErr('Mot de passe incorrect.') }
    } catch { setPwErr('Erreur de verification.') }
    setPwLoading(false)
  }

  if (!authed) return (
    <main className="admin-login">
      <div className="admin-login__box">
        <div className="admin-login__logo">DigitalStore</div>
        <h1 className="admin-login__title">Panel Admin</h1>
        <p className="admin-login__sub">Acces reserve</p>
        <form onSubmit={handleLogin} className="admin-login__form">
          <div className="field">
            <label className="label">Mot de passe</label>
            <input
              type="password" className="input"
              placeholder="••••••••"
              value={pw} onChange={e => setPw(e.target.value)}
              autoFocus
            />
          </div>
          {pwErr && <p className="admin-login__err">{pwErr}</p>}
          <button type="submit" className="btn btn-dark btn-lg admin-login__submit" disabled={pwLoading}>
            {pwLoading ? <><div className="spinner"/>Verification...</> : 'Se connecter'}
          </button>
        </form>
        <p className="admin-login__hint">
          Generez votre hash :<br/>
          <code>hashPassword('votre_mdp')</code> depuis la console.
        </p>
      </div>
    </main>
  )

  return (
    <main className="admin">
      <div className="container">
        <div className="admin__head">
          <div>
            <h1 className="admin__title">Panel Admin</h1>
            <p className="admin__sub">Gerez vos produits, promotions et configuration</p>
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => { destroySession(); setAuthed(false) }}>
            Deconnexion
          </button>
        </div>

        <div className="admin__tabs">
          {['products','promos','config'].map(t => (
            <button
              key={t}
              className={`admin__tab ${tab === t ? 'admin__tab--active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t === 'products' ? 'Produits' : t === 'promos' ? 'Codes promo' : 'Configuration'}
            </button>
          ))}
        </div>

        {tab === 'products' && <ProductsTab />}
        {tab === 'promos' && <PromosTab />}
        {tab === 'config' && <ConfigTab />}
      </div>
    </main>
  )
}

// ---------------------------------------------------------------
// TAB: PRODUCTS
// ---------------------------------------------------------------
function ProductsTab() {
  const { products, save, reload, loading } = useStore()
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(EMPTY_PRODUCT)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [showForm, setShowForm] = useState(false)

  const openNew = () => { setForm({ ...EMPTY_PRODUCT }); setEditId(null); setShowForm(true); setMsg('') }
  const openEdit = (p) => { setForm({ ...p }); setEditId(p.id); setShowForm(true); setMsg('') }
  const closeForm = () => { setShowForm(false); setMsg('') }

  const handleField = (k, v) => {
    setForm(f => {
      const updated = { ...f, [k]: v }
      // Auto-generate ID from name if new product
      if (k === 'name' && !editId) updated.id = slugify(v)
      // Auto-set paypalAmount from salePrice or price
      if (k === 'salePrice' && v) updated.paypalAmount = v
      if (k === 'price' && !f.salePrice) updated.paypalAmount = v
      return updated
    })
  }

  const handleSave = async () => {
    if (!form.name || !form.price) { setMsg('Nom et prix obligatoires.'); return }
    setSaving(true); setMsg('')
    try {
      const cleanForm = {
        ...form,
        price: Number(form.price),
        salePrice: form.salePrice ? Number(form.salePrice) : null,
        paypalAmount: Number(form.paypalAmount || form.salePrice || form.price),
        rating: form.rating ? Number(form.rating) : 0,
        reviewCount: form.reviewCount ? Number(form.reviewCount) : 0,
        featured: Boolean(form.featured),
        active: Boolean(form.active),
      }
      let updated
      if (editId) {
        updated = products.map(p => p.id === editId ? cleanForm : p)
      } else {
        if (products.find(p => p.id === cleanForm.id)) { setMsg('Cet ID existe deja.'); setSaving(false); return }
        updated = [...products, cleanForm]
      }
      await save({ products: updated }, getSessionToken())
      setMsg(editId ? 'Produit mis a jour !' : 'Produit ajoute !')
      setShowForm(false)
      reload(true)
    } catch (err) { setMsg('Erreur : ' + err.message) }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce produit ?')) return
    setSaving(true)
    try {
      const updated = products.filter(p => p.id !== id)
      await save({ products: updated }, getSessionToken())
      reload(true)
    } catch (err) { setMsg('Erreur : ' + err.message) }
    setSaving(false)
  }

  const toggleActive = async (product) => {
    const updated = products.map(p => p.id === product.id ? { ...p, active: !p.active } : p)
    await save({ products: updated }, getSessionToken())
    reload(true)
  }

  return (
    <div className="admin-section">
      <div className="admin-section__head">
        <h2>Produits ({products.length})</h2>
        <button className="btn btn-dark btn-sm" onClick={openNew}>+ Nouveau produit</button>
      </div>

      {msg && <div className={`admin__msg ${msg.startsWith('Erreur') ? 'admin__msg--err' : 'admin__msg--ok'}`}>{msg}</div>}

      {/* Form */}
      {showForm && (
        <div className="admin-form-wrap">
          <div className="admin-form__head">
            <h3>{editId ? 'Modifier le produit' : 'Nouveau produit'}</h3>
            <button className="btn btn-ghost btn-sm" onClick={closeForm}>Annuler</button>
          </div>
          <div className="admin-form">
            <div className="admin-form__grid">
              <div className="field">
                <label className="label">Nom *</label>
                <input className="input" value={form.name} onChange={e => handleField('name', e.target.value)} placeholder="Nom du produit" />
              </div>
              <div className="field">
                <label className="label">ID (slug)</label>
                <input className="input" value={form.id} onChange={e => handleField('id', e.target.value)} placeholder="auto-genere" />
              </div>
              <div className="field">
                <label className="label">Accroche courte</label>
                <input className="input" value={form.tagline} onChange={e => handleField('tagline', e.target.value)} placeholder="Une phrase courte" />
              </div>
              <div className="field">
                <label className="label">Categorie</label>
                <select className="input" value={form.category} onChange={e => handleField('category', e.target.value)}>
                  <option>Design</option><option>Code</option><option>Productivite</option>
                </select>
              </div>
              <div className="field">
                <label className="label">Prix (EUR) *</label>
                <input className="input" type="number" min="0" step="0.01" value={form.price} onChange={e => handleField('price', e.target.value)} />
              </div>
              <div className="field">
                <label className="label">Prix promo (vide = aucune promo)</label>
                <input className="input" type="number" min="0" step="0.01" value={form.salePrice || ''} onChange={e => handleField('salePrice', e.target.value)} />
              </div>
              <div className="field admin-form__full">
                <label className="label">URL Image</label>
                <input className="input" value={form.image} onChange={e => handleField('image', e.target.value)} placeholder="https://..." />
              </div>
              <div className="field admin-form__full">
                <label className="label">Lien Google Drive (fichier ZIP)</label>
                <input className="input" value={form.driveLink} onChange={e => handleField('driveLink', e.target.value)} placeholder="https://drive.google.com/file/d/..." />
              </div>
              <div className="field admin-form__full">
                <label className="label">Stripe Payment Link</label>
                <input className="input" value={form.stripeLink} onChange={e => handleField('stripeLink', e.target.value)} placeholder="https://buy.stripe.com/..." />
              </div>
              <div className="field">
                <label className="label">Taille fichier</label>
                <input className="input" value={form.fileSize} onChange={e => handleField('fileSize', e.target.value)} placeholder="50 MB" />
              </div>
              <div className="field">
                <label className="label">Tags (virgule)</label>
                <input className="input" value={form.tags} onChange={e => handleField('tags', e.target.value)} placeholder="figma,ui,design" />
              </div>
              <div className="field">
                <label className="label">Note (ex: 4.8)</label>
                <input className="input" type="number" min="0" max="5" step="0.1" value={form.rating} onChange={e => handleField('rating', e.target.value)} />
              </div>
              <div className="field">
                <label className="label">Nombre d'avis</label>
                <input className="input" type="number" value={form.reviewCount} onChange={e => handleField('reviewCount', e.target.value)} />
              </div>
              <div className="field admin-form__full">
                <label className="label">Description (separez les sections par une ligne vide)</label>
                <textarea className="input" rows={7} value={form.description} onChange={e => handleField('description', e.target.value)} />
              </div>
              <div className="field admin-form__checkboxes">
                <label className="admin-check">
                  <input type="checkbox" checked={form.featured} onChange={e => handleField('featured', e.target.checked)} />
                  Produit vedette (visible en accueil)
                </label>
                <label className="admin-check">
                  <input type="checkbox" checked={form.active} onChange={e => handleField('active', e.target.checked)} />
                  Produit actif (visible en boutique)
                </label>
              </div>
            </div>
            <div className="admin-form__actions">
              <button className="btn btn-dark btn-lg" onClick={handleSave} disabled={saving}>
                {saving ? <><div className="spinner"/>Sauvegarde...</> : editId ? 'Mettre a jour' : 'Ajouter le produit'}
              </button>
              <button className="btn btn-outline" onClick={closeForm}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Produit</th><th>Cat.</th><th>Prix</th><th>Promo</th>
              <th>Drive</th><th>Stripe</th><th>Statut</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="admin-table__loading">Chargement...</td></tr>
            ) : products.map(p => (
              <tr key={p.id} className={!p.active ? 'admin-table__row--off' : ''}>
                <td>
                  <div className="admin-prod-cell">
                    <img src={p.image} alt="" className="admin-prod-cell__img" />
                    <div>
                      <p className="admin-prod-cell__name">{p.name}</p>
                      <p className="admin-prod-cell__id">{p.id}</p>
                    </div>
                  </div>
                </td>
                <td><span className="admin-badge">{p.category}</span></td>
                <td>
                  <div className="admin-price-cell">
                    {getDiscountPct(p) > 0 && <span className="price-original">{formatPrice(p.price)}</span>}
                    <strong>{formatPrice(getFinalPrice(p))}</strong>
                    {getDiscountPct(p) > 0 && <span className="admin-disc">-{getDiscountPct(p)}%</span>}
                  </div>
                </td>
                <td>
                  {p.salePrice > 0
                    ? <span className="admin-status admin-status--on">Oui ({formatPrice(p.salePrice)})</span>
                    : <span className="admin-status admin-status--off">—</span>}
                </td>
                <td>
                  {p.driveLink && !p.driveLink.includes('VOTRE')
                    ? <a href={p.driveLink} target="_blank" rel="noopener" className="admin-link">Voir</a>
                    : <span className="admin-status admin-status--warn">Non configure</span>}
                </td>
                <td>
                  {p.stripeLink && !p.stripeLink.includes('VOTRE')
                    ? <span className="admin-status admin-status--on">OK</span>
                    : <span className="admin-status admin-status--warn">Non configure</span>}
                </td>
                <td>
                  <button
                    className={`admin-toggle ${p.active ? 'admin-toggle--on' : 'admin-toggle--off'}`}
                    onClick={() => toggleActive(p)}
                    title={p.active ? 'Desactiver' : 'Activer'}
                  >
                    <span/>{p.active ? 'Actif' : 'Inactif'}
                  </button>
                </td>
                <td>
                  <div className="admin-actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>Modifier</button>
                    <button className="btn btn-ghost btn-sm admin-actions__del" onClick={() => handleDelete(p.id)}>Sup.</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------
// TAB: PROMOS
// ---------------------------------------------------------------
function PromosTab() {
  const { promos, save, reload } = useStore()
  const [form, setForm] = useState(EMPTY_PROMO)
  const [editCode, setEditCode] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const openNew = () => { setForm({ ...EMPTY_PROMO }); setEditCode(null); setShowForm(true) }
  const openEdit = (p) => { setForm({ ...p }); setEditCode(p.code); setShowForm(true) }
  const handleField = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.code || !form.value) { setMsg('Code et valeur obligatoires.'); return }
    setSaving(true)
    try {
      const clean = { ...form, value: Number(form.value), maxUses: Number(form.maxUses), currentUses: Number(form.currentUses || 0), minOrderAmount: Number(form.minOrderAmount || 0), active: Boolean(form.active) }
      let updated
      if (editCode) updated = promos.map(p => p.code === editCode ? clean : p)
      else updated = [...promos, clean]
      await save({ promos: updated }, getSessionToken())
      setMsg(editCode ? 'Code mis a jour !' : 'Code ajoute !')
      setShowForm(false); reload(true)
    } catch (err) { setMsg('Erreur : ' + err.message) }
    setSaving(false)
  }

  const handleDelete = async (code) => {
    if (!confirm('Supprimer ce code ?')) return
    const updated = promos.filter(p => p.code !== code)
    await save({ promos: updated }, getSessionToken())
    reload(true)
  }

  const toggle = async (promo) => {
    const updated = promos.map(p => p.code === promo.code ? { ...p, active: !p.active } : p)
    await save({ promos: updated }, getSessionToken())
    reload(true)
  }

  return (
    <div className="admin-section">
      <div className="admin-section__head">
        <h2>Codes promo ({promos.length})</h2>
        <button className="btn btn-dark btn-sm" onClick={openNew}>+ Nouveau code</button>
      </div>
      {msg && <div className={`admin__msg ${msg.startsWith('Erreur') ? 'admin__msg--err' : 'admin__msg--ok'}`}>{msg}</div>}

      {showForm && (
        <div className="admin-form-wrap">
          <div className="admin-form__head">
            <h3>{editCode ? 'Modifier le code' : 'Nouveau code promo'}</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>Annuler</button>
          </div>
          <div className="admin-form">
            <div className="admin-form__grid">
              <div className="field">
                <label className="label">Code *</label>
                <input className="input" value={form.code} onChange={e => handleField('code', e.target.value.toUpperCase())} placeholder="PROMO20" style={{ fontFamily: 'monospace', letterSpacing: '.06em' }} />
              </div>
              <div className="field">
                <label className="label">Type</label>
                <select className="input" value={form.type} onChange={e => handleField('type', e.target.value)}>
                  <option value="percentage">Pourcentage (%)</option>
                  <option value="fixed">Montant fixe (EUR)</option>
                </select>
              </div>
              <div className="field">
                <label className="label">Valeur * {form.type === 'percentage' ? '(%)' : '(EUR)'}</label>
                <input className="input" type="number" min="0" value={form.value} onChange={e => handleField('value', e.target.value)} />
              </div>
              <div className="field">
                <label className="label">Utilisation max</label>
                <input className="input" type="number" min="1" value={form.maxUses} onChange={e => handleField('maxUses', e.target.value)} />
              </div>
              <div className="field">
                <label className="label">Date d'expiration</label>
                <input className="input" type="date" value={form.expiresAt} onChange={e => handleField('expiresAt', e.target.value)} />
              </div>
              <div className="field">
                <label className="label">Commande minimum (EUR)</label>
                <input className="input" type="number" min="0" value={form.minOrderAmount} onChange={e => handleField('minOrderAmount', e.target.value)} />
              </div>
              <div className="field admin-form__full">
                <label className="label">Description interne</label>
                <input className="input" value={form.description} onChange={e => handleField('description', e.target.value)} />
              </div>
              <div className="field">
                <label className="admin-check">
                  <input type="checkbox" checked={form.active} onChange={e => handleField('active', e.target.checked)} />
                  Code actif
                </label>
              </div>
            </div>
            <div className="admin-form__actions">
              <button className="btn btn-dark btn-lg" onClick={handleSave} disabled={saving}>
                {saving ? <><div className="spinner"/>Sauvegarde...</> : editCode ? 'Mettre a jour' : 'Ajouter'}
              </button>
              <button className="btn btn-outline" onClick={() => setShowForm(false)}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr><th>Code</th><th>Type</th><th>Valeur</th><th>Utilisations</th><th>Expiration</th><th>Statut</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {promos.map(p => {
              const exp = new Date(p.expiresAt) < new Date()
              const full = Number(p.currentUses) >= Number(p.maxUses)
              const ok = p.active && !exp && !full
              return (
                <tr key={p.code}>
                  <td><code className="admin-code">{p.code}</code><br/><small>{p.description}</small></td>
                  <td>{p.type === 'percentage' ? 'Pourcentage' : 'Fixe'}</td>
                  <td><strong className="price-sale">{p.type === 'percentage' ? `-${p.value}%` : `-${formatPrice(p.value)}`}</strong></td>
                  <td>{p.currentUses}/{p.maxUses}</td>
                  <td><span className={exp ? 'admin-status admin-status--warn' : ''}>{p.expiresAt}</span></td>
                  <td>
                    <button className={`admin-toggle ${ok ? 'admin-toggle--on' : 'admin-toggle--off'}`} onClick={() => toggle(p)}>
                      <span/>{ok ? 'Actif' : exp ? 'Expire' : full ? 'Epuise' : 'Inactif'}
                    </button>
                  </td>
                  <td>
                    <div className="admin-actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>Modifier</button>
                      <button className="btn btn-ghost btn-sm admin-actions__del" onClick={() => handleDelete(p.code)}>Sup.</button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------
// TAB: CONFIG — setup guide
// ---------------------------------------------------------------
function ConfigTab() {
  const [pwInput, setPwInput] = useState('')
  const [hash, setHash] = useState('')
  const { reload } = useStore()

  const genHash = async () => {
    const { hashPassword } = await import('../utils/admin.js')
    const h = await hashPassword(pwInput)
    setHash(h)
  }

  return (
    <div className="admin-section admin-config">
      <h2>Configuration</h2>

      <div className="config-card">
        <h3>Generer un hash de mot de passe</h3>
        <p>Entrez votre mot de passe pour generer le hash a coller dans <code>src/utils/config.js</code></p>
        <div className="config-hash-row">
          <input type="password" className="input" placeholder="Votre mot de passe" value={pwInput} onChange={e => setPwInput(e.target.value)} />
          <button className="btn btn-dark" onClick={genHash}>Generer</button>
        </div>
        {hash && (
          <div className="config-hash-result">
            <p>Copiez ce hash dans <code>ADMIN_PASSWORD_HASH</code> :</p>
            <code className="config-hash-value" onClick={() => navigator.clipboard.writeText(hash)}>{hash}</code>
            <small>Cliquer pour copier</small>
          </div>
        )}
      </div>

      <div className="config-card">
        <h3>Google Apps Script — configuration</h3>
        <ol>
          <li>Allez sur <a href="https://sheets.new" target="_blank">sheets.new</a> et creez une feuille nommee <strong>DigitalStore</strong></li>
          <li>Ajoutez deux onglets : <strong>products</strong> et <strong>promos</strong></li>
          <li>Allez dans Extensions &gt; Apps Script</li>
          <li>Collez le contenu du fichier <code>google-apps-script/Code.gs</code> (inclus dans le projet)</li>
          <li>Deployez en tant que Web App (execution : Tout le monde)</li>
          <li>Copiez l'URL du Web App dans <code>APPS_SCRIPT_URL</code> dans <code>config.js</code></li>
        </ol>
        <button className="btn btn-outline btn-sm" onClick={() => reload(true)}>
          Forcer rechargement des donnees
        </button>
      </div>

      <div className="config-card">
        <h3>Stripe Payment Links</h3>
        <ol>
          <li>Connectez-vous sur <a href="https://dashboard.stripe.com" target="_blank">dashboard.stripe.com</a></li>
          <li>Allez dans Payment Links &gt; Creer un lien par produit</li>
          <li>Copiez chaque URL <code>https://buy.stripe.com/...</code></li>
          <li>Collez-les dans le champ "Stripe Payment Link" de chaque produit ci-dessus</li>
          <li>Configurez l'URL de succes Stripe : <code>https://votre-site.com/digital-store/success</code></li>
        </ol>
      </div>

      <div className="config-card">
        <h3>PayPal</h3>
        <ol>
          <li>Allez sur <a href="https://developer.paypal.com" target="_blank">developer.paypal.com</a></li>
          <li>Creez une app Live et copiez le Client ID</li>
          <li>Remplacez <code>YOUR_PAYPAL_CLIENT_ID</code> dans <code>index.html</code></li>
        </ol>
      </div>

      <div className="config-card">
        <h3>Deploiement GitHub Pages</h3>
        <ol>
          <li>Modifiez <code>vite.config.js</code> : <code>base: '/nom-de-votre-repo/'</code></li>
          <li>Modifiez aussi les chemins <code>@font-face</code> dans <code>global.css</code> si besoin</li>
          <li>Executez <code>npm run build</code></li>
          <li>Poussez le dossier <code>dist/</code> sur la branche <code>gh-pages</code></li>
          <li>GitHub Settings &gt; Pages &gt; Source : <code>gh-pages</code></li>
        </ol>
      </div>
    </div>
  )
}
