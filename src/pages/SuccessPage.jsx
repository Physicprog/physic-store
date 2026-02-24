import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { formatPrice } from '../utils/format.js'
import './SuccessPage.css'

// ---------------------------------------------------------------
// PAGE SUCCÈS
// Après paiement Stripe : Stripe redirige ici avec ?order=SESSION_ID
// Après paiement PayPal : notre onApprove redirige ici avec les données en sessionStorage
//
// Le lien Google Drive est récupéré depuis sessionStorage (côté client).
// Note de sécurité : le lien Drive est visible dans le code JS du bundle.
// Pour cacher totalement le lien, il faudrait un backend serverless.
// ---------------------------------------------------------------

export default function SuccessPage() {
  const [searchParams] = useSearchParams()
  const [order, setOrder] = useState(null)
  const method = searchParams.get('method') || 'stripe'
  const orderId = searchParams.get('order')

  useEffect(() => {
    const raw = sessionStorage.getItem('ds_last_order')
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        if (!orderId || parsed.orderId === orderId || parsed.items) {
          setOrder(parsed)
        }
      } catch {}
    }
  }, [orderId])

  // Pour Stripe : si pas de sessionStorage (redirection directe),
  // on affiche un message générique avec lien vers boutique
  const isStripeReturn = method === 'stripe' && !order

  return (
    <main className="success">
      <div className="container success__inner">

        {/* Check animation */}
        <div className="success__check">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>

        <h1 className="success__title">Paiement confirme !</h1>
        <p className="success__sub">
          Merci pour votre achat. Votre fichier est pret a etre telecharge.
        </p>

        {orderId && (
          <div className="success__order-id">
            Reference commande : <strong>{orderId}</strong>
          </div>
        )}

        {/* Downloads */}
        {order && order.items && order.items.length > 0 ? (
          <div className="success__downloads">
            <h2 className="success__dl-title">Votre telechargement</h2>
            {order.items.map(item => (
              <div key={item.id} className="success__dl-item">
                <div className="success__dl-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <path d="M13 2H6a2 2 0 00-2 2v16h16V9z"/><path d="M13 2v7h7"/>
                  </svg>
                </div>
                <div className="success__dl-info">
                  <p className="success__dl-name">{item.name}</p>
                  <p className="success__dl-price">{formatPrice(item.price)} — Fichier ZIP</p>
                </div>
                {item.driveLink && item.driveLink !== '' && !item.driveLink.includes('VOTRE_ID') ? (
                  <a
                    href={item.driveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-blue success__dl-btn"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="21 15 21 19 3 19 3 15"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Telecharger
                  </a>
                ) : (
                  <div className="success__dl-nolink">
                    Lien Google Drive non configure.<br/>
                    Verifiez le panel admin.
                  </div>
                )}
              </div>
            ))}

            <div className="success__dl-note">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              Un email de confirmation a ete envoye. Le lien Google Drive restera accessible.
            </div>
          </div>
        ) : isStripeReturn ? (
          <div className="success__stripe-note">
            <p>
              Votre paiement Stripe a ete traite. Si vous ne voyez pas votre lien de telechargement,
              consultez votre email de confirmation Stripe ou contactez le support.
            </p>
            <p style={{ marginTop: 12, fontSize: '.875rem', color: 'var(--c-ink3)' }}>
              Note : Pour afficher automatiquement le lien apres Stripe, configurez l'URL de succes
              dans votre Payment Link Stripe avec les parametres de session.
            </p>
          </div>
        ) : null}

        {/* Next steps */}
        <div className="success__next">
          <div className="success__next-item">
            <p className="success__next-num">1</p>
            <div>
              <strong>Cliquez sur Telecharger</strong>
              <p>Votre fichier ZIP s'ouvre sur Google Drive</p>
            </div>
          </div>
          <div className="success__next-item">
            <p className="success__next-num">2</p>
            <div>
              <strong>Enregistrez le fichier</strong>
              <p>Depuis Drive, faites "Telechargement" pour sauvegarder le ZIP</p>
            </div>
          </div>
          <div className="success__next-item">
            <p className="success__next-num">3</p>
            <div>
              <strong>Probleme ?</strong>
              <p>Contactez le support avec votre reference commande</p>
            </div>
          </div>
        </div>

        <div className="success__actions">
          <Link to="/boutique" className="btn btn-dark">Continuer mes achats</Link>
          <Link to="/" className="btn btn-outline">Retour a l'accueil</Link>
        </div>

      </div>
    </main>
  )
}
