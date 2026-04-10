import { useState, useEffect } from 'react'
import { createTipoContrato, updateTipoContrato } from './tipoContratoService'

export default function TipoContratoModal({ show, onClose, onSaved, tipoContrato }) {
  const [nombre,  setNombre]  = useState('')
  const [activo,  setActivo]  = useState(1)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    if (tipoContrato) { setNombre(tipoContrato.nombre); setActivo(tipoContrato.activo) }
    else              { setNombre(''); setActivo(1) }
    setError(null)
  }, [tipoContrato, show])

  const handleSubmit = async () => {
    if (!nombre.trim()) return setError('El nombre es requerido')
    setLoading(true); setError(null)
    try {
      const payload = { id: tipoContrato ? tipoContrato.id : 0, nombre, activo: Number(activo) }
      tipoContrato ? await updateTipoContrato(tipoContrato.id, payload) : await createTipoContrato(payload)
      onSaved()
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  if (!show) return null
  return (
    <>
      <div className="modal-backdrop fade show" onClick={onClose} />
      <div className="modal fade show d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{tipoContrato ? '✏️ Editar Tipo de Contrato' : '🧾 Nuevo Tipo de Contrato'}</h5>
              <button className="btn-close" onClick={onClose} />
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-danger py-2 mb-3"><i className="bi bi-exclamation-circle me-2" />{error}</div>}
              <div className="mb-3">
                <label className="form-label fw-semibold">Nombre</label>
                <input type="text" className="form-control" placeholder="Ej. Contrato indefinido" value={nombre} onChange={e => setNombre(e.target.value)} autoFocus />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Estado</label>
                <select className="form-select" value={activo} onChange={e => setActivo(e.target.value)}>
                  <option value={1}>Activo</option>
                  <option value={0}>Inactivo</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline-secondary" onClick={onClose} disabled={loading}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? <><span className="spinner-border spinner-border-sm me-2" />Guardando...</> : tipoContrato ? 'Guardar cambios' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

