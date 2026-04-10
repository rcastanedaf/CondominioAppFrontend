import { useState, useEffect } from 'react'
import { getBancos } from './bancoService'

export function useCatalogos() {
  const [rows, setRows]       = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    setLoading(true)
    getBancos()
      .then(data => setRows(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return { rows, loading, error, setRows }
}
