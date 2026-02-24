import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../hooks/useCart.jsx'
import { useStore } from '../hooks/useStore.jsx'
import { getFinalPrice } from '../utils/sheets.js'
import { formatPrice } from '../utils/format.js'
import './Cart.css'

export default function Cart() {
  const { items, remove, clear, subtotal, total, isOpen, setIsOpen,
          promoCode, promoDiscount, promoError, applyPromo, removePromo } = useCart()
  const { promos } = useStore()
  const [promoInput, setPromoInput] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const handleCheckout = () => { setIsOpen(false); navigate('/checkout') }

  return (
    <>
      <div className={`cart-overlay ${isOpen ? 'cart-overlay--on' : ''}`} onClick={() => setIsOpen(false)} />
      <aside className={`cart ${isOpen ? 'cart--open' : ''}`}>

        {/* Header */}
        <div className="cart__head">
          <div className="cart__head-title">
            Panier
            {items.length > 0 && <span className="cart__count">{items.length}</span>}
          </div>
          <button className="cart__close btn-ghost btn btn-sm" onClick={() => setIsOpen(false)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="cart__items">
          {items.length === 0 ? (
            <div className="cart__empty">
              <div className="cart__empty-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                  <path d="M16 10a4 4 0 01-8 0"/>
                </svg>
              </div>
              <p>Votre panier est vide</p>
              <button className="btn btn-outline btn-sm" onClick={() => { setIsOpen(false); navigate('/boutique') }}>
                Voir la boutique
              </button>
            </div>
          ) : items.map(item => (
            <div key={item.id} className="cart__item">
              <img src={item.image} alt={item.name} className="cart__item-img" />
              <div className="cart__item-info">
                <p className="cart__item-name">{item.name}</p>
                <p className="cart__item-cat">{item.category}</p>
                <div className="cart__item-prices">
                  {item.salePrice > 0 && <span className="price-original">{formatPrice(item.price)}</span>}
                  <span className="cart__item-price">{formatPrice(getFinalPrice(item))}</span>
                </div>
              </div>
              <button className="cart__item-rm" onClick={() => remove(item.id)} aria-label="Retirer">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="cart__foot">
            {/* Promo */}
            <div className="cart__promo">
              {promoCode ? (
                <div className="cart__promo-applied">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span>{promoCode.code} — -{formatPrice(promoDiscount)}</span>
                  <button className="cart__promo-rm" onClick={removePromo}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="cart__promo-row">
                  <input
                    className="input cart__promo-input"
                    type="text"
                    placeholder="Code promo"
                    value={promoInput}
                    onChange={e => setPromoInput(e.target.value.toUpperCase())}
                    onKeyDown={e => e.key === 'Enter' && applyPromo(promoInput, promos)}
                  />
                  <button className="btn btn-outline btn-sm" onClick={() => applyPromo(promoInput, promos)}>
                    OK
                  </button>
                </div>
              )}
              {promoError && <p className="cart__promo-err">{promoError}</p>}
            </div>

            <div className="divider" style={{ margin: '12px 0' }} />

            {/* Totals */}
            <div className="cart__totals">
              <div className="cart__total-row">
                <span>Sous-total</span><span>{formatPrice(subtotal)}</span>
              </div>
              {promoDiscount > 0 && (
                <div className="cart__total-row cart__total-row--green">
                  <span>Remise</span><span>-{formatPrice(promoDiscount)}</span>
                </div>
              )}
              <div className="cart__total-row cart__total-row--big">
                <span>Total</span><span>{formatPrice(total)}</span>
              </div>
            </div>

            <button className="btn btn-dark btn-lg cart__cta" onClick={handleCheckout}>
              Payer — {formatPrice(total)}
            </button>

            <p className="cart__secure">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
              Paiement 100% securise
            </p>
          </div>
        )}
      </aside>
    </>
  )
}
