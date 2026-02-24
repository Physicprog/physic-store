import { Link, useParams, useNavigate } from 'react-router-dom'
import { useStore } from '../hooks/useStore.jsx'
import { useCart } from '../hooks/useCart.jsx'
import { getProductById, getActiveProducts, getFinalPrice, getDiscountPct } from '../utils/sheets.js'
import { formatPrice } from '../utils/format.js'
import './ProductPage.css'

export default function ProductPage() {
  const { id } = useParams()
  const { products, loading } = useStore()
  const { add, items } = useCart()
  const navigate = useNavigate()

  if (loading) return (
    <main className="pdp pdp--loading">
      <div className="container"><div className="pdp__skeleton"/></div>
    </main>
  )

  const product = getProductById(products, id)
  if (!product) return (
    <main className="pdp pdp--404">
      <div className="container">
        <h1>Produit introuvable</h1>
        <Link to="/boutique" className="btn btn-outline" style={{ marginTop: 24 }}>Retour a la boutique</Link>
      </div>
    </main>
  )

  const inCart = items.some(i => i.id === product.id)
  const disc = getDiscountPct(product)
  const finalPrice = getFinalPrice(product)
  const related = getActiveProducts(products).filter(p => p.category === product.category && p.id !== product.id).slice(0, 3)

  // Parse description (newlines into paragraphs / lists)
  const descBlocks = product.description.split('\n\n').map((block, i) => {
    if (block.startsWith('-')) {
      const items = block.split('\n').filter(l => l.startsWith('-'))
      return <ul key={i} className="pdp__list">{items.map((li, j) => <li key={j}>{li.replace(/^- /, '')}</li>)}</ul>
    }
    return <p key={i} className="pdp__desc-p">{block}</p>
  })

  return (
    <main className="pdp">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="pdp__breadcrumb">
          <Link to="/">Accueil</Link>
          <span>/</span>
          <Link to="/boutique">Boutique</Link>
          <span>/</span>
          <Link to={`/boutique?cat=${product.category}`}>{product.category}</Link>
          <span>/</span>
          <span>{product.name}</span>
        </nav>

        <div className="pdp__grid">
          {/* Left — Image */}
          <div className="pdp__media">
            <div className="pdp__img-wrap">
              <img src={product.image} alt={product.name} className="pdp__img" />
              {disc > 0 && <div className="pdp__disc-badge badge badge-sale">-{disc}%</div>}
            </div>
            <div className="pdp__file-meta">
              <span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 2H6a2 2 0 00-2 2v16h16V9z"/><path d="M13 2v7h7"/>
                </svg>
                Fichier ZIP
              </span>
              <span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                Acces instantane
              </span>
              {product.fileSize && (
                <span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="21 15 21 19 3 19 3 15"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  {product.fileSize}
                </span>
              )}
            </div>
          </div>

          {/* Right — Info */}
          <div className="pdp__info">
            <div className="pdp__tags">
              <span className="badge badge-cat">{product.category}</span>
              {product.featured && <span className="badge badge-featured">Vedette</span>}
              {disc > 0 && <span className="badge badge-sale">Promotion</span>}
            </div>

            <h1 className="pdp__name">{product.name}</h1>
            <p className="pdp__tagline">{product.tagline}</p>

            {Number(product.rating) > 0 && (
              <div className="pdp__rating">
                <span className="stars">{' '.repeat(5).split('').map((_, i) => '★')}</span>
                <span className="pdp__rating-score">{product.rating}</span>
                <span className="pdp__rating-count">({product.reviewCount} avis)</span>
              </div>
            )}

            {/* Pricing */}
            <div className="pdp__pricing">
              <div className="pdp__prices">
                <span className="pdp__price-final">{formatPrice(finalPrice)}</span>
                {disc > 0 && <span className="price-original pdp__price-orig">{formatPrice(product.price)}</span>}
                {disc > 0 && (
                  <span className="pdp__savings">Economie de {formatPrice(Number(product.price) - finalPrice)}</span>
                )}
              </div>
            </div>

            {/* CTAs */}
            <div className="pdp__ctas">
              <button
                className="btn btn-dark btn-lg pdp__cta-main"
                onClick={() => { if (!inCart) { add(product) } else { navigate('/checkout') } }}
              >
                {inCart ? 'Voir le panier' : 'Ajouter au panier'}
              </button>
              {!inCart && (
                <button
                  className="btn btn-blue btn-lg pdp__cta-buy"
                  onClick={() => { add(product); navigate('/checkout') }}
                >
                  Acheter maintenant
                </button>
              )}
            </div>

            {/* Trust */}
            <ul className="pdp__trust">
              {[
                'Telechargement Google Drive immediatement apres paiement',
                'Paiement securise — CB ou PayPal',
                'Licence commerciale incluse',
                'Acces a vie a votre fichier',
              ].map((t, i) => (
                <li key={i}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Description */}
        <div className="pdp__desc">
          <h2 className="pdp__desc-title">Description</h2>
          <div className="pdp__desc-body">{descBlocks}</div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="pdp__related">
            <h2 className="pdp__related-title">Produits similaires</h2>
            <div className="products-grid">
              {related.map((p, i) => {
                const fd = getFinalPrice(p)
                return (
                  <Link key={p.id} to={`/produit/${p.id}`} className="card pdp__rel-card">
                    <img src={p.image} alt={p.name} className="pdp__rel-img" />
                    <div className="pdp__rel-body">
                      <span className="pdp__rel-cat">{p.category}</span>
                      <p className="pdp__rel-name">{p.name}</p>
                      <p className="pdp__rel-price">{formatPrice(fd)}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
