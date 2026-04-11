import { useState, useEffect, useRef } from 'react'

/**
 * FkSelector — campo FK con botón que abre dropdown de selección
 *
 * Props:
 *   label       — etiqueta del campo
 *   required    — muestra asterisco rojo
 *   fetchFn     — función async que devuelve la lista (res.data o res.data.data)
 *   getId       — fn(item) => id
 *   getLabel    — fn(item) => texto visible
 *   value       — id seleccionado actualmente
 *   displayValue — texto visible actualmente
 *   onChange    — fn(id, label) => void
 *   placeholder — placeholder del input
 *   size        — 'sm' | '' (default '')
 */
export default function FkSelector({
  label, required, fetchFn, getId, getLabel,
  value, displayValue, onChange,
  placeholder = 'Selecciona...', size = 'sm'
}) {
  const [open,    setOpen]    = useState(false)
  const [items,   setItems]   = useState([])
  const [loading, setLoading] = useState(false)
  const [filter,  setFilter]  = useState('')
  const ref = useRef(null)

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleOpen = async () => {
    if (!open && items.length === 0) {
      setLoading(true)
      try {
        const res = await fetchFn()
        const lista = Array.isArray(res.data) ? res.data : res.data?.data ?? []
        console.log('primer item:', lista[0])
        setItems(lista)
      } catch { setItems([]) }
      finally { setLoading(false) }
    }
    setOpen(o => !o)
    setFilter('')
  }

  const handleSelect = (item) => {
    onChange(getId(item), getLabel(item))
    setOpen(false)
    setFilter('')
  }

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
          className={`form-control ${inputSize}`}
          style={{ cursor: 'pointer', backgroundColor: '#fff' }}
          value={displayValue || (value ? `#${value}` : '')}
          placeholder={placeholder}
          onClick={handleOpen}
        />
        {value && (
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
          title="Seleccionar"
        >
          <i className={`bi ${loading ? 'bi-arrow-repeat' : 'bi-search'}`} />
        </button>
      </div>
      <div className="form-text text-muted mt-0" style={{ fontSize: 10 }}>
        {value ? `ID: ${value}` : 'Ninguno seleccionado'}
      </div>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: 'absolute', top: '100%', left: 0, right: 0,
            zIndex: 1060, background: '#fff',
            border: '1px solid #dee2e6', borderRadius: 6,
            boxShadow: '0 4px 16px rgba(0,0,0,.12)',
            maxHeight: 280, display: 'flex', flexDirection: 'column'
          }}
        >
          {/* Buscador dentro del dropdown */}
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
                  background: getId(item) === value ? '#e8f0fe' : undefined,
                  borderBottom: '1px solid #f0f0f0'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
                onMouseLeave={e => e.currentTarget.style.background = getId(item) === value ? '#e8f0fe' : '#fff'}
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