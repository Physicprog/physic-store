import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <Link to="/" className="footer__logo">DigitalStore</Link>
          <p>Ressources numeriques premium — telechargement instantane apres paiement.</p>
        </div>
        <div className="footer__cols">
          <div className="footer__col">
            <p className="footer__col-title">Boutique</p>
            <Link to="/boutique">Tous les produits</Link>
            <Link to="/boutique?cat=Design">Design</Link>
            <Link to="/boutique?cat=Code">Code</Link>
          </div>
          <div className="footer__col">
            <p className="footer__col-title">Infos</p>
            <Link to="#">Remboursement</Link>
            <Link to="#">Conditions</Link>
            <Link to="#">Contact</Link>
          </div>
        </div>
      </div>
      <div className="container footer__bottom">
        <p>© {new Date().getFullYear()} DigitalStore. Paiements securises Stripe & PayPal.</p>
      </div>
    </footer>
  )
}
