import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useCart } from '../hooks/useCart.jsx'
import './Navbar.css'

export default function Navbar() {
  const { count, setIsOpen } = useCart()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => setMenuOpen(false), [location])

  const links = [
    { to: '/', label: 'Accueil' },
    { to: '/boutique', label: 'Boutique' },
  ]

  return (
    <header className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
      <div className="container nav__inner">

        {/* Logo */}
        <Link to="/" className="nav__logo">DigitalStore</Link>

        {/* Links */}
        <nav className={`nav__links ${menuOpen ? 'nav__links--open' : ''}`}>
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className={`nav__link ${location.pathname === l.to ? 'nav__link--active' : ''}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Right */}
        <div className="nav__right">
          <button className="nav__cart" onClick={() => setIsOpen(true)} aria-label="Panier">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            {count > 0 && <span className="nav__cart-badge">{count}</span>}
          </button>

          <button className="nav__burger" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
            <span className={`nav__burger-lines ${menuOpen ? 'nav__burger-lines--open' : ''}`}>
              <span/><span/><span/>
            </span>
          </button>
        </div>
      </div>
    </header>
  )
}
