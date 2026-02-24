import { Link } from 'react-router-dom'
import { useCart } from '../hooks/useCart.jsx'
import { getFinalPrice, getDiscountPct } from '../utils/sheets.js'
import { formatPrice } from '../utils/format.js'
import './ProductCard.css'

export default function ProductCard({ product, delay = 0 }) {
  const { add, items } = useCart()
  const inCart = items.some(i => i.id === product.id)
  const disc = getDiscountPct(product)

  return (
    <article className="pcard anim-fade-up" style={{ animationDelay: `${delay}s` }}>
      <Link to={`/produit/${product.id}`} className="pcard__img-wrap">
        <img src={product.image} alt={product.name} className="pcard__img" loading="lazy" />
        {disc > 0 && <span className="pcard__disc-badge badge badge-sale">-{disc}%</span>}
      </Link>

      <div className="pcard__body">
        <span className="pcard__cat">{product.category}</span>
        <Link to={`/produit/${product.id}`} className="pcard__name">{product.name}</Link>
        <p className="pcard__tagline">{product.tagline}</p>

        {product.rating > 0 && (
          <div className="pcard__rating">
            <span className="stars" style={{ fontSize: '.7rem' }}>
              {'★'.repeat(Math.round(Number(product.rating)))}
            </span>
            <span className="pcard__rating-txt">{product.rating} ({product.reviewCount})</span>
          </div>
        )}

        <div className="pcard__foot">
          <div className="pcard__prices">
            {disc > 0 && <span className="price-original">{formatPrice(product.price)}</span>}
            <span className="pcard__price">{formatPrice(getFinalPrice(product))}</span>
          </div>
          <button
            className={`btn btn-sm ${inCart ? 'btn-outline' : 'btn-dark'}`}
            onClick={e => { e.preventDefault(); if (!inCart) add(product) }}
            disabled={inCart}
          >
            {inCart ? 'Ajoute' : 'Ajouter'}
          </button>
        </div>
      </div>
    </article>
  )
}
