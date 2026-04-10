import { useState, useEffect } from 'react'
import { createConceptoDescuento, updateConceptoDescuento } from './conceptoDescuentoService'

export default function ConceptoDescuentoModal({ show, onClose, onSaved, concepto }) {
  const [nombre,       setNombre]       = useState('')
  const [tipo,         setTipo]         = useState('')
  const [valor,        setValor]        = useState('')
  const [autorizacion, setAutorizacion] = useState(0)
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState(null)

  useEffect(() => {
    if (concepto) {
      setNombre(concepto.nombre)
      setTipo(concepto.tipo)
      setValor(concepto.valor)
      setAutorizacion(concepto.autorizacion)
    } else {
      setNombre('')
      setTipo('')
      setValor('')
      setAutorizacion(0)
    }
    setError(null)
  }, [concepto, show])

  const handleSubmit = async () => {
    if (!nombre.trim()) {
      setError('El nombre es requerido')
      return
    }
    if (!tipo.trim()) {
      setError('El tipo es requerido')
      return
    }
    if (valor === '' || isNaN(valor)) {
      setError('El valor debe ser un número')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const payload = {
        id:           concepto ? concepto.id : 0,
        nombre,
        tipo,
        valor:        Number(valor),
        autorizacion: Number(autorizacion),
      }

      if (concepto) {
        await updateConceptoDescuento(concepto.id, payload)
      } else {
        await createConceptoDescuento(payload)
      }
      onSaved()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!show) return null

  return (
    <>
      <div className="modal-backdrop fade show" onClick={onClose} />
      <div className="modal fade show d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">

            <div className="modal-header">
              <h5 className="modal-title">
                {concepto ? '✏️ Editar Concepto Descuento' : '📉 Nuevo Concepto Descuento'}
              </h5>
              <button className="btn-close" onClick={onClose} />
            </div>

            <div className="modal-body">
              {error && (
                <div className="alert alert-danger py-2 mb-3">
                  <i className="bi bi-exclamation-circle me-2" />
                  {error}
                </div>
              )}

              {/* Nombre */}
              <div className="mb-3">
                <label className="form-label fw-semibold">Nombre</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ej. Descuento empleado"
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  autoFocus
                />
              </div>

              {/* Tipo */}
              <div className="mb-3">
                <label className="form-label fw-semibold">Tipo</label>
                <select
                  className="form-select"
                  value={tipo}
                  onChange={e => setTipo(e.target.value)}
                >
                  <option value="">Seleccionar tipo...</option>
                  <option value="PORCENTAJE">Porcentaje</option>
                  <option value="FIJO">Monto fijo</option>
                </select>
              </div>

              {/* Valor */}
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Valor {tipo === 'PORCENTAJE' ? '(%)' : tipo === 'FIJO' ? '(Q)' : ''}
                </label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  value={valor}
                  onChange={e => setValor(e.target.value)}
                />
              </div>

              {/* Autorización */}
              <div className="mb-3">
                <label className="form-label fw-semibold">Autorización</label>
                <select
                  className="form-select"
                  value={autorizacion}
                  onChange={e => setAutorizacion(e.target.value)}
                >
                  <option value={1}>Requiere autorización</option>
                  <option value={0}>No requiere autorización</option>
                </select>
              </div>

            </div>

            <div className="modal-footer">
              <button className="btn btn-outline-secondary" onClick={onClose} disabled={loading}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading
                  ? <><span className="spinner-border spinner-border-sm me-2" />Guardando...</>
                  : concepto ? 'Guardar cambios' : 'Crear'
                }
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}