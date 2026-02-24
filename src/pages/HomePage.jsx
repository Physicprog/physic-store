import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard.jsx'
import { useStore } from '../hooks/useStore.jsx'
import { getFeaturedProducts, getActiveProducts } from '../utils/sheets.js'
import './HomePage.css'

export default function HomePage() {
  const { products, loading } = useStore()
  const featured = getFeaturedProducts(products)
  const all = getActiveProducts(products)

  return (
    <main className="home">

      {/* HERO */}
      <section className="hero">
        <div className="container hero__inner">
          <p className="hero__eyebrow">Fichiers numeriques premium</p>
          <h1 className="hero__title">
            Accelerez vos projets<br />
            <span className="hero__title-line2">avec les bons outils</span>
          </h1>
          <p className="hero__sub">
            Design, code, templates — telechargement instantane apres paiement.<br />
            Tout est pret a l'emploi, documente, livre en ZIP.
          </p>
          <div className="hero__ctas">
            <Link to="/boutique" className="btn btn-dark btn-lg">
              Voir tous les produits
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </Link>
            <a href="#featured" className="btn btn-outline btn-lg">Selections du moment</a>
          </div>
          <div className="hero__stats">
            <div className="hero__stat"><strong>{all.length}+</strong><span>Produits disponibles</span></div>
            <div className="hero__stat-sep"/>
            <div className="hero__stat"><strong>500+</strong><span>Clients satisfaits</span></div>
            <div className="hero__stat-sep"/>
            <div className="hero__stat"><strong>ZIP</strong><span>Telechargement instantane</span></div>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <div className="trust">
        <div className="container trust__row">
          {[
            { icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', label: 'Paiement securise' },
            { icon: 'M13 2H6a2 2 0 00-2 2v16h16V9z M13 2v7h7', label: 'Fichier ZIP fourni' },
            { icon: 'M22 11.08V12a10 10 0 11-5.93-9.14 M22 4L12 14.01l-3-3', label: 'Acces immediat' },
            { icon: 'M3 3h18v4H3z M3 9h18v12H3z M9 14h6', label: 'Licence commerciale' },
          ].map((t, i) => (
            <div key={i} className="trust__item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path d={t.icon}/>
              </svg>
              <span>{t.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURED */}
      <section className="section" id="featured">
        <div className="container">
          <div className="section__top">
            <div>
              <h2 className="section__title">Selections du moment</h2>
              <p className="section__sub">Nos meilleures ventes, pour aller plus vite</p>
            </div>
            <Link to="/boutique" className="btn btn-outline btn-sm">
              Tout voir
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </Link>
          </div>
          {loading ? (
            <div className="loading-grid">
              {[1,2,3].map(i => <div key={i} className="loading-card"/>)}
            </div>
          ) : (
            <div className="products-grid">
              {featured.map((p, i) => <ProductCard key={p.id} product={p} delay={i * 0.08} />)}
            </div>
          )}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="section section--alt">
        <div className="container">
          <h2 className="section__title" style={{ marginBottom: 32 }}>Par categorie</h2>
          <div className="cats-grid">
            {[
              { slug: 'Design',      label: 'Design',       desc: 'UI Kits, assets, templates visuels',  bg: '#f0f4ff' },
              { slug: 'Code',        label: 'Code',         desc: 'Boilerplates, scripts, packages',      bg: '#f0fff4' },
              { slug: 'Productivite',label: 'Productivite', desc: 'Templates Notion, organisation',       bg: '#fffbf0' },
            ].map(c => (
              <Link key={c.slug} to={`/boutique?cat=${c.slug}`} className="cat-card" style={{ '--cat-bg': c.bg }}>
                <div className="cat-card__body">
                  <p className="cat-card__name">{c.label}</p>
                  <p className="cat-card__desc">{c.desc}</p>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="cat-card__arrow">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* PROMO BANNER */}
      <section className="promo-banner">
        <div className="container promo-banner__inner">
          <div>
            <h2 className="promo-banner__title">Premiere commande ?</h2>
            <p className="promo-banner__sub">
              Utilisez le code <code>BIENVENUE20</code> pour 20% de reduction.
            </p>
          </div>
          <Link to="/boutique" className="btn btn-blue btn-lg">Decouvrir la boutique</Link>
        </div>
      </section>

    </main>
  )
}
