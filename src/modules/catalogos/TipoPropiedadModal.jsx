import { useState, useEffect } from 'react'
import { createTipoPropiedad, updateTipoPropiedad } from './tipoPropiedadService'

export default function TipoPropiedadModal({ show, onClose, onSaved, tipoPropiedad }) {
  const [nombre,      setNombre]      = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState(null)

  useEffect(() => {
    if (tipoPropiedad) {
      setNombre(tipoPropiedad.nombre ?? '')
      setDescripcion(tipoPropiedad.descripcion ?? '')
    } else { setNombre(''); setDescripcion('') }
    setError(null)
  }, [tipoPropiedad, show])

  const handleSubmit = async () => {
    if (!nombre.trim()) return setError('El nombre es requerido')
    setLoading(true); setError(null)
    try {
      const payload = {
        id_tipo_propiedad: tipoPropiedad ? tipoPropiedad.id_tipo_propiedad : 0,
        nombre,
        descripcion
      }
      tipoPropiedad ? await updateTipoPropiedad(tipoPropiedad.id_tipo_propiedad, payload) : await createTipoPropiedad(payload)
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
              <h5 className="modal-title">{tipoPropiedad ? '✏️ Editar Tipo Propiedad' : '🏘️ Nuevo Tipo Propiedad'}</h5>
              <button className="btn-close" onClick={onClose} />
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-danger py-2 mb-3"><i className="bi bi-exclamation-circle me-2" />{error}</div>}
              <div className="mb-3">
                <label className="form-label fw-semibold">Nombre</label>
                <input className="form-control" placeholder="Ej. Apartamento" value={nombre}
                  onChange={e => setNombre(e.target.value)} autoFocus />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Descripción</label>
                <textarea className="form-control" rows={3} placeholder="Descripción opcional..."
                  value={descripcion} onChange={e => setDescripcion(e.target.value)} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline-secondary" onClick={onClose} disabled={loading}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? <><span className="spinner-border spinner-border-sm me-2" />Guardando...</> : tipoPropiedad ? 'Guardar cambios' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}