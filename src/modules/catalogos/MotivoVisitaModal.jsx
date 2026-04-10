import { useState, useEffect } from 'react'
import { createMotivoVisita, updateMotivoVisita } from './motivoVisitaService'

export default function MotivoVisitaModal({ show, onClose, onSaved, motivoVisita }) {
  const [nombre,  setNombre]  = useState('')
  const [activo,  setActivo]  = useState(1)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    if (motivoVisita) { setNombre(motivoVisita.nombre); setActivo(motivoVisita.activo) }
    else              { setNombre(''); setActivo(1) }
    setError(null)
  }, [motivoVisita, show])

  const handleSubmit = async () => {
    if (!nombre.trim()) return setError('El nombre es requerido')
    setLoading(true); setError(null)
    try {
      const payload = { id: motivoVisita ? motivoVisita.id : 0, nombre, activo: Number(activo) }
      motivoVisita ? await updateMotivoVisita(motivoVisita.id, payload) : await createMotivoVisita(payload)
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
              <h5 className="modal-title">{motivoVisita ? '✏️ Editar Motivo de Visita' : '🫂 Nuevo Motivo de Visita'}</h5>
              <button className="btn-close" onClick={onClose} />
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-danger py-2 mb-3"><i className="bi bi-exclamation-circle me-2" />{error}</div>}
              <div className="mb-3">
                <label className="form-label fw-semibold">Nombre</label>
                <input type="text" className="form-control" placeholder="Ej. Visita familiar" value={nombre} onChange={e => setNombre(e.target.value)} autoFocus />
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
                {loading ? <><span className="spinner-border spinner-border-sm me-2" />Guardando...</> : motivoVisita ? 'Guardar cambios' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}