import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { StoreProvider } from './hooks/useStore.jsx'
import { CartProvider } from './hooks/useCart.jsx'
import Navbar from './components/Navbar.jsx'
import Cart from './components/Cart.jsx'
import Footer from './components/Footer.jsx'
import HomePage from './pages/HomePage.jsx'
import ShopPage from './pages/ShopPage.jsx'
import ProductPage from './pages/ProductPage.jsx'
import CheckoutPage from './pages/CheckoutPage.jsx'
import SuccessPage from './pages/SuccessPage.jsx'
import AdminPage from './pages/AdminPage.jsx'

function Layout() {
  const { pathname } = useLocation()
  const hideFooter = pathname === '/checkout'

  return (
    <>
      <Navbar />
      <Cart />
      <Routes>
        <Route path="/"              element={<HomePage />} />
        <Route path="/boutique"      element={<ShopPage />} />
        <Route path="/produit/:id"   element={<ProductPage />} />
        <Route path="/checkout"      element={<CheckoutPage />} />
        <Route path="/success"       element={<SuccessPage />} />
        <Route path="/admin"         element={<AdminPage />} />
        <Route path="*"              element={<NotFound />} />
      </Routes>
      {!hideFooter && <Footer />}
    </>
  )
}

function NotFound() {
  return (
    <div style={{ paddingTop: 160, paddingBottom: 80, textAlign: 'center', minHeight: '60vh' }}>
      <h1 style={{ fontSize: '4rem', fontWeight: 800, letterSpacing: '-.04em', marginBottom: 12 }}>404</h1>
      <p style={{ color: 'var(--c-ink2)', marginBottom: 32 }}>Cette page n'existe pas.</p>
      <a href="." className="btn btn-dark">Retour a l'accueil</a>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <StoreProvider>
        <CartProvider>
          <Layout />
        </CartProvider>
      </StoreProvider>
    </BrowserRouter>
  )
}
