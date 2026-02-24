import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCart } from '../hooks/useCart.jsx'
import { getFinalPrice } from '../utils/sheets.js'
import { formatPrice } from '../utils/format.js'
import './CheckoutPage.css'

export default function CheckoutPage() {
  const { items, total, subtotal, promoCode, promoDiscount, clear } = useCart()
  const navigate = useNavigate()
  const [paypalLoading, setPaypalLoading] = useState(false)
  const [paypalError, setPaypalError] = useState('')
  const paypalRef = useRef(null)
  const paypalRendered = useRef(false)

  // ---------------------------------------------------------------
  // STRIPE : redirige vers le Payment Link du produit (1 produit)
  // Pour multi-produits, il faut un Payment Link par pack ou Vercel/Netlify
  // ---------------------------------------------------------------
  const handleStripe = () => {
    if (items.length === 0) return
    if (items.length === 1 && items[0].stripeLink) {
      window.location.href = items[0].stripeLink
    } else if (items.length === 1 && !items[0].stripeLink) {
      alert('Le lien Stripe n\'est pas encore configure pour ce produit.\nAjoutez le champ "stripeLink" dans votre panel admin ou dans config.js.')
    } else {
      // Plusieurs produits : redirige vers le premier qui a un stripeLink
      // Idéalement créez un Payment Link "bundle" dans Stripe
      const withLink = items.find(i => i.stripeLink)
      if (withLink) {
        window.location.href = withLink.stripeLink
      } else {
        alert('Configurez les Stripe Payment Links dans le panel admin.')
      }
    }
  }

  // ---------------------------------------------------------------
  // PAYPAL : Smart Buttons via SDK global (window.paypal)
  // Le SDK est chargé dans index.html
  // ---------------------------------------------------------------
  useEffect(() => {
    if (!window.paypal || paypalRendered.current || items.length === 0) return
    paypalRendered.current = true

    window.paypal.Buttons({
      style: {
        layout: 'vertical',
        color: 'blue',
        shape: 'pill',
        label: 'paypal',
        height: 50,
      },

      // Création de la commande PayPal
      createOrder: (data, actions) => {
        const orderItems = items.map(item => ({
          name: item.name.substring(0, 127),
          unit_amount: { value: getFinalPrice(item).toFixed(2), currency_code: 'EUR' },
          quantity: '1',
          category: 'DIGITAL_GOODS',
        }))

        const itemTotal = items.reduce((s, i) => s + getFinalPrice(i), 0)
        const discount = promoDiscount || 0
        const finalTotal = Math.max(0, itemTotal - discount)

        return actions.order.create({
          intent: 'CAPTURE',
          purchase_units: [{
            description: `Commande DigitalStore — ${items.length} produit(s)`,
            amount: {
              currency_code: 'EUR',
              value: finalTotal.toFixed(2),
              breakdown: {
                item_total: { value: itemTotal.toFixed(2), currency_code: 'EUR' },
                discount: { value: discount.toFixed(2), currency_code: 'EUR' },
              },
            },
            items: orderItems,
          }],
          application_context: {
            brand_name: 'DigitalStore',
            locale: 'fr-FR',
            user_action: 'PAY_NOW',
          },
        })
      },

      // Paiement approuvé — capture + redirection
      onApprove: async (data, actions) => {
        setPaypalLoading(true)
        setPaypalError('')
        try {
          const capture = await actions.order.capture()
          const orderId = capture.id

          // Sauvegarder les infos pour la page succès
          const orderData = {
            orderId,
            method: 'paypal',
            items: items.map(i => ({
              id: i.id,
              name: i.name,
              price: getFinalPrice(i),
              driveLink: i.driveLink,
            })),
            total,
            promoCode: promoCode?.code || null,
            date: new Date().toISOString(),
          }
          sessionStorage.setItem('ds_last_order', JSON.stringify(orderData))
          clear()
          navigate(`/success?order=${orderId}&method=paypal`)
        } catch (err) {
          setPaypalError('Erreur lors de la confirmation PayPal. Contactez le support.')
          console.error(err)
        } finally {
          setPaypalLoading(false)
        }
      },

      onError: (err) => {
        console.error('PayPal error:', err)
        setPaypalError('Une erreur PayPal est survenue. Veuillez reessayer.')
      },

      onCancel: () => {
        setPaypalError('Paiement annule.')
      },
    }).render(paypalRef.current)

  }, [items, total, promoDiscount])

  if (items.length === 0) return (
    <main className="checkout checkout--empty">
      <div className="container">
        <h1>Votre panier est vide</h1>
        <Link to="/boutique" className="btn btn-outline" style={{ marginTop: 24 }}>
          Retour a la boutique
        </Link>
      </div>
    </main>
  )

  return (
    <main className="checkout">
      <div className="container checkout__layout">

        {/* LEFT — Summary */}
        <div className="checkout__summary">
          <h2 className="checkout__section-title">Recapitulatif</h2>

          <div className="checkout__items">
            {items.map(item => (
              <div key={item.id} className="checkout__item">
                <img src={item.image} alt={item.name} className="checkout__item-img" />
                <div className="checkout__item-info">
                  <p className="checkout__item-name">{item.name}</p>
                  <p className="checkout__item-cat">{item.category} · ZIP{item.fileSize ? ` · ${item.fileSize}` : ''}</p>
                </div>
                <div className="checkout__item-price">
                  {item.salePrice > 0 && (
                    <span className="price-original checkout__item-orig">{formatPrice(item.price)}</span>
                  )}
                  <span>{formatPrice(getFinalPrice(item))}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="checkout__totals">
            <div className="checkout__total-row">
              <span>Sous-total</span><span>{formatPrice(subtotal)}</span>
            </div>
            {promoDiscount > 0 && (
              <div className="checkout__total-row checkout__total-row--green">
                <span>Code promo ({promoCode?.code})</span>
                <span>-{formatPrice(promoDiscount)}</span>
              </div>
            )}
            <div className="checkout__total-row checkout__total-row--total">
              <span>Total TTC</span><span>{formatPrice(total)}</span>
            </div>
          </div>

          <div className="checkout__includes">
            <p className="checkout__includes-title">Inclus dans votre achat</p>
            <ul>
              <li>Telechargement Google Drive instantane</li>
              <li>Fichier ZIP complet</li>
              <li>Licence commerciale incluse</li>
              <li>Acces a vie</li>
            </ul>
          </div>
        </div>

        {/* RIGHT — Payment */}
        <div className="checkout__payment">
          <h2 className="checkout__section-title">Choisissez votre mode de paiement</h2>

          {/* === CB via Stripe === */}
          <div className="payment-block">
            <div className="payment-block__head">
              <div className="payment-block__icon payment-block__icon--stripe">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
              </div>
              <div>
                <p className="payment-block__title">Carte bancaire</p>
                <p className="payment-block__sub">Visa, Mastercard, Amex — via Stripe</p>
              </div>
              <div className="payment-block__cards">
                <span>VISA</span>
                <span>MC</span>
                <span>AMEX</span>
              </div>
            </div>
            <button className="btn btn-stripe btn-lg checkout__pay-btn" onClick={handleStripe}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
              Payer par carte — {formatPrice(total)}
            </button>
          </div>

          {/* Separator */}
          <div className="checkout__sep">
            <div className="checkout__sep-line"/>
            <span>ou</span>
            <div className="checkout__sep-line"/>
          </div>

          {/* === PayPal === */}
          <div className="payment-block">
            <div className="payment-block__head">
              <div className="payment-block__icon payment-block__icon--paypal">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <path d="M7.5 21H4L6 9h6c3 0 5 1 5 4 0 4-3 6-7 6H8l-0.5 2z"/>
                  <path d="M11.5 21H8l2-12h6c3 0 5 1 5 4 0 4-3 6-7 6h-2l-0.5 2z"/>
                </svg>
              </div>
              <div>
                <p className="payment-block__title">PayPal</p>
                <p className="payment-block__sub">Connectez votre compte PayPal</p>
              </div>
            </div>

            {paypalLoading && (
              <div className="checkout__paypal-loading">
                <div className="spinner spinner-dark"/>
                <span>Confirmation en cours...</span>
              </div>
            )}
            {paypalError && <p className="checkout__paypal-err">{paypalError}</p>}

            {/* PayPal Buttons rendered here */}
            <div ref={paypalRef} className="checkout__paypal-btns" />

            {!window.paypal && (
              <p className="checkout__paypal-warning">
                SDK PayPal non charge. Verifiez votre connexion ou configurez YOUR_PAYPAL_CLIENT_ID dans index.html.
              </p>
            )}
          </div>

          {/* Security */}
          <div className="checkout__security">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
            Paiement 100% securise. Nous ne stockons aucune donnee bancaire.
          </div>
        </div>
      </div>
    </main>
  )
}
