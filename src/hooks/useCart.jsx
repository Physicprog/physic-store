import { createContext, useContext, useState, useCallback } from 'react'
import { getFinalPrice, validatePromo } from '../utils/sheets.js'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState([])
  const [promoCode, setPromoCode] = useState(null)
  const [promoDiscount, setPromoDiscount] = useState(0)
  const [promoError, setPromoError] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const add = useCallback((product) => {
    setItems(prev => prev.find(i => i.id === product.id) ? prev : [...prev, { ...product }])
    setIsOpen(true)
  }, [])

  const remove = useCallback((id) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }, [])

  const clear = useCallback(() => {
    setItems([])
    setPromoCode(null)
    setPromoDiscount(0)
    setPromoError('')
  }, [])

  const subtotal = items.reduce((s, i) => s + getFinalPrice(i), 0)
  const total = Math.max(0, subtotal - promoDiscount)

  const applyPromo = useCallback((code, promos) => {
    setPromoError('')
    if (!code.trim()) { setPromoCode(null); setPromoDiscount(0); return null }
    const result = validatePromo(promos, code, subtotal)
    if (result.valid) {
      setPromoCode({ code: code.trim().toUpperCase(), ...result })
      setPromoDiscount(result.discount)
    } else {
      setPromoError(result.error)
      setPromoCode(null)
      setPromoDiscount(0)
    }
    return result
  }, [subtotal])

  const removePromo = useCallback(() => {
    setPromoCode(null); setPromoDiscount(0); setPromoError('')
  }, [])

  return (
    <CartContext.Provider value={{
      items, add, remove, clear,
      subtotal, total,
      promoCode, promoDiscount, promoError,
      applyPromo, removePromo,
      isOpen, setIsOpen,
      count: items.length,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be inside CartProvider')
  return ctx
}
