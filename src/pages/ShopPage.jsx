import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard.jsx'
import { useStore } from '../hooks/useStore.jsx'
import { getActiveProducts, getCategories } from '../utils/sheets.js'
import { getFinalPrice } from '../utils/sheets.js'
import './ShopPage.css'

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState(searchParams.get('cat') || 'Tous')
  const [sort, setSort] = useState('default')
  const { products, loading } = useStore()

  useEffect(() => {
    const c = searchParams.get('cat')
    if (c) setCat(c)
  }, [searchParams])

  const active = getActiveProducts(products)
  const cats = ['Tous', ...getCategories(active)]

  const filtered = active
    .filter(p => {
      const mc = cat === 'Tous' || p.category === cat
      const ms = !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.tags || '').toLowerCase().includes(search.toLowerCase())
      return mc && ms
    })
    .sort((a, b) => {
      if (sort === 'price-asc') return getFinalPrice(a) - getFinalPrice(b)
      if (sort === 'price-desc') return getFinalPrice(b) - getFinalPrice(a)
      if (sort === 'rating') return (Number(b.rating)||0) - (Number(a.rating)||0)
      return 0
    })

  const setCatAndParams = (c) => {
    setCat(c)
    if (c === 'Tous') setSearchParams({})
    else setSearchParams({ cat: c })
  }

  return (
    <main className="shop">
      <div className="shop__hero">
        <div className="container">
          <h1 className="shop__title">Boutique</h1>
          <p className="shop__sub">{active.length} ressources numeriques disponibles</p>
        </div>
      </div>

      <div className="container shop__body">
        {/* Sidebar */}
        <aside className="shop__sidebar">
          <div className="shop__filter-box">
            <p className="shop__filter-label">Categories</p>
            {loading ? (
              <div className="shop__cats-loading"/>
            ) : cats.map(c => (
              <button
                key={c}
                className={`shop__cat-btn ${cat === c ? 'shop__cat-btn--active' : ''}`}
                onClick={() => setCatAndParams(c)}
              >
                {c}
                <span className="shop__cat-count">
                  {c === 'Tous' ? active.length : active.filter(p => p.category === c).length}
                </span>
              </button>
            ))}
          </div>
        </aside>

        {/* Main */}
        <div className="shop__main">
          {/* Toolbar */}
          <div className="shop__toolbar">
            <div className="shop__search-wrap">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shop__search-icon">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="search"
                className="shop__search"
                placeholder="Rechercher..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="shop__toolbar-right">
              <span className="shop__count">{filtered.length} resultat{filtered.length > 1 ? 's' : ''}</span>
              <select className="shop__sort" value={sort} onChange={e => setSort(e.target.value)}>
                <option value="default">Trier par defaut</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix decroissant</option>
                <option value="rating">Mieux notes</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="products-grid">
              {[1,2,3,4].map(i => <div key={i} className="loading-card" style={{ height: 320 }}/>)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="shop__empty">
              <p>Aucun produit ne correspond a votre recherche.</p>
              <button className="btn btn-outline" onClick={() => { setSearch(''); setCatAndParams('Tous') }}>
                Reinitialiser les filtres
              </button>
            </div>
          ) : (
            <div className="products-grid">
              {filtered.map((p, i) => <ProductCard key={p.id} product={p} delay={i * 0.05} />)}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
