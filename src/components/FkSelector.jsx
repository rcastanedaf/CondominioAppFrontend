import { useState, useEffect, useRef } from 'react'

export default function FkSelector({
  label, required, fetchFn, getId, getLabel,
  value, displayValue, onChange,
  placeholder = 'Selecciona...', size = 'sm', invalid = false, disabled = false
}) {
  const [open,    setOpen]    = useState(false)
  const [items,   setItems]   = useState([])
  const [loading, setLoading] = useState(false)
  const [filter,  setFilter]  = useState('')
  const ref       = useRef(null)
  const loadedRef = useRef(false)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Carga en background cuando hay value sin displayValue para resolver el nombre
  useEffect(() => {
    if (value && !displayValue && items.length === 0 && !loadedRef.current) {
      loadedRef.current = true
      setLoading(true)
      fetchFn()
        .then(res => {
          const lista = Array.isArray(res.data) ? res.data : res.data?.data ?? res.data?.Data ?? []
          setItems(lista)
        })
        .catch(() => {})
        .finally(() => setLoading(false))
    }
  }, [value, displayValue]) // eslint-disable-line

  const handleOpen = async () => {
    if (disabled) return
    if (!open && items.length === 0) {
      loadedRef.current = true
      setLoading(true)
      try {
        const res = await fetchFn()
        const lista = Array.isArray(res.data) ? res.data : res.data?.data ?? res.data?.Data ?? []
        setItems(lista)
      } catch (e) {
        setItems([])
      } finally {
        setLoading(false)
      }
    }
    setOpen(o => !o)
    setFilter('')
  }

  const handleSelect = (item) => {
    onChange(getId(item), getLabel(item), item)
    setOpen(false)
    setFilter('')
  }

  // Texto visible: label explícito → buscar nombre en items → fallback #ID
  const resolvedLabel = displayValue
    || (value && items.length > 0
      ? (() => {
          const found = items.find(i => String(getId(i)) === String(value))
          return found ? getLabel(found) : `#${value}`
        })()
      : value ? `#${value}` : '')

  const filtered = items.filter(i =>
    getLabel(i).toLowerCase().includes(filter.toLowerCase()) ||
    String(getId(i)).includes(filter)
  )

  const inputSize = size === 'sm' ? 'form-control-sm' : ''
  const btnSize   = size === 'sm' ? 'btn-sm' : ''

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {label && (
        <label className="form-label fw-semibold" style={{ fontSize: 13 }}>
          {label}{required && <span className="text-danger ms-1">*</span>}
        </label>
      )}
      <div className="input-group" style={{ flexWrap: 'nowrap' }}>
        <input
          readOnly
          className={`form-control ${inputSize}${invalid ? ' is-invalid' : ''}${disabled ? ' bg-light' : ''}`}
          style={{ cursor: disabled ? 'not-allowed' : 'pointer', backgroundColor: disabled ? '#f8f9fa' : '#fff' }}
          value={disabled ? '' : resolvedLabel}
          placeholder={disabled ? 'Selecciona un residente primero' : placeholder}
          onClick={handleOpen}
        />
        {value && !disabled && (
          <button
            type="button"
            className={`btn btn-outline-secondary ${btnSize}`}
            onClick={() => onChange('', '')}
            title="Limpiar"
          >
            <i className="bi bi-x" />
          </button>
        )}
        <button
          type="button"
          className={`btn btn-outline-primary ${btnSize}`}
          onClick={handleOpen}
          disabled={disabled}
          title="Seleccionar"
        >
          <i className={`bi ${loading ? 'bi-arrow-repeat' : 'bi-search'}`} />
        </button>
      </div>
      <div className="form-text text-muted mt-0" style={{ fontSize: 10 }}>
        {value ? `ID: ${value}` : 'Ninguno seleccionado'}
      </div>

      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0,
          zIndex: 1060, background: '#fff',
          border: '1px solid #dee2e6', borderRadius: 6,
          boxShadow: '0 4px 16px rgba(0,0,0,.12)',
          maxHeight: 280, display: 'flex', flexDirection: 'column'
        }}>
          <div className="p-2 border-bottom">
            <input
              autoFocus
              className="form-control form-control-sm"
              placeholder="Buscar..."
              value={filter}
              onChange={e => setFilter(e.target.value)}
            />
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {loading ? (
              <div className="text-center py-3 text-muted" style={{ fontSize: 13 }}>
                <span className="spinner-border spinner-border-sm me-2" />Cargando...
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-3 text-muted" style={{ fontSize: 13 }}>
                <i className="bi bi-inbox me-1" />Sin resultados
              </div>
            ) : filtered.map((item, idx) => (
              <div
                key={`fk-${getId(item) ?? idx}`}
                onClick={() => handleSelect(item)}
                style={{
                  padding: '7px 12px', cursor: 'pointer', fontSize: 13,
                  background: String(getId(item)) === String(value) ? '#e8f0fe' : undefined,
                  borderBottom: '1px solid #f0f0f0'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
                onMouseLeave={e => e.currentTarget.style.background = String(getId(item)) === String(value) ? '#e8f0fe' : '#fff'}
              >
                <span className="text-muted me-2" style={{ fontSize: 11 }}>#{getId(item)}</span>
                {getLabel(item)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
