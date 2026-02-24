import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { fetchStoreData, writeStoreData, clearCache } from '../utils/sheets.js'

const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const [products, setProducts] = useState([])
  const [promos, setPromos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async (force = false) => {
    if (force) clearCache()
    setLoading(true)
    setError(null)
    try {
      const data = await fetchStoreData()
      setProducts(data.products || [])
      setPromos(data.promos || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const save = useCallback(async (payload, adminToken) => {
    await writeStoreData(payload, adminToken)
    if (payload.products) setProducts(payload.products)
    if (payload.promos) setPromos(payload.promos)
  }, [])

  return (
    <StoreContext.Provider value={{ products, promos, loading, error, reload: load, save }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be inside StoreProvider')
  return ctx
}
